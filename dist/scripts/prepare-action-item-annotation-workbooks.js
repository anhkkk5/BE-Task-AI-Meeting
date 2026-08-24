"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_fs_1 = require("node:fs");
const node_path_1 = require("node:path");
const exceljs_1 = __importDefault(require("exceljs"));
const readJsonLines = (path) => (0, node_fs_1.readFileSync)(path, 'utf8')
    .split(/\r?\n/)
    .filter(Boolean)
    .map((line) => JSON.parse(line));
async function createWorkbook(annotator, records, outputPath, prefillReference) {
    const workbook = new exceljs_1.default.Workbook();
    workbook.creator = 'AgileFlow AI evaluation pipeline';
    const instructions = workbook.addWorksheet('Hướng dẫn');
    instructions.columns = [
        { header: 'Mục', key: 'item', width: 28 },
        { header: 'Nội dung', key: 'content', width: 110 },
    ];
    instructions.addRows([
        { item: 'Người gán nhãn', content: annotator },
        {
            item: 'Nguyên tắc',
            content: 'Đọc toàn bộ transcript và tự xác định Action Item. Không xem nhãn của người còn lại.',
        },
        {
            item: 'actionItemsJson',
            content: '[{"text":"...","assigneeName":null,"assigneeUserId":null,"dueDate":"YYYY-MM-DD hoặc null","status":"OPEN","source":"câu bằng chứng"}]',
        },
        { item: 'Không có Action Item', content: 'Nhập []' },
        {
            item: 'Không chắc chắn',
            content: 'Vẫn nhập phương án tốt nhất và ghi lý do vào annotationNote.',
        },
        {
            item: 'Lưu ý',
            content: prefillReference
                ? 'WORKBOOK KIỂM TRA PIPELINE: đã điền nhãn tham chiếu, không dùng làm gán nhãn độc lập.'
                : 'Không thay đổi transcriptId và các cột dữ liệu nguồn.',
        },
    ]);
    instructions.getRow(1).font = { bold: true };
    const sheet = workbook.addWorksheet('Gán nhãn');
    sheet.columns = [
        { header: 'transcriptId', key: 'transcriptId', width: 18 },
        { header: 'meetingType', key: 'meetingType', width: 24 },
        { header: 'meetingDate', key: 'meetingDate', width: 14 },
        { header: 'workspaceId', key: 'workspaceId', width: 18 },
        { header: 'projectId', key: 'projectId', width: 18 },
        { header: 'sprintId', key: 'sprintId', width: 18 },
        { header: 'rawTranscript', key: 'rawTranscript', width: 100 },
        { header: 'actionItemsJson', key: 'actionItemsJson', width: 100 },
        { header: 'annotationNote', key: 'annotationNote', width: 45 },
    ];
    for (const record of records)
        sheet.addRow({
            transcriptId: record.transcriptId,
            meetingType: record.meetingType,
            meetingDate: record.meetingDate,
            workspaceId: record.workspaceId,
            projectId: record.projectId,
            sprintId: record.sprintId,
            rawTranscript: record.transcript.rawTranscript,
            actionItemsJson: prefillReference
                ? JSON.stringify(record.groundTruth.actionItems)
                : '',
            annotationNote: '',
        });
    sheet.views = [{ state: 'frozen', ySplit: 1 }];
    sheet.autoFilter = { from: 'A1', to: 'I1' };
    sheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    sheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF315EFB' },
    };
    sheet.eachRow((row, rowNumber) => {
        if (rowNumber > 1)
            row.height = 100;
        row.alignment = { vertical: 'top', wrapText: true };
    });
    await workbook.xlsx.writeFile(outputPath);
}
async function main() {
    const datasetPath = (0, node_path_1.resolve)(process.env.ANNOTATION_DATASET_PATH ??
        (0, node_path_1.join)('datasets', 'action-item-evaluation', 'v1', 'transcripts.jsonl'));
    const outputDirectory = (0, node_path_1.resolve)(process.env.ANNOTATION_OUTPUT_DIR ??
        (0, node_path_1.join)('datasets', 'action-item-evaluation', 'v1', 'annotation'));
    const split = process.env.ANNOTATION_SPLIT ?? 'test';
    const prefillReference = process.env.ANNOTATION_PREFILL_REFERENCE === 'YES';
    const records = readJsonLines(datasetPath).filter((record) => split === 'all' || record.split === split);
    (0, node_fs_1.mkdirSync)(outputDirectory, { recursive: true });
    await Promise.all([
        createWorkbook('Annotator A', records, (0, node_path_1.join)(outputDirectory, 'annotator-a.xlsx'), prefillReference),
        createWorkbook('Annotator B', records, (0, node_path_1.join)(outputDirectory, 'annotator-b.xlsx'), prefillReference),
    ]);
    console.log(`Đã tạo 2 workbook, mỗi file ${records.length} transcript tại ${outputDirectory}.`);
    if (prefillReference)
        console.log('CẢNH BÁO: Đây là workbook kiểm tra pipeline, không phải gán nhãn độc lập.');
}
main().catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
});
//# sourceMappingURL=prepare-action-item-annotation-workbooks.js.map