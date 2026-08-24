import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';

type DatasetRecord = {
  transcriptId: string;
  split: string;
  groundTruth: { actionItems: unknown[] };
};

const datasetPath = resolve(
  process.env.EVAL_DATASET_PATH ??
    join('datasets', 'action-item-evaluation', 'v1', 'transcripts.jsonl'),
);
const outputPath = resolve(
  process.env.EVAL_PREDICTIONS_PATH ??
    join(
      'datasets',
      'action-item-evaluation',
      'v1',
      'oracle-predictions.jsonl',
    ),
);
const split = process.env.EVAL_SPLIT ?? 'test';
const records = readFileSync(datasetPath, 'utf8')
  .split(/\r?\n/)
  .filter((line) => line.trim())
  .map((line) => JSON.parse(line) as DatasetRecord)
  .filter((record) => split === 'all' || record.split === split)
  .map((record) => ({
    transcriptId: record.transcriptId,
    model: 'ORACLE_PIPELINE_CHECK_NOT_AN_AI_RESULT',
    latencyMs: 0,
    inputTokens: 0,
    outputTokens: 0,
    error: null,
    actionItems: record.groundTruth.actionItems,
  }));

mkdirSync(dirname(outputPath), { recursive: true });
writeFileSync(
  outputPath,
  `${records.map((record) => JSON.stringify(record)).join('\n')}\n`,
  'utf8',
);
console.log(`Đã tạo ${records.length} oracle predictions tại ${outputPath}.`);
console.log(
  'Lưu ý: file này chỉ kiểm tra pipeline, không phải kết quả AI để báo cáo.',
);
