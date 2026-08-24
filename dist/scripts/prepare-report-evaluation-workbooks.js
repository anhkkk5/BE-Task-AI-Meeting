"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_fs_1 = require("node:fs");
const node_path_1 = require("node:path");
const exceljs_1 = __importDefault(require("exceljs"));
const readJsonl = (path) => (0, node_fs_1.readFileSync)(path, 'utf8')
    .split(/\r?\n/)
    .filter(Boolean)
    .map((line) => JSON.parse(line));
async function create(path, cases, predictions, evaluator) {
    const workbook = new exceljs_1.default.Workbook();
    const guide = workbook.addWorksheet('Hướng dẫn');
    guide.addRows([
        [`PHIẾU ĐÁNH GIÁ AI REPORT - EVALUATOR ${evaluator}`],
        ['Chấm độc lập từ 1 (rất kém) đến 5 (rất tốt).'],
        ['Factuality: số liệu và nhận định đúng sourceData.'],
        ['Completeness: bao phủ requiredFacts quan trọng.'],
        ['Actionability: đề xuất cụ thể, thực hiện được.'],
        ['Consistency: không tự mâu thuẫn hoặc trái forbiddenClaims.'],
        ['Clarity: rõ ràng, có cấu trúc, phù hợp báo cáo dự án.'],
        ['unsupportedClaimCount: số phát biểu không có nguồn hỗ trợ.'],
    ]);
    guide.getColumn(1).width = 110;
    guide.getRow(1).font = { bold: true, size: 14 };
    const sheet = workbook.addWorksheet('Đánh giá');
    sheet.columns = [
        { header: 'caseId', key: 'caseId', width: 20 },
        { header: 'scenario', key: 'scenario', width: 28 },
        { header: 'sourceDataJson', key: 'source', width: 70 },
        { header: 'requiredFacts', key: 'facts', width: 60 },
        { header: 'forbiddenClaims', key: 'forbidden', width: 55 },
        { header: 'generatedReport', key: 'report', width: 75 },
        { header: 'model', key: 'model', width: 22 },
        { header: 'factuality_1_5', key: 'factuality', width: 18 },
        { header: 'completeness_1_5', key: 'completeness', width: 20 },
        { header: 'actionability_1_5', key: 'actionability', width: 20 },
        { header: 'consistency_1_5', key: 'consistency', width: 20 },
        { header: 'clarity_1_5', key: 'clarity', width: 16 },
        { header: 'unsupportedClaimCount', key: 'unsupported', width: 24 },
        { header: 'evaluatorNote', key: 'note', width: 40 },
    ];
    for (const item of cases) {
        const prediction = predictions.get(item.caseId);
        sheet.addRow({
            caseId: item.caseId,
            scenario: item.scenario,
            source: JSON.stringify(item.sourceData),
            facts: item.groundTruth.requiredFacts.join('\n'),
            forbidden: item.groundTruth.forbiddenClaims.join('\n'),
            report: prediction?.report ?? prediction?.generatedReport ?? '',
            model: prediction?.model ?? '',
        });
    }
    sheet.views = [{ state: 'frozen', ySplit: 1 }];
    sheet.autoFilter = { from: 'A1', to: 'N1' };
    sheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    sheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF315EFB' },
    };
    sheet.eachRow((row, n) => {
        if (n > 1)
            row.alignment = { vertical: 'top', wrapText: true };
    });
    for (let row = 2; row <= cases.length + 1; row += 1) {
        for (const column of ['H', 'I', 'J', 'K', 'L']) {
            sheet.getCell(`${column}${row}`).dataValidation = {
                type: 'whole',
                operator: 'between',
                allowBlank: true,
                formulae: [1, 5],
            };
        }
        sheet.getCell(`M${row}`).dataValidation = {
            type: 'whole',
            operator: 'greaterThanOrEqual',
            allowBlank: true,
            formulae: [0],
        };
    }
    (0, node_fs_1.mkdirSync)((0, node_path_1.dirname)(path), { recursive: true });
    await workbook.xlsx.writeFile(path);
}
async function main() {
    const base = (0, node_path_1.join)('datasets', 'report-evaluation', 'v1');
    const datasetPath = (0, node_path_1.resolve)(process.env.REPORT_EVAL_DATASET_PATH ?? (0, node_path_1.join)(base, 'cases.jsonl'));
    const predictionPath = (0, node_path_1.resolve)(process.env.REPORT_EVAL_PREDICTIONS_PATH ?? (0, node_path_1.join)(base, 'predictions.jsonl'));
    const outputDir = (0, node_path_1.resolve)(process.env.REPORT_EVAL_OUTPUT_DIR ?? (0, node_path_1.join)(base, 'human-rating'));
    const cases = readJsonl(datasetPath).filter((item) => item.split === 'test');
    const predictions = new Map(((0, node_fs_1.existsSync)(predictionPath)
        ? readJsonl(predictionPath)
        : []).map((item) => [item.caseId, item]));
    await Promise.all([
        create((0, node_path_1.join)(outputDir, 'evaluator-a.xlsx'), cases, predictions, 'A'),
        create((0, node_path_1.join)(outputDir, 'evaluator-b.xlsx'), cases, predictions, 'B'),
    ]);
    console.log(`Đã tạo 2 phiếu đánh giá Report, mỗi phiếu ${cases.length} ca test.`);
    if (!predictions.size)
        console.log('Chưa có predictions.jsonl; generatedReport đang để trống.');
}
main().catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
});
//# sourceMappingURL=prepare-report-evaluation-workbooks.js.map