import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import ExcelJS from 'exceljs';
import {
  EvaluationActionItem,
  matchActionItems,
  normalizeEvaluationText,
} from './evaluate-action-item-extraction';

type AnnotationRecord = {
  transcriptId: string;
  meetingType: string;
  actionItems: EvaluationActionItem[];
};
const round = (value: number) => Number(value.toFixed(4));
const divide = (a: number, b: number) => (b === 0 ? 0 : a / b);
const csvCell = (value: unknown) => {
  const text = value == null ? '' : String(value);
  return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
};
const toCsv = (rows: Record<string, unknown>[]) => {
  if (!rows.length) return '';
  const headers = Object.keys(rows[0]);
  return [
    headers.join(','),
    ...rows.map((row) => headers.map((key) => csvCell(row[key])).join(',')),
  ].join('\n');
};

async function readAnnotations(path: string): Promise<AnnotationRecord[]> {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(path);
  const sheet = workbook.getWorksheet('Gán nhãn');
  if (!sheet) throw new Error(`Không tìm thấy sheet "Gán nhãn" trong ${path}`);
  const records: AnnotationRecord[] = [];
  sheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return;
    const transcriptId = String(row.getCell(1).value ?? '').trim();
    if (!transcriptId) return;
    const raw = String(row.getCell(8).value ?? '').trim();
    if (!raw)
      throw new Error(
        `${path}: ${transcriptId} chưa được gán nhãn. Nhập [] nếu không có Action Item.`,
      );
    let actionItems: EvaluationActionItem[];
    try {
      actionItems = JSON.parse(raw) as EvaluationActionItem[];
    } catch (error) {
      throw new Error(
        `${path}: JSON của ${transcriptId} không hợp lệ: ${error instanceof Error ? error.message : error}`,
      );
    }
    if (
      !Array.isArray(actionItems) ||
      actionItems.some((item) => !item || typeof item.text !== 'string')
    )
      throw new Error(
        `${path}: ${transcriptId} phải là mảng Action Item có trường text.`,
      );
    records.push({
      transcriptId,
      meetingType: String(row.getCell(2).value ?? ''),
      actionItems,
    });
  });
  return records;
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
    process.env.ANNOTATION_AGREEMENT_OUTPUT ?? join(base, 'agreement.json'),
  );
  const disagreementPath = resolve(
    process.env.ANNOTATION_DISAGREEMENTS_OUTPUT ??
      join(base, 'disagreements.csv'),
  );
  const threshold = Number(process.env.EVAL_MATCH_THRESHOLD ?? 0.5);
  const [aRecords, bRecords] = await Promise.all([
    readAnnotations(annotatorAPath),
    readAnnotations(annotatorBPath),
  ]);
  const bById = new Map(
    bRecords.map((record) => [record.transcriptId, record]),
  );
  let countA = 0,
    countB = 0,
    matched = 0,
    assigneeAgreement = 0,
    dueDateAgreement = 0;
  const disagreements: Record<string, unknown>[] = [];
  for (const a of aRecords) {
    const b = bById.get(a.transcriptId);
    if (!b) throw new Error(`Annotator B thiếu ${a.transcriptId}.`);
    const pairs = matchActionItems(a.actionItems, b.actionItems, threshold);
    const usedA = new Set(pairs.map((pair) => pair.truthIndex));
    const usedB = new Set(pairs.map((pair) => pair.predictionIndex));
    countA += a.actionItems.length;
    countB += b.actionItems.length;
    matched += pairs.length;
    for (const pair of pairs) {
      const itemA = a.actionItems[pair.truthIndex],
        itemB = b.actionItems[pair.predictionIndex];
      const sameAssignee =
        normalizeEvaluationText(itemA.assigneeName) ===
        normalizeEvaluationText(itemB.assigneeName);
      const sameDate = (itemA.dueDate ?? null) === (itemB.dueDate ?? null);
      assigneeAgreement += Number(sameAssignee);
      dueDateAgreement += Number(sameDate);
      if (!sameAssignee || !sameDate)
        disagreements.push({
          transcriptId: a.transcriptId,
          meetingType: a.meetingType,
          type: 'FIELD_MISMATCH',
          annotatorAText: itemA.text,
          annotatorBText: itemB.text,
          annotatorAAssignee: itemA.assigneeName ?? '',
          annotatorBAssignee: itemB.assigneeName ?? '',
          annotatorADueDate: itemA.dueDate ?? '',
          annotatorBDueDate: itemB.dueDate ?? '',
        });
    }
    a.actionItems.forEach((item, index) => {
      if (!usedA.has(index))
        disagreements.push({
          transcriptId: a.transcriptId,
          meetingType: a.meetingType,
          type: 'ONLY_ANNOTATOR_A',
          annotatorAText: item.text,
          annotatorBText: '',
          annotatorAAssignee: item.assigneeName ?? '',
          annotatorBAssignee: '',
          annotatorADueDate: item.dueDate ?? '',
          annotatorBDueDate: '',
        });
    });
    b.actionItems.forEach((item, index) => {
      if (!usedB.has(index))
        disagreements.push({
          transcriptId: a.transcriptId,
          meetingType: a.meetingType,
          type: 'ONLY_ANNOTATOR_B',
          annotatorAText: '',
          annotatorBText: item.text,
          annotatorAAssignee: '',
          annotatorBAssignee: item.assigneeName ?? '',
          annotatorADueDate: '',
          annotatorBDueDate: item.dueDate ?? '',
        });
    });
  }
  if (bRecords.length !== aRecords.length)
    throw new Error('Hai workbook không có cùng số transcript.');
  const precision = divide(matched, countA),
    recall = divide(matched, countB);
  const report = {
    measuredAt: new Date().toISOString(),
    matchThreshold: threshold,
    transcriptCount: aRecords.length,
    annotatorAActionItems: countA,
    annotatorBActionItems: countB,
    matchedActionItems: matched,
    actionItemSetAgreement: {
      precision: round(precision),
      recall: round(recall),
      f1: round(divide(2 * precision * recall, precision + recall)),
    },
    matchedFieldAgreement: {
      assignee: round(divide(assigneeAgreement, matched)),
      dueDate: round(divide(dueDateAgreement, matched)),
    },
    disagreementCount: disagreements.length,
    interpretation:
      'Phân xử toàn bộ disagreements.csv trước khi đổi dataset thành HUMAN_VERIFIED.',
  };
  mkdirSync(dirname(outputPath), { recursive: true });
  mkdirSync(dirname(disagreementPath), { recursive: true });
  writeFileSync(outputPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
  writeFileSync(disagreementPath, `${toCsv(disagreements)}\n`, 'utf8');
  console.log(JSON.stringify(report, null, 2));
}
main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
