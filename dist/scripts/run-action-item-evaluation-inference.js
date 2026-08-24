"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const node_fs_1 = require("node:fs");
const node_path_1 = require("node:path");
const ai_provider_service_1 = require("../modules/ai-assistant/services/ai-provider.service");
const prompt_builder_service_1 = require("../modules/ai-assistant/services/prompt-builder.service");
function readDataset(path) {
    return (0, node_fs_1.readFileSync)(path, 'utf8')
        .split(/\r?\n/)
        .filter((line) => line.trim())
        .map((line) => JSON.parse(line));
}
async function main() {
    if (process.env.EVAL_CONFIRM_COST !== 'YES') {
        throw new Error('Chưa gọi OpenAI để tránh phát sinh phí. Muốn chạy thật, đặt EVAL_CONFIRM_COST=YES và nên bắt đầu với EVAL_LIMIT=1.');
    }
    if (process.env.AI_PROVIDER !== 'openai') {
        throw new Error('Script thực nghiệm yêu cầu AI_PROVIDER=openai.');
    }
    if (!process.env.OPENAI_API_KEY)
        throw new Error('Thiếu OPENAI_API_KEY.');
    const datasetPath = (0, node_path_1.resolve)(process.env.EVAL_DATASET_PATH ??
        (0, node_path_1.join)('datasets', 'action-item-evaluation', 'v1', 'transcripts.jsonl'));
    const outputPath = (0, node_path_1.resolve)(process.env.EVAL_PREDICTIONS_PATH ??
        (0, node_path_1.join)('datasets', 'action-item-evaluation', 'v1', 'predictions.jsonl'));
    const split = process.env.EVAL_SPLIT ?? 'test';
    const parsedLimit = Number(process.env.EVAL_LIMIT ?? 1);
    if (!Number.isInteger(parsedLimit) || parsedLimit < 1) {
        throw new Error('EVAL_LIMIT phải là số nguyên dương.');
    }
    const limit = parsedLimit;
    const resume = process.env.EVAL_RESUME !== 'false';
    const existingIds = new Set();
    if (resume && (0, node_fs_1.existsSync)(outputPath)) {
        (0, node_fs_1.readFileSync)(outputPath, 'utf8')
            .split(/\r?\n/)
            .filter(Boolean)
            .forEach((line) => existingIds.add(JSON.parse(line).transcriptId));
    }
    else {
        (0, node_fs_1.mkdirSync)((0, node_path_1.dirname)(outputPath), { recursive: true });
        (0, node_fs_1.writeFileSync)(outputPath, '', 'utf8');
    }
    const records = readDataset(datasetPath)
        .filter((record) => split === 'all' || record.split === split)
        .filter((record) => !existingIds.has(record.transcriptId))
        .slice(0, limit);
    const observabilityNoop = { record: async () => null };
    const provider = new ai_provider_service_1.AiProviderService(observabilityNoop);
    const promptBuilder = new prompt_builder_service_1.PromptBuilderService();
    for (const [index, record] of records.entries()) {
        const inputData = {
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
        let prediction;
        try {
            const result = await provider.generateMeetingSummary(promptBuilder.buildMeetingSummaryPrompt(inputData), inputData);
            prediction = {
                transcriptId: record.transcriptId,
                model: result.model,
                latencyMs: Date.now() - started,
                error: null,
                actionItems: result.output.actionItems,
            };
        }
        catch (error) {
            prediction = {
                transcriptId: record.transcriptId,
                model: process.env.AI_MODEL ?? '',
                latencyMs: Date.now() - started,
                error: error instanceof Error ? error.message : String(error),
                actionItems: [],
            };
        }
        (0, node_fs_1.appendFileSync)(outputPath, `${JSON.stringify(prediction)}\n`, 'utf8');
        console.log(`[${index + 1}/${records.length}] ${record.transcriptId}: ${Array.isArray(prediction.actionItems) ? prediction.actionItems.length : 0} action items`);
    }
    console.log(`Hoàn tất. Prediction được lưu tại ${outputPath}.`);
}
main().catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
});
//# sourceMappingURL=run-action-item-evaluation-inference.js.map