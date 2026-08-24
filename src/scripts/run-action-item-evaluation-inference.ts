import 'dotenv/config';
import {
  appendFileSync,
  existsSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
} from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { AiProviderService } from '../modules/ai-assistant/services/ai-provider.service';
import { MeetingSummaryInputData } from '../modules/ai-assistant/services/ai-meeting-summary-data-builder.service';
import { PromptBuilderService } from '../modules/ai-assistant/services/prompt-builder.service';

type DatasetRecord = {
  transcriptId: string;
  split: string;
  meetingType: string;
  meetingDate: string;
  workspaceId: string;
  projectId: string;
  sprintId: string;
  participants: { userId: string; fullName: string; role: string }[];
  transcript: {
    rawTranscript: string;
    segments: { userId?: string; speakerName?: string; text: string }[];
  };
};

function readDataset(path: string): DatasetRecord[] {
  return readFileSync(path, 'utf8')
    .split(/\r?\n/)
    .filter((line) => line.trim())
    .map((line) => JSON.parse(line) as DatasetRecord);
}

async function main() {
  if (process.env.EVAL_CONFIRM_COST !== 'YES') {
    throw new Error(
      'Chưa gọi OpenAI để tránh phát sinh phí. Muốn chạy thật, đặt EVAL_CONFIRM_COST=YES và nên bắt đầu với EVAL_LIMIT=1.',
    );
  }
  if (process.env.AI_PROVIDER !== 'openai') {
    throw new Error('Script thực nghiệm yêu cầu AI_PROVIDER=openai.');
  }
  if (!process.env.OPENAI_API_KEY) throw new Error('Thiếu OPENAI_API_KEY.');

  const datasetPath = resolve(
    process.env.EVAL_DATASET_PATH ??
      join('datasets', 'action-item-evaluation', 'v1', 'transcripts.jsonl'),
  );
  const outputPath = resolve(
    process.env.EVAL_PREDICTIONS_PATH ??
      join('datasets', 'action-item-evaluation', 'v1', 'predictions.jsonl'),
  );
  const split = process.env.EVAL_SPLIT ?? 'test';
  const parsedLimit = Number(process.env.EVAL_LIMIT ?? 1);
  if (!Number.isInteger(parsedLimit) || parsedLimit < 1) {
    throw new Error('EVAL_LIMIT phải là số nguyên dương.');
  }
  const limit = parsedLimit;
  const resume = process.env.EVAL_RESUME !== 'false';
  const existingIds = new Set<string>();
  if (resume && existsSync(outputPath)) {
    readFileSync(outputPath, 'utf8')
      .split(/\r?\n/)
      .filter(Boolean)
      .forEach((line) =>
        existingIds.add(
          (JSON.parse(line) as { transcriptId: string }).transcriptId,
        ),
      );
  } else {
    mkdirSync(dirname(outputPath), { recursive: true });
    writeFileSync(outputPath, '', 'utf8');
  }

  const records = readDataset(datasetPath)
    .filter((record) => split === 'all' || record.split === split)
    .filter((record) => !existingIds.has(record.transcriptId))
    .slice(0, limit);
  const observabilityNoop = { record: async () => null };
  const provider = new AiProviderService(observabilityNoop as never);
  const promptBuilder = new PromptBuilderService();

  for (const [index, record] of records.entries()) {
    const inputData: MeetingSummaryInputData = {
      workspace: { id: record.workspaceId },
      project: {
        id: record.projectId,
        name: `Evaluation ${record.projectId}`,
        keyCode: 'EVAL',
        status: 'ACTIVE',
      },
      meeting: {
        id: record.transcriptId,
        title: `Evaluation ${record.transcriptId}`,
        description: null,
        meetingType: record.meetingType,
        meetingDate: record.meetingDate,
        status: 'ENDED',
        startTime: null,
        endTime: null,
      },
      sprint: { id: record.sprintId, name: record.sprintId, status: 'ACTIVE' },
      participants: record.participants.map((participant) => ({
        ...participant,
        email: null,
        attended: true,
      })),
      transcript: {
        id: record.transcriptId,
        rawTranscript: record.transcript.rawTranscript,
        normalizedTranscript: record.transcript.rawTranscript,
        speakers: record.transcript.segments.map((segment) => ({
          userId: segment.userId,
          speakerName: segment.speakerName,
          text: segment.text,
        })),
      },
      generatedAt: new Date().toISOString(),
    };
    const started = Date.now();
    let prediction: Record<string, unknown>;
    try {
      const result = await provider.generateMeetingSummary(
        promptBuilder.buildMeetingSummaryPrompt(inputData),
        inputData,
      );
      prediction = {
        transcriptId: record.transcriptId,
        model: result.model,
        latencyMs: Date.now() - started,
        error: null,
        actionItems: result.output.actionItems,
      };
    } catch (error) {
      prediction = {
        transcriptId: record.transcriptId,
        model: process.env.AI_MODEL ?? '',
        latencyMs: Date.now() - started,
        error: error instanceof Error ? error.message : String(error),
        actionItems: [],
      };
    }
    appendFileSync(outputPath, `${JSON.stringify(prediction)}\n`, 'utf8');
    console.log(
      `[${index + 1}/${records.length}] ${record.transcriptId}: ${Array.isArray(prediction.actionItems) ? prediction.actionItems.length : 0} action items`,
    );
  }
  console.log(`Hoàn tất. Prediction được lưu tại ${outputPath}.`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
