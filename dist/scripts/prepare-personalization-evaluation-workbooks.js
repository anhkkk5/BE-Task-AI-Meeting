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
async function createWorkbook(path, cases, predictions, evaluator) {
    const workbook = new exceljs_1.default.Workbook();
    const guide = workbook.addWorksheet('Hướng dẫn');
    guide.addRows([
        [`ĐÁNH GIÁ KHẢ NĂNG CÁ NHÂN HÓA - EVALUATOR ${evaluator}`],
        ['Chấm độc lập từ 1 (rất kém) đến 5 (rất tốt).'],
        [
            'Personal relevance: tập trung đúng vai trò, nhiệm vụ và nhu cầu người dùng.',
        ],
        ['Factuality: chỉ sử dụng thông tin có trong sourceData.'],
        ['Preference adherence: tuân thủ phong cách và trọng tâm người dùng.'],
        ['Actionability: đưa ra hành động hữu ích cho đúng người dùng.'],
        [
            'Pair differentiation: khác biệt hợp lý so với người còn lại cùng pairId.',
        ],
        ['privacyLeakCount: số thông tin riêng của otherUser bị đưa vào kết quả.'],
    ]);
    guide.getColumn(1).width = 115;
    guide.getRow(1).font = { bold: true, size: 14 };
    const sheet = workbook.addWorksheet('Đánh giá');
    sheet.columns = [
        { header: 'caseId', key: 'caseId', width: 25 },
        { header: 'pairId', key: 'pairId', width: 18 },
        { header: 'feature', key: 'feature', width: 26 },
        { header: 'scenario', key: 'scenario', width: 24 },
        { header: 'sourceDataJson', key: 'source', width: 70 },
        { header: 'requiredPersonalFacts', key: 'required', width: 55 },
        { header: 'forbiddenOtherUserFacts', key: 'forbidden', width: 55 },
        { header: 'expectedPairDifference', key: 'difference', width: 50 },
        { header: 'generatedOutput', key: 'output', width: 75 },
        { header: 'model', key: 'model', width: 22 },
        { header: 'personalRelevance_1_5', key: 'relevance', width: 24 },
        { header: 'factuality_1_5', key: 'factuality', width: 18 },
        { header: 'preferenceAdherence_1_5', key: 'preference', width: 27 },
        { header: 'actionability_1_5', key: 'actionability', width: 20 },
        { header: 'pairDifferentiation_1_5', key: 'pair', width: 25 },
        { header: 'privacyLeakCount', key: 'privacy', width: 20 },
        { header: 'evaluatorNote', key: 'note', width: 40 },
    ];
    cases.forEach((item) => {
        const prediction = predictions.get(item.caseId);
        sheet.addRow({
            caseId: item.caseId,
            pairId: item.pairId,
            feature: item.feature,
            scenario: item.scenario,
            source: JSON.stringify(item.sourceData),
            required: item.groundTruth.requiredPersonalFacts.join('\n'),
            forbidden: item.groundTruth.forbiddenOtherUserFacts.join('\n'),
            difference: item.groundTruth.expectedDifferenceFromPair,
            output: prediction?.generatedOutput ?? '',
            model: prediction?.model ?? '',
        });
    });
    sheet.views = [{ state: 'frozen', ySplit: 1 }];
    sheet.autoFilter = { from: 'A1', to: 'Q1' };
    sheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    sheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF315EFB' },
    };
    sheet.eachRow((row, number) => {
        if (number > 1)
            row.alignment = { vertical: 'top', wrapText: true };
    });
    for (let row = 2; row <= cases.length + 1; row += 1) {
        for (const column of ['K', 'L', 'M', 'N', 'O']) {
            sheet.getCell(`${column}${row}`).dataValidation = {
                type: 'whole',
                operator: 'between',
                allowBlank: true,
                formulae: [1, 5],
            };
        }
        sheet.getCell(`P${row}`).dataValidation = {
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
    const base = (0, node_path_1.join)('datasets', 'personalization-evaluation', 'v1');
    const datasetPath = (0, node_path_1.resolve)(process.env.PERSONALIZATION_EVAL_DATASET_PATH ?? (0, node_path_1.join)(base, 'cases.jsonl'));
    const predictionPath = (0, node_path_1.resolve)(process.env.PERSONALIZATION_EVAL_PREDICTIONS_PATH ??
        (0, node_path_1.join)(base, 'predictions.jsonl'));
    const outputDir = (0, node_path_1.resolve)(process.env.PERSONALIZATION_EVAL_OUTPUT_DIR ?? (0, node_path_1.join)(base, 'human-rating'));
    const cases = readJsonl(datasetPath).filter((item) => item.split === 'test');
    const predictions = new Map(((0, node_fs_1.existsSync)(predictionPath)
        ? readJsonl(predictionPath)
        : []).map((item) => [item.caseId, item]));
    await Promise.all([
        createWorkbook((0, node_path_1.join)(outputDir, 'evaluator-a.xlsx'), cases, predictions, 'A'),
        createWorkbook((0, node_path_1.join)(outputDir, 'evaluator-b.xlsx'), cases, predictions, 'B'),
    ]);
    console.log(`Đã tạo 2 phiếu đánh giá, mỗi phiếu ${cases.length} ca test.`);
    if (!predictions.size) {
        console.log('Chưa có predictions.jsonl; generatedOutput đang để trống.');
    }
}
main().catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
});
//# sourceMappingURL=prepare-personalization-evaluation-workbooks.js.map