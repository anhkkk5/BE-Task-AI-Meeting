"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_fs_1 = require("node:fs");
const node_path_1 = require("node:path");
const exceljs_1 = __importDefault(require("exceljs"));
function readJsonLines(path) {
    return (0, node_fs_1.readFileSync)(path, 'utf8')
        .split(/\r?\n/)
        .filter((line) => line.trim())
        .map((line) => JSON.parse(line));
}
async function createWorkbook(outputPath, records, predictions, evaluator) {
    const workbook = new exceljs_1.default.Workbook();
    workbook.creator = 'AgileFlow AI summary evaluation';
    const guide = workbook.addWorksheet('Hướng dẫn');
    guide.addRows([
        [`PHIẾU ĐÁNH GIÁ SUMMARY - ${evaluator}`],
        ['Mỗi tiêu chí chấm từ 1 (rất kém) đến 5 (rất tốt).'],
        [
            'Faithfulness: mọi thông tin trong Summary được transcript hỗ trợ, không bịa.',
        ],
        ['Coverage: bao phủ đủ quyết định, vấn đề và kết quả chính.'],
        ['Coherence: trình bày mạch lạc, dễ hiểu, có cấu trúc.'],
        ['Conciseness: ngắn gọn, không lặp hoặc chứa chi tiết ngoài lề.'],
        ['Overall: chất lượng tổng thể và mức hữu ích đối với người dùng dự án.'],
        ['HallucinationCount: số phát biểu không có căn cứ trong transcript.'],
        ['Đánh giá độc lập; không xem file của người còn lại.'],
    ]);
    guide.getColumn(1).width = 110;
    guide.getRow(1).font = { bold: true, size: 14 };
    const sheet = workbook.addWorksheet('Đánh giá');
    sheet.columns = [
        { header: 'transcriptId', key: 'transcriptId', width: 18 },
        { header: 'meetingType', key: 'meetingType', width: 24 },
        { header: 'meetingDate', key: 'meetingDate', width: 16 },
        { header: 'rawTranscript', key: 'rawTranscript', width: 80 },
        { header: 'generatedSummary', key: 'generatedSummary', width: 70 },
        { header: 'model', key: 'model', width: 24 },
        { header: 'faithfulness_1_5', key: 'faithfulness', width: 20 },
        { header: 'coverage_1_5', key: 'coverage', width: 18 },
        { header: 'coherence_1_5', key: 'coherence', width: 18 },
        { header: 'conciseness_1_5', key: 'conciseness', width: 20 },
        { header: 'overall_1_5', key: 'overall', width: 16 },
        { header: 'hallucinationCount', key: 'hallucinationCount', width: 22 },
        { header: 'evaluatorNote', key: 'evaluatorNote', width: 40 },
    ];
    for (const record of records) {
        const prediction = predictions.get(record.transcriptId);
        sheet.addRow({
            transcriptId: record.transcriptId,
            meetingType: record.meetingType,
            meetingDate: record.meetingDate,
            rawTranscript: record.transcript.rawTranscript,
            generatedSummary: prediction?.summary ?? prediction?.generatedSummary ?? '',
            model: prediction?.model ?? '',
        });
    }
    sheet.views = [{ state: 'frozen', ySplit: 1 }];
    sheet.autoFilter = { from: 'A1', to: 'M1' };
    sheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    sheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF315EFB' },
    };
    sheet.eachRow((row, rowNumber) => {
        if (rowNumber > 1)
            row.alignment = { vertical: 'top', wrapText: true };
    });
    for (let row = 2; row <= records.length + 1; row += 1) {
        for (const column of ['G', 'H', 'I', 'J', 'K']) {
            sheet.getCell(`${column}${row}`).dataValidation = {
                type: 'whole',
                operator: 'between',
                allowBlank: true,
                formulae: [1, 5],
            };
        }
        sheet.getCell(`L${row}`).dataValidation = {
            type: 'whole',
            operator: 'greaterThanOrEqual',
            allowBlank: true,
            formulae: [0],
        };
    }
    (0, node_fs_1.mkdirSync)((0, node_path_1.dirname)(outputPath), { recursive: true });
    await workbook.xlsx.writeFile(outputPath);
}
async function main() {
    const datasetPath = (0, node_path_1.resolve)(process.env.SUMMARY_EVAL_DATASET_PATH ??
        (0, node_path_1.join)('datasets', 'action-item-evaluation', 'v1', 'transcripts.jsonl'));
    const predictionPath = (0, node_path_1.resolve)(process.env.SUMMARY_EVAL_PREDICTIONS_PATH ??
        (0, node_path_1.join)('datasets', 'summary-evaluation', 'v1', 'predictions.jsonl'));
    const outputDirectory = (0, node_path_1.resolve)(process.env.SUMMARY_EVAL_OUTPUT_DIR ??
        (0, node_path_1.join)('datasets', 'summary-evaluation', 'v1', 'human-rating'));
    const split = process.env.SUMMARY_EVAL_SPLIT ?? 'test';
    const records = readJsonLines(datasetPath).filter((record) => split === 'all' || record.split === split);
    const predictionRecords = (0, node_fs_1.existsSync)(predictionPath)
        ? readJsonLines(predictionPath)
        : [];
    const predictions = new Map(predictionRecords.map((prediction) => [
        prediction.transcriptId,
        prediction,
    ]));
    await Promise.all([
        createWorkbook((0, node_path_1.join)(outputDirectory, 'evaluator-a.xlsx'), records, predictions, 'A'),
        createWorkbook((0, node_path_1.join)(outputDirectory, 'evaluator-b.xlsx'), records, predictions, 'B'),
    ]);
    console.log(`Đã tạo 2 phiếu đánh giá Summary, mỗi phiếu ${records.length} transcript.`);
    if (!predictionRecords.length) {
        console.log('Chưa có predictions.jsonl: cột generatedSummary đang để trống.');
    }
}
main().catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
});
//# sourceMappingURL=prepare-summary-evaluation-workbooks.js.map