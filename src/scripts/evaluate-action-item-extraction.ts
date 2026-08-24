import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

export type EvaluationActionItem = {
  text: string;
  assigneeName?: string | null;
  assigneeUserId?: string | null;
  dueDate?: string | null;
  status?: string | null;
  source?: string | null;
};

type DatasetRecord = {
  transcriptId: string;
  split: string;
  meetingType: string;
  groundTruth: { actionItems: EvaluationActionItem[] };
};

type PredictionRecord = {
  transcriptId: string;
  model?: string;
  latencyMs?: number;
  inputTokens?: number;
  outputTokens?: number;
  error?: string | null;
  actionItems: EvaluationActionItem[];
};

type MatchedPair = {
  truthIndex: number;
  predictionIndex: number;
  similarity: number;
};

const round = (value: number) => Number(value.toFixed(4));
const safeDivide = (numerator: number, denominator: number) =>
  denominator === 0 ? 0 : numerator / denominator;

export function normalizeEvaluationText(value?: string | null): string {
  return (value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function tokenF1(left: string, right: string): number {
  const leftTokens = normalizeEvaluationText(left).split(' ').filter(Boolean);
  const rightTokens = normalizeEvaluationText(right).split(' ').filter(Boolean);
  if (!leftTokens.length || !rightTokens.length) return 0;

  const remaining = [...rightTokens];
  let overlap = 0;
  for (const token of leftTokens) {
    const index = remaining.indexOf(token);
    if (index >= 0) {
      overlap += 1;
      remaining.splice(index, 1);
    }
  }

  const precision = overlap / leftTokens.length;
  const recall = overlap / rightTokens.length;
  return precision + recall === 0
    ? 0
    : (2 * precision * recall) / (precision + recall);
}

export function matchActionItems(
  truth: EvaluationActionItem[],
  predictions: EvaluationActionItem[],
  threshold: number,
): MatchedPair[] {
  const candidates = truth.flatMap((truthItem, truthIndex) =>
    predictions.map((prediction, predictionIndex) => ({
      truthIndex,
      predictionIndex,
      similarity: tokenF1(prediction.text, truthItem.text),
    })),
  );

  candidates.sort((a, b) => b.similarity - a.similarity);
  const usedTruth = new Set<number>();
  const usedPredictions = new Set<number>();
  const matches: MatchedPair[] = [];

  for (const candidate of candidates) {
    if (candidate.similarity < threshold) break;
    if (
      usedTruth.has(candidate.truthIndex) ||
      usedPredictions.has(candidate.predictionIndex)
    ) {
      continue;
    }
    usedTruth.add(candidate.truthIndex);
    usedPredictions.add(candidate.predictionIndex);
    matches.push(candidate);
  }

  return matches;
}

function readJsonLines<T>(path: string): T[] {
  return readFileSync(path, 'utf8')
    .split(/\r?\n/)
    .filter((line) => line.trim())
    .map((line, index) => {
      try {
        return JSON.parse(line) as T;
      } catch (error) {
        throw new Error(
          `JSONL không hợp lệ tại ${path}, dòng ${index + 1}: ${
            error instanceof Error ? error.message : String(error)
          }`,
        );
      }
    });
}

function csvCell(value: unknown): string {
  const text = value == null ? '' : String(value);
  return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

function toCsv(rows: Record<string, unknown>[]): string {
  if (!rows.length) return '';
  const headers = Object.keys(rows[0]);
  return [
    headers.map(csvCell).join(','),
    ...rows.map((row) =>
      headers.map((header) => csvCell(row[header])).join(','),
    ),
  ].join('\n');
}

function percentile(values: number[], ratio: number): number | null {
  if (!values.length) return null;
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.ceil(ratio * sorted.length) - 1];
}

function evaluate() {
  const datasetPath = resolve(
    process.env.EVAL_DATASET_PATH ??
      join('datasets', 'action-item-evaluation', 'v1', 'transcripts.jsonl'),
  );
  const predictionsPath = resolve(
    process.env.EVAL_PREDICTIONS_PATH ??
      join('datasets', 'action-item-evaluation', 'v1', 'predictions.jsonl'),
  );
  const outputDirectory = resolve(
    process.env.EVAL_OUTPUT_DIR ??
      join('datasets', 'action-item-evaluation', 'v1', 'results'),
  );
  const split = process.env.EVAL_SPLIT ?? 'test';
  const threshold = Number(process.env.EVAL_MATCH_THRESHOLD ?? 0.5);

  if (!existsSync(datasetPath))
    throw new Error(`Không tìm thấy dataset: ${datasetPath}`);
  if (!existsSync(predictionsPath)) {
    throw new Error(
      `Không tìm thấy prediction: ${predictionsPath}. Chạy dataset:action-items:infer trước hoặc đặt EVAL_PREDICTIONS_PATH.`,
    );
  }
  if (!Number.isFinite(threshold) || threshold < 0 || threshold > 1) {
    throw new Error('EVAL_MATCH_THRESHOLD phải nằm trong khoảng 0..1.');
  }

  const dataset = readJsonLines<DatasetRecord>(datasetPath).filter(
    (record) => split === 'all' || record.split === split,
  );
  const predictions = readJsonLines<PredictionRecord>(predictionsPath);
  const predictionByTranscript = new Map(
    predictions.map((record) => [record.transcriptId, record]),
  );

  let totalTruth = 0;
  let totalPredictions = 0;
  let truePositives = 0;
  let assigneeCorrect = 0;
  let assigneeNameCorrect = 0;
  let dueDateCorrect = 0;
  let sourceSupported = 0;
  const perTranscript: Record<string, unknown>[] = [];
  const detailRows: Record<string, unknown>[] = [];

  for (const record of dataset) {
    const prediction = predictionByTranscript.get(record.transcriptId);
    const predictedItems = prediction?.error
      ? []
      : (prediction?.actionItems ?? []);
    const truthItems = record.groundTruth.actionItems;
    const matches = matchActionItems(truthItems, predictedItems, threshold);
    const matchedTruth = new Set(matches.map((item) => item.truthIndex));
    const matchedPredictions = new Set(
      matches.map((item) => item.predictionIndex),
    );
    const tp = matches.length;
    const fp = predictedItems.length - tp;
    const fn = truthItems.length - tp;
    const precision = safeDivide(tp, tp + fp);
    const recall = safeDivide(tp, tp + fn);
    const f1 = safeDivide(2 * precision * recall, precision + recall);

    totalTruth += truthItems.length;
    totalPredictions += predictedItems.length;
    truePositives += tp;

    for (const match of matches) {
      const truth = truthItems[match.truthIndex];
      const predicted = predictedItems[match.predictionIndex];
      const userIdMatch =
        (truth.assigneeUserId ?? null) === (predicted.assigneeUserId ?? null);
      const nameMatch =
        normalizeEvaluationText(truth.assigneeName) ===
        normalizeEvaluationText(predicted.assigneeName);
      const dateMatch = (truth.dueDate ?? null) === (predicted.dueDate ?? null);
      const sourceScore = tokenF1(predicted.source ?? '', truth.source ?? '');
      assigneeCorrect += Number(userIdMatch);
      assigneeNameCorrect += Number(nameMatch);
      dueDateCorrect += Number(dateMatch);
      sourceSupported += Number(sourceScore >= threshold);
      detailRows.push({
        transcriptId: record.transcriptId,
        meetingType: record.meetingType,
        result: 'TP',
        similarity: round(match.similarity),
        groundTruthText: truth.text,
        predictedText: predicted.text,
        assigneeUserIdCorrect: userIdMatch,
        assigneeNameCorrect: nameMatch,
        dueDateCorrect: dateMatch,
        sourceSupported: sourceScore >= threshold,
      });
    }
    truthItems.forEach((item, index) => {
      if (!matchedTruth.has(index)) {
        detailRows.push({
          transcriptId: record.transcriptId,
          meetingType: record.meetingType,
          result: 'FN',
          similarity: 0,
          groundTruthText: item.text,
          predictedText: '',
          assigneeUserIdCorrect: '',
          assigneeNameCorrect: '',
          dueDateCorrect: '',
          sourceSupported: '',
        });
      }
    });
    predictedItems.forEach((item, index) => {
      if (!matchedPredictions.has(index)) {
        detailRows.push({
          transcriptId: record.transcriptId,
          meetingType: record.meetingType,
          result: 'FP',
          similarity: 0,
          groundTruthText: '',
          predictedText: item.text,
          assigneeUserIdCorrect: '',
          assigneeNameCorrect: '',
          dueDateCorrect: '',
          sourceSupported: '',
        });
      }
    });
    perTranscript.push({
      transcriptId: record.transcriptId,
      meetingType: record.meetingType,
      model: prediction?.model ?? '',
      groundTruthCount: truthItems.length,
      predictionCount: predictedItems.length,
      truePositive: tp,
      falsePositive: fp,
      falseNegative: fn,
      precision: round(precision),
      recall: round(recall),
      f1: round(f1),
      latencyMs: prediction?.latencyMs ?? '',
      error: prediction?.error ?? '',
    });
  }

  const falsePositives = totalPredictions - truePositives;
  const falseNegatives = totalTruth - truePositives;
  const precision = safeDivide(truePositives, truePositives + falsePositives);
  const recall = safeDivide(truePositives, truePositives + falseNegatives);
  const f1 = safeDivide(2 * precision * recall, precision + recall);
  const latencies = predictions
    .map((item) => item.latencyMs)
    .filter((value): value is number => typeof value === 'number');
  const meetingTypes = [...new Set(dataset.map((item) => item.meetingType))];
  const byMeetingType = Object.fromEntries(
    meetingTypes.map((meetingType) => {
      const rows = perTranscript.filter(
        (row) => row.meetingType === meetingType,
      );
      const tp = rows.reduce((sum, row) => sum + Number(row.truePositive), 0);
      const fp = rows.reduce((sum, row) => sum + Number(row.falsePositive), 0);
      const fn = rows.reduce((sum, row) => sum + Number(row.falseNegative), 0);
      const p = safeDivide(tp, tp + fp);
      const r = safeDivide(tp, tp + fn);
      return [
        meetingType,
        {
          transcripts: rows.length,
          precision: round(p),
          recall: round(r),
          f1: round(safeDivide(2 * p * r, p + r)),
        },
      ];
    }),
  );

  const summary = {
    evaluatedAt: new Date().toISOString(),
    datasetPath,
    predictionsPath,
    split,
    matchThreshold: threshold,
    transcriptCount: dataset.length,
    predictionRecordCount: predictions.length,
    missingPredictionCount: dataset.filter(
      (item) => !predictionByTranscript.has(item.transcriptId),
    ).length,
    failedPredictionCount: dataset.filter(
      (item) => predictionByTranscript.get(item.transcriptId)?.error,
    ).length,
    extraction: {
      groundTruth: totalTruth,
      predicted: totalPredictions,
      truePositive: truePositives,
      falsePositive: falsePositives,
      falseNegative: falseNegatives,
      precision: round(precision),
      recall: round(recall),
      f1: round(f1),
    },
    matchedFieldQuality: {
      matchedCount: truePositives,
      assigneeUserIdAccuracy: round(safeDivide(assigneeCorrect, truePositives)),
      assigneeNameAccuracy: round(
        safeDivide(assigneeNameCorrect, truePositives),
      ),
      dueDateAccuracy: round(safeDivide(dueDateCorrect, truePositives)),
      sourceSupportRate: round(safeDivide(sourceSupported, truePositives)),
    },
    performance: {
      averageLatencyMs: latencies.length
        ? Math.round(
            latencies.reduce((sum, value) => sum + value, 0) / latencies.length,
          )
        : null,
      p95LatencyMs: percentile(latencies, 0.95),
      inputTokens: predictions.reduce(
        (sum, item) => sum + (item.inputTokens ?? 0),
        0,
      ),
      outputTokens: predictions.reduce(
        (sum, item) => sum + (item.outputTokens ?? 0),
        0,
      ),
    },
    byMeetingType,
    warning:
      'SYNTHETIC_DRAFT chỉ phù hợp kiểm thử pipeline; cần duyệt nhãn độc lập trước khi công bố là ground truth thực nghiệm.',
  };

  mkdirSync(outputDirectory, { recursive: true });
  writeFileSync(
    join(outputDirectory, 'summary.json'),
    `${JSON.stringify(summary, null, 2)}\n`,
    'utf8',
  );
  writeFileSync(
    join(outputDirectory, 'per-transcript.csv'),
    `${toCsv(perTranscript)}\n`,
    'utf8',
  );
  writeFileSync(
    join(outputDirectory, 'matches.csv'),
    `${toCsv(detailRows)}\n`,
    'utf8',
  );
  console.log(JSON.stringify(summary, null, 2));
}

if (require.main === module) {
  try {
    evaluate();
  } catch (error) {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  }
}
