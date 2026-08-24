import { existsSync, mkdirSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import ExcelJS from 'exceljs';

type EvaluationCase = {
  caseId: string;
  split: string;
  category: string;
  question: string;
  context: unknown;
  sourceData: unknown;
  groundTruth: {
    requiredFacts: string[];
    requiredSourceTypes: string[];
    forbiddenClaims: string[];
    expectedState: string;
  };
};
type Prediction = {
  caseId: string;
  answer?: string;
  sources?: unknown[];
  suggestedQuestions?: string[];
  state?: string;
  model?: string;
};
const readJsonl = <T>(path: string) =>
  readFileSync(path, 'utf8')
    .split(/\r?\n/)
    .filter(Boolean)
    .map((line) => JSON.parse(line) as T);

async function createWorkbook(
  path: string,
  cases: EvaluationCase[],
  predictions: Map<string, Prediction>,
  evaluator: string,
) {
  const workbook = new ExcelJS.Workbook();
  const guide = workbook.addWorksheet('Hướng dẫn');
  guide.addRows([
    [`ĐÁNH GIÁ PROJECT AI ASSISTANT - EVALUATOR ${evaluator}`],
    ['Chấm độc lập từ 1 (rất kém) đến 5 (rất tốt).'],
    ['Correctness: trả lời đúng requiredFacts.'],
    ['Completeness: không bỏ sót phần quan trọng của câu hỏi.'],
    ['Groundedness: mọi nhận định có căn cứ trong sourceData.'],
    ['Context accuracy: dùng đúng Workspace, Project và Sprint.'],
    ['Source quality: nguồn/citation đúng loại và hỗ trợ câu trả lời.'],
    [
      'Suggestion quality: câu hỏi gợi ý liên quan, đa dạng và có thể hành động.',
    ],
    ['unsupportedClaimCount: số phát biểu không được nguồn hỗ trợ.'],
  ]);
  guide.getColumn(1).width = 115;
  guide.getRow(1).font = { bold: true, size: 14 };
  const sheet = workbook.addWorksheet('Đánh giá');
  sheet.columns = [
    { header: 'caseId', key: 'caseId', width: 21 },
    { header: 'category', key: 'category', width: 24 },
    { header: 'question', key: 'question', width: 48 },
    { header: 'contextJson', key: 'context', width: 38 },
    { header: 'sourceDataJson', key: 'sourceData', width: 70 },
    { header: 'requiredFacts', key: 'facts', width: 55 },
    { header: 'requiredSourceTypes', key: 'sourceTypes', width: 32 },
    { header: 'forbiddenClaims', key: 'forbidden', width: 48 },
    { header: 'answer', key: 'answer', width: 70 },
    { header: 'returnedSourcesJson', key: 'sources', width: 45 },
    { header: 'suggestedQuestions', key: 'suggestions', width: 50 },
    { header: 'state', key: 'state', width: 16 },
    { header: 'model', key: 'model', width: 20 },
    { header: 'correctness_1_5', key: 'correctness', width: 18 },
    { header: 'completeness_1_5', key: 'completeness', width: 20 },
    { header: 'groundedness_1_5', key: 'groundedness', width: 20 },
    { header: 'contextAccuracy_1_5', key: 'contextAccuracy', width: 22 },
    { header: 'sourceQuality_1_5', key: 'sourceQuality', width: 20 },
    { header: 'suggestionQuality_1_5', key: 'suggestionQuality', width: 23 },
    { header: 'unsupportedClaimCount', key: 'unsupported', width: 24 },
    { header: 'evaluatorNote', key: 'note', width: 40 },
  ];
  cases.forEach((item) => {
    const prediction = predictions.get(item.caseId);
    sheet.addRow({
      caseId: item.caseId,
      category: item.category,
      question: item.question,
      context: JSON.stringify(item.context),
      sourceData: JSON.stringify(item.sourceData),
      facts: item.groundTruth.requiredFacts.join('\n'),
      sourceTypes: item.groundTruth.requiredSourceTypes.join(', '),
      forbidden: item.groundTruth.forbiddenClaims.join('\n'),
      answer: prediction?.answer ?? '',
      sources: prediction?.sources ? JSON.stringify(prediction.sources) : '',
      suggestions: prediction?.suggestedQuestions?.join('\n') ?? '',
      state: prediction?.state ?? '',
      model: prediction?.model ?? '',
    });
  });
  sheet.views = [{ state: 'frozen', ySplit: 1 }];
  sheet.autoFilter = { from: 'A1', to: 'U1' };
  sheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
  sheet.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF315EFB' },
  };
  sheet.eachRow((row, number) => {
    if (number > 1) row.alignment = { vertical: 'top', wrapText: true };
  });
  for (let row = 2; row <= cases.length + 1; row += 1) {
    for (const column of ['N', 'O', 'P', 'Q', 'R', 'S']) {
      sheet.getCell(`${column}${row}`).dataValidation = {
        type: 'whole',
        operator: 'between',
        allowBlank: true,
        formulae: [1, 5],
      };
    }
    sheet.getCell(`T${row}`).dataValidation = {
      type: 'whole',
      operator: 'greaterThanOrEqual',
      allowBlank: true,
      formulae: [0],
    };
  }
  mkdirSync(dirname(path), { recursive: true });
  await workbook.xlsx.writeFile(path);
}

async function main() {
  const base = join('datasets', 'project-assistant-evaluation', 'v1');
  const datasetPath = resolve(
    process.env.PROJECT_ASSISTANT_EVAL_DATASET_PATH ??
      join(base, 'cases.jsonl'),
  );
  const predictionPath = resolve(
    process.env.PROJECT_ASSISTANT_EVAL_PREDICTIONS_PATH ??
      join(base, 'predictions.jsonl'),
  );
  const outputDir = resolve(
    process.env.PROJECT_ASSISTANT_EVAL_OUTPUT_DIR ?? join(base, 'human-rating'),
  );
  const cases = readJsonl<EvaluationCase>(datasetPath).filter(
    (item) => item.split === 'test',
  );
  const predictions = new Map(
    (existsSync(predictionPath)
      ? readJsonl<Prediction>(predictionPath)
      : []
    ).map((item) => [item.caseId, item]),
  );
  await Promise.all([
    createWorkbook(
      join(outputDir, 'evaluator-a.xlsx'),
      cases,
      predictions,
      'A',
    ),
    createWorkbook(
      join(outputDir, 'evaluator-b.xlsx'),
      cases,
      predictions,
      'B',
    ),
  ]);
  console.log(`Đã tạo 2 phiếu đánh giá, mỗi phiếu ${cases.length} ca test.`);
  if (!predictions.size) {
    console.log('Chưa có predictions.jsonl; kết quả AI đang để trống.');
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
