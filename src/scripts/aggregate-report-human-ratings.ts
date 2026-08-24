import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import ExcelJS from 'exceljs';

type Rating = {
  caseId: string;
  scenario: string;
  scores: number[];
  unsupported: number;
};
const mean = (values: number[]) =>
  values.reduce((sum, value) => sum + value, 0) / values.length;
const round = (value: number) => Number(value.toFixed(4));

async function read(path: string): Promise<Rating[]> {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(path);
  const sheet = workbook.getWorksheet('Đánh giá');
  if (!sheet) throw new Error(`${path}: thiếu sheet Đánh giá.`);
  const result: Rating[] = [];
  sheet.eachRow((row, n) => {
    if (n === 1) return;
    const caseId = String(row.getCell(1).value ?? '').trim();
    if (!caseId) return;
    if (!String(row.getCell(6).value ?? '').trim())
      throw new Error(`${path}: ${caseId} chưa có generatedReport.`);
    const scores = [8, 9, 10, 11, 12].map((column) =>
      Number(row.getCell(column).value),
    );
    if (
      scores.some((score) => !Number.isInteger(score) || score < 1 || score > 5)
    ) {
      throw new Error(`${path}: ${caseId} chưa chấm đủ điểm 1..5.`);
    }
    const unsupported = Number(row.getCell(13).value);
    if (!Number.isInteger(unsupported) || unsupported < 0)
      throw new Error(`${path}: ${caseId} thiếu unsupportedClaimCount.`);
    result.push({
      caseId,
      scenario: String(row.getCell(2).value ?? ''),
      scores,
      unsupported,
    });
  });
  return result;
}

function summarize(rows: Rating[]) {
  return {
    sampleRatings: rows.length,
    factualityMean: round(mean(rows.map((row) => row.scores[0]))),
    completenessMean: round(mean(rows.map((row) => row.scores[1]))),
    actionabilityMean: round(mean(rows.map((row) => row.scores[2]))),
    consistencyMean: round(mean(rows.map((row) => row.scores[3]))),
    clarityMean: round(mean(rows.map((row) => row.scores[4]))),
    unsupportedClaimTotal: rows.reduce((sum, row) => sum + row.unsupported, 0),
    unsupportedClaimFreeRate: round(
      rows.filter((row) => row.unsupported === 0).length / rows.length,
    ),
  };
}

async function main() {
  const base = join('datasets', 'report-evaluation', 'v1');
  const a = await read(
    resolve(
      process.env.REPORT_EVALUATOR_A_PATH ??
        join(base, 'human-rating', 'evaluator-a.xlsx'),
    ),
  );
  const b = await read(
    resolve(
      process.env.REPORT_EVALUATOR_B_PATH ??
        join(base, 'human-rating', 'evaluator-b.xlsx'),
    ),
  );
  if (a.length !== b.length)
    throw new Error('Hai evaluator không có cùng số ca.');
  const bIds = new Set(b.map((item) => item.caseId));
  if (a.some((item) => !bIds.has(item.caseId)))
    throw new Error('Hai evaluator không chấm cùng tập ca.');
  const combined = [...a, ...b];
  const scenarios = [...new Set(combined.map((item) => item.scenario))];
  const report = {
    measuredAt: new Date().toISOString(),
    evaluatorCount: 2,
    caseCount: a.length,
    overall: summarize(combined),
    byScenario: Object.fromEntries(
      scenarios.map((scenario) => [
        scenario,
        summarize(combined.filter((row) => row.scenario === scenario)),
      ]),
    ),
  };
  const output = resolve(
    process.env.REPORT_EVAL_RESULT_PATH ??
      join(base, 'results', 'human-rating-summary.json'),
  );
  mkdirSync(dirname(output), { recursive: true });
  writeFileSync(output, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
  console.log(JSON.stringify(report, null, 2));
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
