"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_fs_1 = require("node:fs");
const node_path_1 = require("node:path");
const exceljs_1 = __importDefault(require("exceljs"));
const round = (value) => Number(value.toFixed(4));
const mean = (values) => values.length
    ? values.reduce((sum, value) => sum + value, 0) / values.length
    : 0;
async function readRatings(path) {
    const workbook = new exceljs_1.default.Workbook();
    await workbook.xlsx.readFile(path);
    const sheet = workbook.getWorksheet('Đánh giá');
    if (!sheet)
        throw new Error(`Không tìm thấy sheet "Đánh giá" trong ${path}`);
    const rows = [];
    sheet.eachRow((row, rowNumber) => {
        if (rowNumber === 1)
            return;
        const transcriptId = String(row.getCell(1).value ?? '').trim();
        if (!transcriptId)
            return;
        if (!String(row.getCell(5).value ?? '').trim()) {
            throw new Error(`${path}: ${transcriptId} chưa có generatedSummary.`);
        }
        const scores = [7, 8, 9, 10, 11].map((column) => Number(row.getCell(column).value));
        if (scores.some((score) => !Number.isInteger(score) || score < 1 || score > 5)) {
            throw new Error(`${path}: ${transcriptId} chưa chấm đủ điểm 1..5.`);
        }
        const hallucinationCount = Number(row.getCell(12).value);
        if (!Number.isInteger(hallucinationCount) || hallucinationCount < 0) {
            throw new Error(`${path}: ${transcriptId} chưa nhập hallucinationCount hợp lệ.`);
        }
        rows.push({
            transcriptId,
            meetingType: String(row.getCell(2).value ?? ''),
            faithfulness: scores[0],
            coverage: scores[1],
            coherence: scores[2],
            conciseness: scores[3],
            overall: scores[4],
            hallucinationCount,
        });
    });
    return rows;
}
function summarize(rows) {
    return {
        sampleCount: rows.length,
        faithfulnessMean: round(mean(rows.map((row) => row.faithfulness))),
        coverageMean: round(mean(rows.map((row) => row.coverage))),
        coherenceMean: round(mean(rows.map((row) => row.coherence))),
        concisenessMean: round(mean(rows.map((row) => row.conciseness))),
        overallMean: round(mean(rows.map((row) => row.overall))),
        hallucinationTotal: rows.reduce((sum, row) => sum + row.hallucinationCount, 0),
        hallucinationFreeRate: round(rows.filter((row) => row.hallucinationCount === 0).length / rows.length),
    };
}
async function main() {
    const base = (0, node_path_1.join)('datasets', 'summary-evaluation', 'v1');
    const aPath = (0, node_path_1.resolve)(process.env.SUMMARY_EVALUATOR_A_PATH ??
        (0, node_path_1.join)(base, 'human-rating', 'evaluator-a.xlsx'));
    const bPath = (0, node_path_1.resolve)(process.env.SUMMARY_EVALUATOR_B_PATH ??
        (0, node_path_1.join)(base, 'human-rating', 'evaluator-b.xlsx'));
    const outputPath = (0, node_path_1.resolve)(process.env.SUMMARY_EVAL_RESULT_PATH ??
        (0, node_path_1.join)(base, 'results', 'human-rating-summary.json'));
    const [a, b] = await Promise.all([readRatings(aPath), readRatings(bPath)]);
    if (a.length !== b.length)
        throw new Error('Hai evaluator không có cùng số mẫu.');
    const bById = new Map(b.map((row) => [row.transcriptId, row]));
    const combined = a.flatMap((row) => {
        const other = bById.get(row.transcriptId);
        if (!other)
            throw new Error(`Evaluator B thiếu ${row.transcriptId}.`);
        return [row, other];
    });
    const types = [...new Set(a.map((row) => row.meetingType))];
    const report = {
        measuredAt: new Date().toISOString(),
        evaluatorCount: 2,
        transcriptCount: a.length,
        overall: summarize(combined),
        byMeetingType: Object.fromEntries(types.map((type) => [
            type,
            summarize(combined.filter((row) => row.meetingType === type)),
        ])),
        interpretation: 'Điểm là trung bình của hai người đánh giá độc lập trên thang 1..5.',
    };
    (0, node_fs_1.mkdirSync)((0, node_path_1.dirname)(outputPath), { recursive: true });
    (0, node_fs_1.writeFileSync)(outputPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
    console.log(JSON.stringify(report, null, 2));
}
main().catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
});
//# sourceMappingURL=aggregate-summary-human-ratings.js.map