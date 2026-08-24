import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import ExcelJS from 'exceljs';

type Rating = {
  caseId: string;
  feature: string;
  scenario: string;
  scores: number[];
  privacyLeaks: number;
};
const mean = (values: number[]) =>
  values.reduce((sum, value) => sum + value, 0) / values.length;
const round = (value: number) => Number(value.toFixed(4));

async function readWorkbook(path: string): Promise<Rating[]> {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(path);
  const sheet = workbook.getWorksheet('Đánh giá');
  if (!sheet) throw new Error(`${path}: thiếu sheet Đánh giá.`);
  const rows: Rating[] = [];
  sheet.eachRow((row, number) => {
    if (number === 1) return;
    const caseId = String(row.getCell(1).value ?? '').trim();
    if (!caseId) return;
    if (!String(row.getCell(9).value ?? '').trim()) {
      throw new Error(`${path}: ${caseId} chưa có generatedOutput.`);
    }
    const scores = [11, 12, 13, 14, 15].map((column) =>
      Number(row.getCell(column).value),
    );
    if (
      scores.some((score) => !Number.isInteger(score) || score < 1 || score > 5)
    ) {
      throw new Error(`${path}: ${caseId} chưa chấm đủ điểm 1..5.`);
    }
    const privacyLeaks = Number(row.getCell(16).value);
    if (!Number.isInteger(privacyLeaks) || privacyLeaks < 0) {
      throw new Error(`${path}: ${caseId} thiếu privacyLeakCount.`);
    }
    rows.push({
      caseId,
      feature: String(row.getCell(3).value ?? ''),
      scenario: String(row.getCell(4).value ?? ''),
      scores,
      privacyLeaks,
    });
  });
  return rows;
}

function summarize(rows: Rating[]) {
  return {
    sampleRatings: rows.length,
    personalRelevanceMean: round(mean(rows.map((row) => row.scores[0]))),
    factualityMean: round(mean(rows.map((row) => row.scores[1]))),
    preferenceAdherenceMean: round(mean(rows.map((row) => row.scores[2]))),
    actionabilityMean: round(mean(rows.map((row) => row.scores[3]))),
    pairDifferentiationMean: round(mean(rows.map((row) => row.scores[4]))),
    privacyLeakTotal: rows.reduce((sum, row) => sum + row.privacyLeaks, 0),
    privacySafeRate: round(
      rows.filter((row) => row.privacyLeaks === 0).length / rows.length,
    ),
  };
}

async function main() {
  const base = join('datasets', 'personalization-evaluation', 'v1');
  const a = await readWorkbook(
    resolve(
      process.env.PERSONALIZATION_EVALUATOR_A_PATH ??
        join(base, 'human-rating', 'evaluator-a.xlsx'),
    ),
  );
  const b = await readWorkbook(
    resolve(
      process.env.PERSONALIZATION_EVALUATOR_B_PATH ??
        join(base, 'human-rating', 'evaluator-b.xlsx'),
    ),
  );
  if (a.length !== b.length)
    throw new Error('Hai evaluator không có cùng số ca.');
  const bIds = new Set(b.map((item) => item.caseId));
  if (a.some((item) => !bIds.has(item.caseId))) {
    throw new Error('Hai evaluator không chấm cùng tập ca.');
  }
  const combined = [...a, ...b];
  const features = [...new Set(combined.map((item) => item.feature))];
  const scenarios = [...new Set(combined.map((item) => item.scenario))];
  const result = {
    measuredAt: new Date().toISOString(),
    evaluatorCount: 2,
    caseCount: a.length,
    overall: summarize(combined),
    byFeature: Object.fromEntries(
      features.map((feature) => [
        feature,
        summarize(combined.filter((row) => row.feature === feature)),
      ]),
    ),
    byScenario: Object.fromEntries(
      scenarios.map((scenario) => [
        scenario,
        summarize(combined.filter((row) => row.scenario === scenario)),
      ]),
    ),
  };
  const output = resolve(
    process.env.PERSONALIZATION_EVAL_RESULT_PATH ??
      join(base, 'results', 'human-rating-summary.json'),
  );
  mkdirSync(dirname(output), { recursive: true });
  writeFileSync(output, `${JSON.stringify(result, null, 2)}\n`, 'utf8');
  console.log(JSON.stringify(result, null, 2));
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
