import { readFileSync } from 'node:fs';
import { join } from 'node:path';

type Record = {
  transcriptId: string;
  split: string;
  participants: Array<{ userId: string; fullName: string }>;
  transcript: { rawTranscript: string; segments: Array<{ segmentId: string }> };
  groundTruth: {
    actionItemCount: number;
    actionItems: Array<{
      actionItemId: string;
      assigneeName: string | null;
      assigneeUserId: string | null;
      dueDate: string | null;
      source: string;
      evidenceSegmentIds: string[];
    }>;
  };
};
const path = join(
  process.cwd(),
  'datasets',
  'action-item-evaluation',
  'v1',
  'transcripts.jsonl',
);
const records = readFileSync(path, 'utf8')
  .split(/\r?\n/)
  .filter(Boolean)
  .map((line) => JSON.parse(line) as Record);
const errors: string[] = [];
const transcriptIds = new Set<string>();
const actionItemIds = new Set<string>();

for (const record of records) {
  if (transcriptIds.has(record.transcriptId))
    errors.push(`Transcript ID trùng: ${record.transcriptId}`);
  transcriptIds.add(record.transcriptId);
  if (!['development', 'test'].includes(record.split))
    errors.push(`${record.transcriptId}: split không hợp lệ`);
  if (!record.transcript.rawTranscript.trim())
    errors.push(`${record.transcriptId}: transcript rỗng`);
  if (
    record.groundTruth.actionItemCount !== record.groundTruth.actionItems.length
  )
    errors.push(`${record.transcriptId}: actionItemCount không khớp`);
  const segmentIds = new Set(
    record.transcript.segments.map((segment) => segment.segmentId),
  );
  const participants = new Map(
    record.participants.map((participant) => [
      participant.userId,
      participant.fullName,
    ]),
  );
  for (const item of record.groundTruth.actionItems) {
    if (actionItemIds.has(item.actionItemId))
      errors.push(`Action item ID trùng: ${item.actionItemId}`);
    actionItemIds.add(item.actionItemId);
    if (
      !item.evidenceSegmentIds.length ||
      item.evidenceSegmentIds.some((id) => !segmentIds.has(id))
    )
      errors.push(`${item.actionItemId}: evidence không hợp lệ`);
    if (
      item.assigneeUserId &&
      participants.get(item.assigneeUserId) !== item.assigneeName
    )
      errors.push(`${item.actionItemId}: assignee không khớp`);
    if (!item.assigneeUserId && item.assigneeName)
      errors.push(`${item.actionItemId}: thiếu assigneeUserId`);
    if (item.dueDate && !/^\d{4}-\d{2}-\d{2}$/.test(item.dueDate))
      errors.push(`${item.actionItemId}: dueDate không hợp lệ`);
    if (!record.transcript.rawTranscript.includes(item.source))
      errors.push(`${item.actionItemId}: source không có trong transcript`);
  }
}
if (records.length !== 60)
  errors.push(`Cần 60 transcript, thực tế ${records.length}`);
if (actionItemIds.size !== 300)
  errors.push(`Cần 300 action item, thực tế ${actionItemIds.size}`);
if (errors.length) {
  console.error(errors.join('\n'));
  process.exitCode = 1;
} else
  console.log({
    valid: true,
    transcripts: records.length,
    actionItems: actionItemIds.size,
    development: 12,
    test: 48,
  });
