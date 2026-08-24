import { existsSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import ExcelJS from 'exceljs';

type AnnotationRow = {
  transcriptId: string;
  meetingType: string;
  rawTranscript: string;
  actionItemsJson: string;
  note: string;
};

async function readWorkbook(path: string): Promise<AnnotationRow[]> {
  if (!existsSync(path)) throw new Error(`Không tìm thấy workbook: ${path}`);
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(path);
  const sheet = workbook.getWorksheet('Gán nhãn');
  if (!sheet) throw new Error(`Không tìm thấy sheet "Gán nhãn" trong ${path}`);

  const rows: AnnotationRow[] = [];
  sheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return;
    const transcriptId = String(row.getCell(1).value ?? '').trim();
    if (!transcriptId) return;
    const actionItemsJson = String(row.getCell(8).value ?? '').trim();
    if (!actionItemsJson) {
      throw new Error(`${path}: ${transcriptId} chưa được gán nhãn.`);
    }
    try {
      const parsed = JSON.parse(actionItemsJson);
      if (!Array.isArray(parsed)) throw new Error('không phải mảng');
    } catch (error) {
      throw new Error(
        `${path}: JSON của ${transcriptId} không hợp lệ: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    }
    rows.push({
      transcriptId,
      meetingType: String(row.getCell(2).value ?? ''),
      rawTranscript: String(row.getCell(7).value ?? ''),
      actionItemsJson,
      note: String(row.getCell(9).value ?? ''),
    });
  });
  return rows;
}

function canonicalJson(value: string): string {
  return JSON.stringify(JSON.parse(value));
}

async function main() {
  const base = join('datasets', 'action-item-evaluation', 'v1', 'annotation');
  const annotatorAPath = resolve(
    process.env.ANNOTATOR_A_PATH ?? join(base, 'annotator-a.xlsx'),
  );
  const annotatorBPath = resolve(
    process.env.ANNOTATOR_B_PATH ?? join(base, 'annotator-b.xlsx'),
  );
  const outputPath = resolve(
    process.env.ANNOTATION_ADJUDICATION_PATH ?? join(base, 'adjudication.xlsx'),
  );
  const [rowsA, rowsB] = await Promise.all([
    readWorkbook(annotatorAPath),
    readWorkbook(annotatorBPath),
  ]);
  const byIdB = new Map(rowsB.map((row) => [row.transcriptId, row]));
  if (rowsA.length !== rowsB.length) {
    throw new Error('Hai workbook không có cùng số transcript.');
  }

  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'AgileFlow AI evaluation pipeline';
  const guide = workbook.addWorksheet('Hướng dẫn');
  guide.addRows([
    ['WORKBOOK PHÂN XỬ GROUND TRUTH'],
    ['1. Người phân xử đọc transcript và hai nhãn độc lập.'],
    ['2. Cột finalActionItemsJson đã được điền sẵn nếu A và B giống hệt nhau.'],
    ['3. Với dòng bất đồng, nhập mảng JSON cuối cùng sau khi phân xử.'],
    ['4. Đặt adjudicationStatus=APPROVED cho mọi dòng đã duyệt.'],
    ['5. Không dùng REFERENCE_PREFILL hoặc dữ liệu oracle làm nhãn con người.'],
  ]);
  guide.getColumn(1).width = 110;
  guide.getRow(1).font = { bold: true, size: 14 };

  const sheet = workbook.addWorksheet('Phân xử');
  sheet.columns = [
    { header: 'transcriptId', key: 'transcriptId', width: 18 },
    { header: 'meetingType', key: 'meetingType', width: 24 },
    { header: 'rawTranscript', key: 'rawTranscript', width: 80 },
    { header: 'annotatorAJson', key: 'annotatorAJson', width: 65 },
    { header: 'annotatorBJson', key: 'annotatorBJson', width: 65 },
    { header: 'annotatorANote', key: 'annotatorANote', width: 30 },
    { header: 'annotatorBNote', key: 'annotatorBNote', width: 30 },
    { header: 'finalActionItemsJson', key: 'finalActionItemsJson', width: 70 },
    { header: 'adjudicationStatus', key: 'adjudicationStatus', width: 22 },
    { header: 'adjudicationNote', key: 'adjudicationNote', width: 40 },
  ];

  for (const rowA of rowsA) {
    const rowB = byIdB.get(rowA.transcriptId);
    if (!rowB) throw new Error(`Annotator B thiếu ${rowA.transcriptId}.`);
    const identical =
      canonicalJson(rowA.actionItemsJson) ===
      canonicalJson(rowB.actionItemsJson);
    sheet.addRow({
      transcriptId: rowA.transcriptId,
      meetingType: rowA.meetingType,
      rawTranscript: rowA.rawTranscript,
      annotatorAJson: rowA.actionItemsJson,
      annotatorBJson: rowB.actionItemsJson,
      annotatorANote: rowA.note,
      annotatorBNote: rowB.note,
      finalActionItemsJson: identical ? rowA.actionItemsJson : '',
      adjudicationStatus: 'PENDING',
      adjudicationNote: identical
        ? 'Hai nhãn giống hệt; vẫn cần người phân xử xác nhận.'
        : '',
    });
  }

  sheet.views = [{ state: 'frozen', ySplit: 1 }];
  sheet.autoFilter = { from: 'A1', to: 'J1' };
  sheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
  sheet.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF315EFB' },
  };
  sheet.eachRow((row, rowNumber) => {
    if (rowNumber > 1) row.alignment = { vertical: 'top', wrapText: true };
  });
  for (let rowNumber = 2; rowNumber <= rowsA.length + 1; rowNumber += 1) {
    sheet.getCell(`I${rowNumber}`).dataValidation = {
      type: 'list',
      allowBlank: false,
      formulae: ['"PENDING,APPROVED,REJECTED"'],
    };
  }

  await workbook.xlsx.writeFile(outputPath);
  console.log(
    `Đã tạo workbook phân xử ${rowsA.length} transcript tại ${outputPath}`,
  );
  console.log(
    'Mọi dòng đang PENDING; người phân xử phải đổi sang APPROVED thủ công.',
  );
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
