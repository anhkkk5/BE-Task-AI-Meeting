"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_fs_1 = require("node:fs");
const node_path_1 = require("node:path");
const exceljs_1 = __importDefault(require("exceljs"));
const mean = (values) => values.reduce((sum, value) => sum + value, 0) / values.length;
const round = (value) => Number(value.toFixed(4));
async function readWorkbook(path) {
    const workbook = new exceljs_1.default.Workbook();
    await workbook.xlsx.readFile(path);
    const sheet = workbook.getWorksheet('Đánh giá');
    if (!sheet)
        throw new Error(`${path}: thiếu sheet Đánh giá.`);
    const rows = [];
    sheet.eachRow((row, number) => {
        if (number === 1)
            return;
        const caseId = String(row.getCell(1).value ?? '').trim();
        if (!caseId)
            return;
        if (!String(row.getCell(9).value ?? '').trim()) {
            throw new Error(`${path}: ${caseId} chưa có answer.`);
        }
        const scores = [14, 15, 16, 17, 18, 19].map((column) => Number(row.getCell(column).value));
        if (scores.some((score) => !Number.isInteger(score) || score < 1 || score > 5)) {
            throw new Error(`${path}: ${caseId} chưa chấm đủ điểm 1..5.`);
        }
        const unsupported = Number(row.getCell(20).value);
        if (!Number.isInteger(unsupported) || unsupported < 0) {
            throw new Error(`${path}: ${caseId} thiếu unsupportedClaimCount.`);
        }
        rows.push({
            caseId,
            category: String(row.getCell(2).value ?? ''),
            scores,
            unsupported,
        });
    });
    return rows;
}
function summarize(rows) {
    return {
        sampleRatings: rows.length,
        correctnessMean: round(mean(rows.map((row) => row.scores[0]))),
        completenessMean: round(mean(rows.map((row) => row.scores[1]))),
        groundednessMean: round(mean(rows.map((row) => row.scores[2]))),
        contextAccuracyMean: round(mean(rows.map((row) => row.scores[3]))),
        sourceQualityMean: round(mean(rows.map((row) => row.scores[4]))),
        suggestionQualityMean: round(mean(rows.map((row) => row.scores[5]))),
        unsupportedClaimTotal: rows.reduce((sum, row) => sum + row.unsupported, 0),
        groundedAnswerRate: round(rows.filter((row) => row.unsupported === 0).length / rows.length),
    };
}
async function main() {
    const base = (0, node_path_1.join)('datasets', 'project-assistant-evaluation', 'v1');
    const a = await readWorkbook((0, node_path_1.resolve)(process.env.PROJECT_ASSISTANT_EVALUATOR_A_PATH ??
        (0, node_path_1.join)(base, 'human-rating', 'evaluator-a.xlsx')));
    const b = await readWorkbook((0, node_path_1.resolve)(process.env.PROJECT_ASSISTANT_EVALUATOR_B_PATH ??
        (0, node_path_1.join)(base, 'human-rating', 'evaluator-b.xlsx')));
    if (a.length !== b.length)
        throw new Error('Hai evaluator không có cùng số ca.');
    const bIds = new Set(b.map((item) => item.caseId));
    if (a.some((item) => !bIds.has(item.caseId))) {
        throw new Error('Hai evaluator không chấm cùng tập ca.');
    }
    const combined = [...a, ...b];
    const categories = [...new Set(combined.map((item) => item.category))];
    const result = {
        measuredAt: new Date().toISOString(),
        evaluatorCount: 2,
        caseCount: a.length,
        overall: summarize(combined),
        byCategory: Object.fromEntries(categories.map((category) => [
            category,
            summarize(combined.filter((row) => row.category === category)),
        ])),
    };
    const output = (0, node_path_1.resolve)(process.env.PROJECT_ASSISTANT_EVAL_RESULT_PATH ??
        (0, node_path_1.join)(base, 'results', 'human-rating-summary.json'));
    (0, node_fs_1.mkdirSync)((0, node_path_1.dirname)(output), { recursive: true });
    (0, node_fs_1.writeFileSync)(output, `${JSON.stringify(result, null, 2)}\n`, 'utf8');
    console.log(JSON.stringify(result, null, 2));
}
main().catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
});
//# sourceMappingURL=aggregate-project-assistant-human-ratings.js.map