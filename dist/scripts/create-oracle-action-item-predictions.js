"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const node_fs_1 = require("node:fs");
const node_path_1 = require("node:path");
const datasetPath = (0, node_path_1.resolve)(process.env.EVAL_DATASET_PATH ??
    (0, node_path_1.join)('datasets', 'action-item-evaluation', 'v1', 'transcripts.jsonl'));
const outputPath = (0, node_path_1.resolve)(process.env.EVAL_PREDICTIONS_PATH ??
    (0, node_path_1.join)('datasets', 'action-item-evaluation', 'v1', 'oracle-predictions.jsonl'));
const split = process.env.EVAL_SPLIT ?? 'test';
const records = (0, node_fs_1.readFileSync)(datasetPath, 'utf8')
    .split(/\r?\n/)
    .filter((line) => line.trim())
    .map((line) => JSON.parse(line))
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
(0, node_fs_1.mkdirSync)((0, node_path_1.dirname)(outputPath), { recursive: true });
(0, node_fs_1.writeFileSync)(outputPath, `${records.map((record) => JSON.stringify(record)).join('\n')}\n`, 'utf8');
console.log(`Đã tạo ${records.length} oracle predictions tại ${outputPath}.`);
console.log('Lưu ý: file này chỉ kiểm tra pipeline, không phải kết quả AI để báo cáo.');
//# sourceMappingURL=create-oracle-action-item-predictions.js.map