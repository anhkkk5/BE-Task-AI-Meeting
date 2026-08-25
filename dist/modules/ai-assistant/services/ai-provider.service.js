"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AiProviderService = void 0;
const common_1 = require("@nestjs/common");
const transcript_noise_util_1 = require("../../../common/utils/transcript-noise.util");
const observability_service_1 = require("../../observability/observability.service");
let AiProviderService = class AiProviderService {
    observability;
    constructor(observability) {
        this.observability = observability;
    }
    async generateProjectAssistantAnswer(prompt, fallback) {
        const provider = process.env.AI_PROVIDER ?? 'mock';
        const apiKey = this.getApiKey(provider);
        if (!this.isRemoteProvider(provider) || !apiKey) {
            return {
                model: 'mock-project-assistant',
                rawResponse: JSON.stringify(fallback),
                output: fallback,
            };
        }
        const model = this.getGroqModel();
        const output = await this.callGroqJson({
            apiKey,
            model,
            system: 'Bạn là Trợ lý AgileFlow. Chỉ hỗ trợ cách sử dụng AgileFlow, kiến thức Agile/Scrum liên quan trực tiếp, và dữ liệu Workspace/Project/Sprint được hệ thống cung cấp. Nếu câu hỏi ngoài phạm vi này, hãy từ chối ngắn gọn và gợi ý người dùng hỏi về AgileFlow. Chỉ trả về JSON tiếng Việt có dấu. Không suy đoán người, ngày, trạng thái hoặc số liệu.',
            user: [
                prompt,
                '',
                'Trả về đúng JSON: {"answer":"câu trả lời ngắn, rõ và có hành động tiếp theo","suggestedQuestions":["tối đa 4 câu hỏi tiếp theo"]}',
            ].join('\n'),
        });
        const answer = output.answer?.trim() || fallback.answer;
        const suggestedQuestions = Array.isArray(output.suggestedQuestions)
            ? output.suggestedQuestions
                .filter((item) => typeof item === 'string' && Boolean(item.trim()))
                .slice(0, 4)
            : fallback.suggestedQuestions;
        return {
            model,
            rawResponse: JSON.stringify(output),
            output: { answer, suggestedQuestions },
        };
    }
    async generatePersonalDailyReport(prompt, inputData) {
        const provider = process.env.AI_PROVIDER ?? 'mock';
        const apiKey = this.getApiKey(provider);
        if (this.isRemoteProvider(provider) && apiKey) {
            return this.generateGroqPersonalDailyReport(prompt, inputData, apiKey);
        }
        const result = await this.resolveMockResponse(prompt, inputData, 'mock');
        return result;
    }
    async generateTeamDailyReport(prompt, inputData) {
        const provider = process.env.AI_PROVIDER ?? 'mock';
        const apiKey = this.getApiKey(provider);
        if (this.isRemoteProvider(provider) && apiKey) {
            return this.generateGroqTeamDailyReport(prompt, inputData, apiKey);
        }
        const result = await this.resolveTeamMockResponse(prompt, inputData, 'mock');
        return result;
    }
    async generateMeetingSummary(prompt, inputData) {
        const provider = process.env.AI_PROVIDER ?? 'mock';
        const apiKey = this.getApiKey(provider);
        if (this.isRemoteProvider(provider) && apiKey) {
            return this.generateGroqMeetingSummary(prompt, inputData, apiKey);
        }
        const result = await this.resolveMeetingSummaryMockResponse(prompt, inputData, 'mock');
        return result;
    }
    async generatePersonalizedMeetingSummary(prompt, inputData) {
        const provider = process.env.AI_PROVIDER ?? 'mock';
        const apiKey = this.getApiKey(provider);
        if (this.isRemoteProvider(provider) && apiKey) {
            return this.generateGroqPersonalizedMeetingSummary(prompt, inputData, apiKey);
        }
        const result = await this.resolvePersonalizedMeetingSummaryMockResponse(prompt, inputData, 'mock');
        return result;
    }
    async generateDailyUpdateDraft(prompt, inputData) {
        const provider = process.env.AI_PROVIDER ?? 'mock';
        const apiKey = this.getApiKey(provider);
        if (this.isRemoteProvider(provider) && apiKey) {
            const model = this.getGroqModel();
            const output = await this.callGroqJson({
                apiKey,
                model,
                system: 'Bạn là trợ lý Scrum. Chỉ trả về JSON hợp lệ bằng tiếng Việt có dấu, không dùng markdown và không thêm dữ liệu ngoài thông tin được cung cấp.',
                user: [
                    prompt,
                    '',
                    'Trả về đúng cấu trúc JSON sau:',
                    JSON.stringify({
                        yesterdayWork: 'string',
                        todayPlan: 'string',
                        blockers: 'string',
                        notes: 'string',
                    }, null, 2),
                ].join('\n'),
            });
            return {
                model,
                rawResponse: JSON.stringify(output),
                output: this.normalizeDailyUpdateDraft(output, inputData),
            };
        }
        const mockOutput = this.buildMockDailyUpdateDraft(inputData);
        return {
            model: 'mock-daily-update-draft',
            rawResponse: JSON.stringify(mockOutput),
            output: mockOutput,
        };
    }
    async generateHandoverDraft(prompt, inputData) {
        const provider = process.env.AI_PROVIDER ?? 'mock';
        const apiKey = this.getApiKey(provider);
        if (this.isRemoteProvider(provider) && apiKey) {
            const model = this.getGroqModel();
            const output = await this.callGroqJson({
                apiKey,
                model,
                system: 'Bạn là trợ lý Scrum. Chỉ trả về JSON hợp lệ bằng tiếng Việt có dấu, không dùng markdown và không thêm dữ liệu ngoài thông tin được cung cấp.',
                user: [
                    prompt,
                    '',
                    'Trả về đúng cấu trúc JSON sau:',
                    JSON.stringify({
                        completedWork: 'string',
                        remainingWork: 'string',
                        blockers: 'string',
                        nextSteps: 'string',
                        referenceLinks: 'string',
                    }, null, 2),
                ].join('\n'),
            });
            return {
                model,
                rawResponse: JSON.stringify(output),
                output: this.normalizeHandoverDraft(output, inputData),
            };
        }
        const mockOutput = this.buildMockHandoverDraft(inputData);
        return {
            model: 'mock-handover-draft',
            rawResponse: JSON.stringify(mockOutput),
            output: mockOutput,
        };
    }
    normalizeDailyUpdateDraft(output, inputData) {
        const fallback = this.buildMockDailyUpdateDraft(inputData);
        return {
            yesterdayWork: output.yesterdayWork?.trim() || fallback.yesterdayWork,
            todayPlan: output.todayPlan?.trim() || fallback.todayPlan,
            blockers: output.blockers?.trim() ?? '',
            notes: output.notes?.trim() ?? '',
        };
    }
    normalizeHandoverDraft(output, inputData) {
        const fallback = this.buildMockHandoverDraft(inputData);
        return {
            completedWork: output.completedWork?.trim() || fallback.completedWork,
            remainingWork: output.remainingWork?.trim() || fallback.remainingWork,
            blockers: output.blockers?.trim() ?? '',
            nextSteps: output.nextSteps?.trim() ?? '',
            referenceLinks: output.referenceLinks?.trim() ?? '',
        };
    }
    buildMockDailyUpdateDraft(inputData) {
        const { completed, inProgress, overdue } = inputData.taskSummary;
        const todayLines = [
            ...inProgress.map((item) => `Tiếp tục ${item}`),
            ...inputData.handovers.received.map((item) => `Tiếp nhận ${item.taskCode ?? 'task'} từ ${item.counterpartName ?? 'đồng nghiệp'}`),
        ];
        const blockerLines = [
            ...overdue.map((item) => `Trễ hạn: ${item}`),
            ...inputData.handovers.received
                .filter((item) => Boolean(item.blockers))
                .map((item) => `${item.taskCode ?? 'Task'}: ${item.blockers ?? ''}`),
        ];
        if (inputData.handovers.pendingForMe > 0) {
            blockerLines.push(`Còn ${inputData.handovers.pendingForMe} bàn giao chờ tôi xác nhận`);
        }
        return {
            yesterdayWork: completed.length
                ? completed.map((item) => `Hoàn thành ${item}`).join('\n')
                : 'Chưa có task nào hoàn thành trong dữ liệu hệ thống.',
            todayPlan: todayLines.length
                ? todayLines.join('\n')
                : 'Chưa có task đang thực hiện trong dữ liệu hệ thống.',
            blockers: blockerLines.join('\n'),
            notes: inputData.handovers.given.length
                ? inputData.handovers.given
                    .map((item) => `Đã bàn giao ${item.taskCode ?? 'task'} cho ${item.counterpartName ?? 'đồng nghiệp'}`)
                    .join('\n')
                : '',
        };
    }
    buildMockHandoverDraft(inputData) {
        const latestUpdate = inputData.recentDailyUpdates[0] ?? null;
        const taskLabel = `${inputData.task.taskCode} - ${inputData.task.title}`;
        return {
            completedWork: latestUpdate?.yesterdayWork?.trim() ||
                `Đã thực hiện ${taskLabel} đến trạng thái ${inputData.task.status}.`,
            remainingWork: latestUpdate?.todayPlan?.trim() ||
                `Cần bổ sung phần việc còn lại của ${taskLabel}: dữ liệu hệ thống chưa đủ để xác định.`,
            blockers: latestUpdate?.blockers?.trim() ?? '',
            nextSteps: inputData.task.dueDate
                ? `Ưu tiên hoàn thành trước hạn ${inputData.task.dueDate}.`
                : '',
            referenceLinks: '',
        };
    }
    resolveMockResponse(prompt, inputData, provider) {
        return Promise.resolve(this.generateMockResponse(prompt, inputData, provider));
    }
    generateMockResponse(prompt, inputData, provider) {
        const model = process.env.AI_MODEL || `${provider}-personal-report`;
        const userName = inputData.user.fullName || inputData.user.email;
        const completedTasks = inputData.taskSummary.completed;
        const inProgressTasks = inputData.taskSummary.inProgress;
        const blockerText = inputData.dailyUpdate?.blockers?.trim();
        const blockers = blockerText ? [blockerText] : [];
        const risks = inputData.taskSummary.overdue.length
            ? [
                `Co ${inputData.taskSummary.overdue.length} task qua han can duoc xu ly.`,
            ]
            : [];
        const recommendations = blockers.length
            ? ['Can Scrum Master hoac Project Manager ho tro xu ly blocker.']
            : [
                'Tiep tuc cap nhat daily update va trang thai task de bao cao chinh xac hon.',
            ];
        const yesterdaySummary = inputData.dailyUpdate?.yesterdayWork ?? 'Chua co du lieu daily update.';
        const todayPlanSummary = inputData.dailyUpdate?.todayPlan ?? 'Chua co du lieu ke hoach hom nay.';
        const summaryParts = [
            `${userName} co ${inputData.tasks.length} task duoc gan trong project ${inputData.project.keyCode}.`,
            completedTasks.length
                ? `Da hoan thanh: ${completedTasks.join(', ')}.`
                : 'Chua co task hoan thanh trong du lieu cung cap.',
            inProgressTasks.length
                ? `Dang thuc hien: ${inProgressTasks.join(', ')}.`
                : 'Chua co task dang thuc hien trong du lieu cung cap.',
            blockers.length ? `Blocker: ${blockers.join('; ')}.` : '',
        ].filter(Boolean);
        const output = {
            title: `Bao cao giao ban ca nhan - ${userName}`,
            summary: summaryParts.join(' '),
            yesterdaySummary,
            todayPlanSummary,
            completedTasks,
            inProgressTasks,
            blockers,
            risks,
            recommendations,
            generatedText: [
                `Bao cao giao ban ca nhan - ${userName}`,
                '',
                `Hom qua: ${yesterdaySummary}`,
                `Hom nay: ${todayPlanSummary}`,
                completedTasks.length
                    ? `Task da hoan thanh: ${completedTasks.join(', ')}.`
                    : 'Task da hoan thanh: Chua co du lieu.',
                inProgressTasks.length
                    ? `Task dang thuc hien: ${inProgressTasks.join(', ')}.`
                    : 'Task dang thuc hien: Chua co du lieu.',
                blockers.length
                    ? `Blocker: ${blockers.join('; ')}.`
                    : 'Blocker: Chua co du lieu.',
                risks.length
                    ? `Rui ro: ${risks.join('; ')}.`
                    : 'Rui ro: Chua co du lieu.',
                `Khuyen nghi: ${recommendations.join(' ')}`,
            ].join('\n'),
        };
        return {
            model,
            output,
            rawResponse: JSON.stringify({
                provider,
                promptLength: prompt.length,
                ...output,
            }),
        };
    }
    resolveTeamMockResponse(prompt, inputData, provider) {
        return Promise.resolve(this.generateTeamMockResponse(prompt, inputData, provider));
    }
    resolveMeetingSummaryMockResponse(prompt, inputData, provider) {
        return Promise.resolve(this.generateMeetingSummaryMockResponse(prompt, inputData, provider));
    }
    resolvePersonalizedMeetingSummaryMockResponse(prompt, inputData, provider) {
        return Promise.resolve(this.generatePersonalizedMeetingSummaryMockResponse(prompt, inputData, provider));
    }
    async generateGroqPersonalDailyReport(prompt, inputData, apiKey) {
        const model = this.getGroqModel();
        const output = await this.callGroqJson({
            apiKey,
            model,
            system: 'Bạn là trợ lý Scrum. Chỉ trả về JSON hợp lệ bằng tiếng Việt, không dùng markdown và không thêm dữ liệu ngoài thông tin được cung cấp.',
            user: [
                prompt,
                '',
                'Trả về đúng cấu trúc JSON sau:',
                JSON.stringify({
                    title: 'string',
                    summary: 'string',
                    yesterdaySummary: 'string',
                    todayPlanSummary: 'string',
                    completedTasks: ['string'],
                    inProgressTasks: ['string'],
                    blockers: ['string'],
                    risks: ['string'],
                    recommendations: ['string'],
                    generatedText: 'string',
                }, null, 2),
            ].join('\n'),
        });
        const normalizedOutput = this.normalizePersonalDailyReportOutput(output, inputData);
        return {
            model,
            rawResponse: JSON.stringify(output),
            output: normalizedOutput,
        };
    }
    async generateGroqTeamDailyReport(prompt, inputData, apiKey) {
        const model = this.getGroqModel();
        const output = await this.callGroqJson({
            apiKey,
            model,
            system: 'Bạn là trợ lý Scrum Master. Chỉ trả về JSON hợp lệ bằng tiếng Việt, không dùng markdown và không thêm dữ liệu ngoài thông tin được cung cấp.',
            user: [
                prompt,
                '',
                'Trả về đúng cấu trúc JSON sau:',
                JSON.stringify({
                    title: 'string',
                    summary: 'string',
                    teamProgress: 'string',
                    completedWork: ['string'],
                    todayFocus: ['string'],
                    blockers: ['string'],
                    risks: ['string'],
                    missingDailyUpdates: ['string'],
                    memberSummaries: [
                        {
                            userId: 'string',
                            fullName: 'string',
                            summary: 'string',
                            blockers: ['string'],
                        },
                    ],
                    recommendations: ['string'],
                    generatedText: 'string',
                }, null, 2),
            ].join('\n'),
        });
        const normalizedOutput = this.normalizeTeamDailyReportOutput(output, inputData);
        return {
            model,
            rawResponse: JSON.stringify(output),
            output: normalizedOutput,
        };
    }
    async generateGroqPersonalizedMeetingSummary(prompt, inputData, apiKey) {
        const model = this.getGroqModel();
        const output = await this.callGroqJson({
            apiKey,
            model,
            system: 'Bạn là trợ lý cuộc họp cá nhân. Chỉ trả về JSON hợp lệ bằng tiếng Việt, không dùng markdown và chỉ dùng dữ liệu liên quan trực tiếp đến người dùng mục tiêu.',
            user: [
                prompt,
                '',
                'Trả về đúng cấu trúc JSON sau:',
                JSON.stringify({
                    title: 'string',
                    personalSummary: 'string',
                    relevantDecisions: ['string'],
                    myActionItems: [
                        {
                            title: 'string',
                            assigneeId: 'string or null',
                            assigneeName: 'string or null',
                            deadline: 'YYYY-MM-DD or null',
                            source: 'string or null',
                        },
                    ],
                    mentions: ['string'],
                    risks: ['string'],
                    nextSteps: ['string'],
                    generatedText: 'string',
                }, null, 2),
            ].join('\n'),
        });
        const normalizedOutput = this.normalizePersonalizedMeetingSummaryOutput(output, inputData);
        return {
            model,
            rawResponse: JSON.stringify(output),
            output: normalizedOutput,
        };
    }
    async generateGroqMeetingSummary(prompt, inputData, apiKey) {
        const model = this.getGroqModel();
        const output = await this.callGroqJson({
            apiKey,
            model,
            system: 'Bạn là trợ lý tóm tắt cuộc họp dự án Agile. Chỉ trả về JSON hợp lệ bằng tiếng Việt có dấu, không dùng markdown và không thêm dữ liệu không có trong biên bản.',
            user: [
                prompt,
                '',
                'Trả về đúng cấu trúc JSON sau:',
                JSON.stringify({
                    title: 'string',
                    summary: 'string',
                    keyPoints: ['string'],
                    decisions: ['string'],
                    actionItems: [
                        {
                            text: 'string',
                            assigneeName: 'string or null',
                            assigneeUserId: 'string or null',
                            dueDate: 'YYYY-MM-DD or null',
                            status: 'OPEN',
                            source: 'string or null',
                        },
                    ],
                    risks: ['string'],
                    openQuestions: ['string'],
                    nextSteps: ['string'],
                    generatedText: 'string',
                }, null, 2),
            ].join('\n'),
        });
        return {
            model,
            rawResponse: JSON.stringify(output),
            output: this.normalizeMeetingSummaryOutput(output, inputData),
        };
    }
    async callGroqJson(params) {
        const started = Date.now();
        const provider = process.env.AI_PROVIDER === 'openai' ? 'openai' : 'groq';
        const endpoint = provider === 'openai'
            ? 'https://api.openai.com/v1/chat/completions'
            : 'https://api.groq.com/openai/v1/chat/completions';
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${params.apiKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: params.model,
                messages: [
                    {
                        role: 'system',
                        content: params.system,
                    },
                    {
                        role: 'user',
                        content: params.user,
                    },
                ],
                response_format: {
                    type: 'json_object',
                },
                max_completion_tokens: 2048,
            }),
        });
        const rawText = await response.text();
        if (!response.ok) {
            await this.observability?.record({
                kind: 'AI',
                status: 'FAILED',
                operation: `${provider}.${params.model}`,
                durationMs: Date.now() - started,
                inputTokens: null,
                outputTokens: null,
                estimatedCostUsd: null,
                error: `HTTP ${response.status}: ${rawText.slice(0, 500)}`,
                metadata: null,
            });
            throw new Error(`${provider} API failed: ${response.status} ${rawText}`);
        }
        const groqResponse = JSON.parse(rawText);
        const content = groqResponse.choices?.[0]?.message?.content;
        if (!content) {
            throw new Error(`${provider} API returned empty content`);
        }
        const inputTokens = groqResponse.usage?.prompt_tokens ?? 0;
        const outputTokens = groqResponse.usage?.completion_tokens ?? 0;
        const inputRate = Number(process.env.AI_INPUT_COST_PER_MILLION_USD ?? 0);
        const outputRate = Number(process.env.AI_OUTPUT_COST_PER_MILLION_USD ?? 0);
        await this.observability?.record({
            kind: 'AI',
            status: 'SUCCESS',
            operation: `${provider}.${params.model}`,
            durationMs: Date.now() - started,
            inputTokens,
            outputTokens,
            estimatedCostUsd: (inputTokens * inputRate + outputTokens * outputRate) / 1_000_000,
            error: null,
            metadata: { model: groqResponse.model ?? params.model, provider },
        });
        return this.parseJsonContent(content);
    }
    parseJsonContent(content) {
        const cleaned = content
            .trim()
            .replace(/^```json\s*/i, '')
            .replace(/^```\s*/i, '')
            .replace(/\s*```$/i, '');
        return JSON.parse(cleaned);
    }
    getGroqModel() {
        if (process.env.AI_MODEL)
            return process.env.AI_MODEL;
        return process.env.AI_PROVIDER === 'openai'
            ? 'gpt-5.6-luna'
            : 'llama-3.3-70b-versatile';
    }
    isRemoteProvider(provider) {
        return provider === 'groq' || provider === 'openai';
    }
    getApiKey(provider) {
        if (provider === 'openai')
            return process.env.OPENAI_API_KEY ?? '';
        if (provider === 'groq') {
            return process.env.GROQ_API_KEY ?? process.env.AI_API_KEY ?? '';
        }
        return '';
    }
    normalizePersonalDailyReportOutput(output, inputData) {
        const userName = inputData.user.fullName || inputData.user.email;
        const title = this.normalizeText(output.title, `Báo cáo giao ban cá nhân - ${userName}`);
        const summary = this.normalizeText(output.summary, 'Chưa có đủ dữ liệu để tổng hợp báo cáo.');
        return {
            title,
            summary,
            yesterdaySummary: this.normalizeText(output.yesterdaySummary, 'Chưa có dữ liệu.'),
            todayPlanSummary: this.normalizeText(output.todayPlanSummary, 'Chưa có dữ liệu.'),
            completedTasks: this.normalizeTextArray(output.completedTasks),
            inProgressTasks: this.normalizeTextArray(output.inProgressTasks),
            blockers: this.normalizeTextArray(output.blockers),
            risks: this.normalizeTextArray(output.risks),
            recommendations: this.normalizeTextArray(output.recommendations),
            generatedText: this.normalizeText(output.generatedText, `${title}\n\n${summary}`),
        };
    }
    normalizeTeamDailyReportOutput(output, inputData) {
        const scopeName = inputData.sprint?.name ?? inputData.project.name;
        const title = this.normalizeText(output.title, `Báo cáo giao ban nhóm - ${scopeName}`);
        const summary = this.normalizeText(output.summary, 'Chưa có đủ dữ liệu để tổng hợp báo cáo.');
        const memberSummaries = Array.isArray(output.memberSummaries)
            ? output.memberSummaries
                .filter((item) => item && typeof item === 'object')
                .map((item) => ({
                userId: this.normalizeText(item.userId, ''),
                fullName: this.normalizeText(item.fullName, 'Chưa rõ thành viên'),
                summary: this.normalizeText(item.summary, 'Chưa có dữ liệu.'),
                blockers: this.normalizeTextArray(item.blockers),
            }))
                .filter((item) => item.userId)
            : [];
        return {
            title,
            summary,
            teamProgress: this.normalizeText(output.teamProgress, 'Chưa có dữ liệu tiến độ.'),
            completedWork: this.normalizeTextArray(output.completedWork),
            todayFocus: this.normalizeTextArray(output.todayFocus),
            blockers: this.normalizeTextArray(output.blockers),
            risks: this.normalizeTextArray(output.risks),
            missingDailyUpdates: this.normalizeTextArray(output.missingDailyUpdates),
            memberSummaries,
            recommendations: this.normalizeTextArray(output.recommendations),
            generatedText: this.normalizeText(output.generatedText, `${title}\n\n${summary}`),
        };
    }
    normalizePersonalizedMeetingSummaryOutput(output, inputData) {
        const targetName = inputData.targetUser.fullName || inputData.targetUser.email;
        const title = this.normalizeText(output.title, `Tóm tắt cuộc họp dành cho ${targetName}`);
        const personalSummary = this.normalizeText(output.personalSummary, 'Chưa có nội dung liên quan trực tiếp.');
        const myActionItems = Array.isArray(output.myActionItems)
            ? output.myActionItems
                .filter((item) => item && typeof item === 'object')
                .map((item) => ({
                title: this.normalizeText(item.title, ''),
                assigneeId: item.assigneeId ?? null,
                assigneeName: item.assigneeName ?? null,
                deadline: item.deadline ?? null,
                source: item.source ?? null,
            }))
                .filter((item) => item.title &&
                !this.isOffTopicMeetingLine(item.title) &&
                !this.isReportingInstruction(item.title) &&
                this.isActionItemForTarget(item, inputData))
            : [];
        return {
            title,
            personalSummary,
            relevantDecisions: this.cleanMeetingTextArray(output.relevantDecisions),
            myActionItems,
            mentions: this.cleanMeetingTextArray(output.mentions),
            risks: this.cleanMeetingTextArray(output.risks),
            nextSteps: this.cleanMeetingTextArray(output.nextSteps),
            generatedText: this.normalizeText(output.generatedText, `${title}\n\n${personalSummary}`),
        };
    }
    normalizeText(value, fallback) {
        return typeof value === 'string' && value.trim() ? value.trim() : fallback;
    }
    normalizeTextArray(value) {
        return Array.isArray(value)
            ? value
                .filter((item) => typeof item === 'string')
                .map((item) => item.trim())
                .filter(Boolean)
            : [];
    }
    cleanMeetingTextArray(value) {
        return this.normalizeTextArray(value).filter((item) => !this.isOffTopicMeetingLine(item) &&
            !this.isReportingInstruction(item));
    }
    isActionItemForTarget(item, inputData) {
        if (item.assigneeId)
            return item.assigneeId === inputData.targetUser.userId;
        const targetName = this.normalizeForMatching(inputData.targetUser.fullName);
        const assigneeName = this.normalizeForMatching(item.assigneeName ?? '');
        if (targetName && assigneeName)
            return assigneeName.includes(targetName);
        const normalizedTitle = this.normalizeForMatching(item.title);
        return inputData.targetActionItems.some((source) => normalizedTitle.includes(this.normalizeForMatching(source.text)));
    }
    normalizeMeetingSummaryOutput(output, inputData) {
        const title = typeof output.title === 'string' && output.title.trim()
            ? output.title.trim()
            : `Tom tat meeting - ${inputData.meeting.title}`;
        const summary = typeof output.summary === 'string' && output.summary.trim()
            ? output.summary.trim()
            : 'Chua co du lieu du de tong hop.';
        const actionItems = Array.isArray(output.actionItems)
            ? output.actionItems
                .filter((item) => item?.text &&
                !this.isOffTopicMeetingLine(item.text) &&
                !this.isReportingInstruction(item.text))
                .map((item) => {
                const assignee = this.resolveMeetingAssignee(item, inputData);
                return {
                    text: item.text,
                    assigneeName: assignee.assigneeName,
                    assigneeUserId: assignee.assigneeUserId,
                    dueDate: item.dueDate ?? null,
                    status: item.status ?? 'OPEN',
                    source: item.source ?? item.text,
                };
            })
            : [];
        return {
            title,
            summary,
            keyPoints: this.cleanMeetingTextArray(output.keyPoints),
            decisions: this.cleanMeetingTextArray(output.decisions),
            actionItems,
            risks: this.cleanMeetingTextArray(output.risks),
            openQuestions: this.cleanMeetingTextArray(output.openQuestions),
            nextSteps: this.cleanMeetingTextArray(output.nextSteps),
            generatedText: typeof output.generatedText === 'string' && output.generatedText.trim()
                ? output.generatedText
                : [
                    title,
                    '',
                    `Tong quan: ${summary}`,
                    actionItems.length
                        ? `Viec can lam: ${actionItems
                            .map((item) => item.text)
                            .join('; ')}`
                        : 'Viec can lam: Chua co du lieu.',
                ].join('\n'),
        };
    }
    resolveMeetingAssignee(item, inputData) {
        const participants = inputData.participants ?? [];
        const rawName = item.assigneeName?.trim() || '';
        const rawUserId = item.assigneeUserId?.trim() || '';
        const byId = participants.find((participant) => participant.userId === rawUserId ||
            (rawName && participant.userId === rawName));
        if (byId) {
            return {
                assigneeName: byId.fullName || byId.email || null,
                assigneeUserId: byId.userId,
            };
        }
        const normalizedName = this.normalizeNameKey(rawName);
        const byName = normalizedName
            ? participants.find((participant) => this.normalizeNameKey(participant.fullName ?? '') ===
                normalizedName ||
                this.normalizeNameKey(participant.email ?? '') === normalizedName)
            : undefined;
        if (byName) {
            return {
                assigneeName: byName.fullName || byName.email || null,
                assigneeUserId: byName.userId,
            };
        }
        return {
            assigneeName: this.isUuidLike(rawName) ? null : rawName || null,
            assigneeUserId: this.isUuidLike(rawUserId) ? rawUserId : null,
        };
    }
    normalizeNameKey(value) {
        return (0, transcript_noise_util_1.stripDiacritics)(value).toLowerCase().replace(/\s+/g, ' ').trim();
    }
    isUuidLike(value) {
        return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
    }
    generateMeetingSummaryMockResponse(prompt, inputData, provider) {
        const model = `${provider}-meeting-summary`;
        const transcriptLines = this.getTranscriptLines(inputData);
        const workLines = transcriptLines.filter((line) => !this.isOffTopicMeetingLine(line));
        const keyPoints = workLines
            .filter((line) => this.isWorkRelevantMeetingLine(line))
            .slice(0, 6);
        const decisions = workLines
            .filter((line) => this.hasDecisionSignal(line))
            .slice(0, 8);
        const actionItems = workLines
            .filter((line) => this.hasActionSignal(line))
            .slice(0, 8)
            .map((line) => this.toMeetingActionItem(line, inputData));
        const risks = workLines
            .filter((line) => this.hasRiskSignal(line))
            .slice(0, 8);
        const openQuestions = workLines
            .filter((line) => (line.includes('?') || /câu hỏi|hỏi lại/i.test(line)) &&
            !this.isReportingInstruction(line))
            .slice(0, 8);
        const nextSteps = actionItems.length
            ? actionItems.map((item) => item.text).slice(0, 5)
            : [];
        const participantText = inputData.participants.length
            ? `${inputData.participants.length} participant`
            : 'chua co participant trong du lieu';
        const summary = [
            `Meeting "${inputData.meeting.title}" co ${transcriptLines.length} dong transcript va ${participantText}.`,
            keyPoints.length
                ? `Noi dung chinh: ${keyPoints.slice(0, 3).join(' ')}`
                : 'Transcript chua co noi dung du de tong hop.',
        ].join(' ');
        const output = {
            title: `Tom tat meeting - ${inputData.meeting.title}`,
            summary,
            keyPoints,
            decisions,
            actionItems,
            risks,
            openQuestions,
            nextSteps,
            generatedText: [
                `Tom tat meeting - ${inputData.meeting.title}`,
                '',
                `Tong quan: ${summary}`,
                keyPoints.length
                    ? `Y chinh: ${keyPoints.join('; ')}`
                    : 'Y chinh: Chua co du lieu.',
                decisions.length
                    ? `Quyet dinh: ${decisions.join('; ')}`
                    : 'Quyet dinh: Chua co du lieu.',
                actionItems.length
                    ? `Action items: ${actionItems.map((item) => item.text).join('; ')}`
                    : 'Action items: Chua co du lieu.',
                risks.length
                    ? `Rui ro: ${risks.join('; ')}`
                    : 'Rui ro: Chua co du lieu.',
                openQuestions.length
                    ? `Cau hoi mo: ${openQuestions.join('; ')}`
                    : 'Cau hoi mo: Chua co du lieu.',
            ].join('\n'),
        };
        return {
            model,
            output,
            rawResponse: JSON.stringify({
                provider,
                promptLength: prompt.length,
                ...output,
            }),
        };
    }
    getTranscriptLines(inputData) {
        if (inputData.transcript.speakers.length) {
            return inputData.transcript.speakers
                .filter((speaker) => !(0, transcript_noise_util_1.isNoiseTranscript)(speaker.text))
                .map((speaker) => [speaker.speakerName, speaker.text].filter(Boolean).join(': ').trim())
                .filter(Boolean);
        }
        return inputData.transcript.normalizedTranscript
            .split(/\r?\n/)
            .map((line) => line.trim())
            .filter(Boolean)
            .filter((line) => {
            const [, ...rest] = line.split(':');
            return !(0, transcript_noise_util_1.isNoiseTranscript)(rest.length ? rest.join(':') : line);
        });
    }
    hasDecisionSignal(line) {
        return /quyet dinh|thong nhat|chot|dong y|approved|decided/.test(this.normalizeForMatching(line));
    }
    hasActionSignal(line) {
        return /\b(se|can|phai|todo|action item|lam|xu ly|phu trach|giao cho)\b/.test(this.normalizeForMatching(line));
    }
    hasRiskSignal(line) {
        const normalized = this.normalizeForMatching(line);
        if (/muc tieu.*(xem|ra soat).*blocker/.test(normalized))
            return false;
        return /\b(blocker|rui ro|qua han|bi chan|dang chan|loi|cham|thieu tai nguyen|chua hoan thanh)\b/.test(normalized);
    }
    toMeetingActionItem(line, inputData) {
        const [maybeSpeaker, ...rest] = line.split(':');
        const assigneeName = rest.length ? maybeSpeaker.trim() : null;
        const participant = inputData.participants.find((item) => item.fullName?.toLowerCase() === assigneeName?.toLowerCase() ||
            item.email?.split('@')[0].toLowerCase() === assigneeName?.toLowerCase());
        return {
            text: line,
            assigneeName: (participant?.fullName ?? assigneeName) || null,
            assigneeUserId: participant?.userId ?? null,
            dueDate: null,
            status: 'OPEN',
            source: line,
        };
    }
    normalizeForMatching(value) {
        return value
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/đ/g, 'd')
            .replace(/Đ/g, 'D')
            .toLowerCase();
    }
    isOffTopicMeetingLine(line) {
        const value = this.normalizeForMatching(line);
        return /ca phe|banh ngon|gui xe|troi mua|den muon|dieu hoa|phong hop hoi lanh|cuoi tuan moi nguoi co di/.test(value);
    }
    isReportingInstruction(line) {
        const value = this.normalizeForMatching(line);
        return /khong dua.*bao cao|cach viet bao cao|tom tat.*khong dua/.test(value);
    }
    isWorkRelevantMeetingLine(line) {
        const value = this.normalizeForMatching(line);
        return /task|sprint|api|backend|frontend|test|pull request|review|demo|phat hanh|deadline|han |blocker|staging|database|devops|transcript|audio|dependency|quyet dinh|thong nhat|phu trach|hoan thanh|dang lam|loi/.test(value);
    }
    generatePersonalizedMeetingSummaryMockResponse(prompt, inputData, provider) {
        const model = `${provider}-personalized-meeting-summary`;
        const targetName = inputData.targetUser.fullName || inputData.targetUser.email;
        const mentions = inputData.relatedTranscriptSnippets
            .filter((item) => !this.isOffTopicMeetingLine(item) &&
            !this.isReportingInstruction(item))
            .slice(0, 10);
        const myActionItems = inputData.targetActionItems
            .slice(0, 10)
            .map((item) => this.toPersonalizedMeetingActionItem(item));
        const relevantDecisions = inputData.meetingSummary.decisions
            .filter((decision) => this.textRelatesToTarget(decision, inputData))
            .slice(0, 8);
        const risks = inputData.meetingSummary.risks
            .filter((risk) => this.textRelatesToTarget(risk, inputData))
            .slice(0, 8);
        const nextSteps = myActionItems.map((item) => item.title).slice(0, 8);
        const hasDirectContent = mentions.length ||
            myActionItems.length ||
            relevantDecisions.length ||
            risks.length;
        const personalSummary = hasDirectContent
            ? [
                `${targetName} có nội dung cần theo dõi sau cuộc họp “${inputData.meeting.title}”.`,
                myActionItems.length
                    ? `Ưu tiên tiếp theo: ${myActionItems
                        .map((item) => item.title)
                        .slice(0, 2)
                        .join('; ')}.`
                    : relevantDecisions.length
                        ? `Có ${relevantDecisions.length} quyết định liên quan cần lưu ý.`
                        : '',
                risks.length
                    ? `Có ${risks.length} rủi ro hoặc điểm nghẽn cần theo dõi.`
                    : '',
            ]
                .filter(Boolean)
                .join(' ')
            : 'Chưa có nội dung công việc liên quan trực tiếp đến bạn trong cuộc họp này.';
        const output = {
            title: `Tóm tắt dành cho ${targetName}`,
            personalSummary,
            relevantDecisions,
            myActionItems,
            mentions,
            risks,
            nextSteps,
            generatedText: [
                `Tóm tắt dành cho ${targetName}`,
                '',
                personalSummary,
                relevantDecisions.length
                    ? `Quyết định liên quan: ${relevantDecisions.join('; ')}`
                    : 'Quyết định liên quan: Chưa có dữ liệu.',
                myActionItems.length
                    ? `Việc cần làm: ${myActionItems
                        .map((item) => item.title)
                        .join('; ')}`
                    : 'Việc cần làm: Chưa có dữ liệu.',
                mentions.length
                    ? `Nội dung đối chiếu: ${mentions.join('; ')}`
                    : 'Nội dung đối chiếu: Chưa có dữ liệu.',
                risks.length
                    ? `Rủi ro: ${risks.join('; ')}`
                    : 'Rủi ro: Chưa có dữ liệu.',
                nextSteps.length
                    ? `Bước tiếp theo: ${nextSteps.join('; ')}`
                    : 'Bước tiếp theo: Chưa có dữ liệu.',
            ].join('\n'),
        };
        return {
            model,
            output,
            rawResponse: JSON.stringify({
                provider,
                promptLength: prompt.length,
                ...output,
            }),
        };
    }
    textMentionsTarget(text, inputData) {
        const normalizedText = text.toLowerCase();
        const targetName = inputData.targetUser.fullName.toLowerCase();
        return (Boolean(targetName && normalizedText.includes(targetName)) ||
            normalizedText.includes(inputData.targetUser.email.toLowerCase()));
    }
    textRelatesToTarget(text, inputData) {
        if (this.textMentionsTarget(text, inputData))
            return true;
        const normalized = this.normalizeForMatching(text);
        return (inputData.assignedTasks ?? []).some((task) => {
            if (normalized.includes(this.normalizeForMatching(task.taskCode)))
                return true;
            const meaningfulWords = this.normalizeForMatching(task.title)
                .split(/\s+/)
                .filter((word) => word.length >= 5);
            return meaningfulWords.length > 0 && meaningfulWords.some((word) => normalized.includes(word));
        });
    }
    toPersonalizedMeetingActionItem(item) {
        const cleanText = item.text
            .split(/(?<=[.!?])\s+/)
            .filter((sentence) => !this.isReportingInstruction(sentence))
            .join(' ')
            .trim();
        return {
            title: cleanText || item.text,
            assigneeId: item.assigneeUserId ?? null,
            assigneeName: item.assigneeName ?? null,
            deadline: item.dueDate ?? null,
            source: item.source
                ? item.source
                    .split(/(?<=[.!?])\s+/)
                    .filter((sentence) => !this.isReportingInstruction(sentence))
                    .join(' ')
                    .trim()
                : cleanText || item.text,
        };
    }
    generateTeamMockResponse(prompt, inputData, provider) {
        const model = process.env.AI_MODEL || `${provider}-team-report`;
        const completedWork = inputData.tasks
            .filter((task) => task.status === 'DONE')
            .map((task) => `${task.taskCode} - ${task.title}`);
        const todayFocus = inputData.dailyUpdates
            .map((dailyUpdate) => `${dailyUpdate.fullName}: ${dailyUpdate.todayPlan || 'Chua co du lieu'}`)
            .slice(0, 10);
        const blockers = inputData.blockers.map((blocker) => `${blocker.fullName}: ${blocker.blocker}`);
        const missingDailyUpdates = inputData.missingDailyUpdateMembers.map((member) => `${member.fullName} chua gui daily update.`);
        const risks = [
            ...inputData.overdueTasks.map((task) => `${task.taskCode} - ${task.title} qua han tu ${task.dueDate ?? 'khong ro ngay'}.`),
        ].slice(0, 12);
        const recommendations = [
            ...(blockers.length
                ? ['Scrum Master can xu ly cac blocker truoc daily tiep theo.']
                : []),
            ...(inputData.overdueTasks.length
                ? ['Uu tien ra soat va cap nhat cac task qua han.']
                : []),
            ...(missingDailyUpdates.length
                ? ['Nhac cac member con thieu daily update trong hom nay.']
                : []),
            'Tiep tuc cap nhat task va daily update de bao cao AI chinh xac hon.',
        ];
        const sprintName = inputData.sprint?.name ?? inputData.project.name;
        const summaryParts = [
            `Team co ${inputData.members.length} member, ${inputData.dailyUpdates.length} daily update va ${inputData.tasks.length} task trong du lieu cung cap.`,
            completedWork.length
                ? `Da hoan thanh: ${completedWork.join(', ')}.`
                : 'Chua co task DONE trong du lieu cung cap.',
            blockers.length
                ? `Co blocker: ${blockers.join('; ')}.`
                : 'Chua ghi nhan blocker.',
        ];
        const teamProgress = [
            `Task DONE: ${inputData.taskStats.DONE}.`,
            `IN_PROGRESS/REVIEW: ${inputData.taskStats.IN_PROGRESS + inputData.taskStats.REVIEW}.`,
            `TODO/BACKLOG: ${inputData.taskStats.TODO + inputData.taskStats.BACKLOG}.`,
        ].join(' ');
        const memberSummaries = inputData.members.map((member) => {
            const dailyUpdate = inputData.dailyUpdates.find((item) => item.userId === member.userId);
            const memberBlockers = inputData.blockers
                .filter((blocker) => blocker.userId === member.userId)
                .map((blocker) => blocker.blocker);
            return {
                userId: member.userId,
                fullName: member.fullName,
                summary: dailyUpdate
                    ? `${dailyUpdate.yesterdayWork || 'Chua co du lieu hom qua'} Hom nay: ${dailyUpdate.todayPlan || 'Chua co du lieu'}`
                    : 'Chua gui daily update trong ngay bao cao.',
                blockers: memberBlockers,
            };
        });
        const output = {
            title: `Bao cao giao ban nhom - ${sprintName}`,
            summary: summaryParts.join(' '),
            teamProgress,
            completedWork,
            todayFocus,
            blockers,
            risks,
            missingDailyUpdates,
            memberSummaries,
            recommendations,
            generatedText: [
                `Bao cao giao ban nhom - ${sprintName}`,
                '',
                `Tong quan: ${summaryParts.join(' ')}`,
                `Tien do: ${teamProgress}`,
                completedWork.length
                    ? `Da hoan thanh: ${completedWork.join(', ')}.`
                    : 'Da hoan thanh: Chua co du lieu.',
                todayFocus.length
                    ? `Trong tam hom nay: ${todayFocus.join('; ')}.`
                    : 'Trong tam hom nay: Chua co du lieu.',
                blockers.length
                    ? `Blocker: ${blockers.join('; ')}.`
                    : 'Blocker: Chua co du lieu.',
                risks.length
                    ? `Rui ro: ${risks.join('; ')}.`
                    : 'Rui ro: Chua co du lieu.',
                missingDailyUpdates.length
                    ? `Thieu daily update: ${missingDailyUpdates.join(' ')}`
                    : 'Tat ca member trong du lieu da co daily update hoac chua co danh sach member.',
                `De xuat: ${recommendations.join(' ')}`,
            ].join('\n'),
        };
        return {
            model,
            output,
            rawResponse: JSON.stringify({
                provider,
                promptLength: prompt.length,
                ...output,
            }),
        };
    }
};
exports.AiProviderService = AiProviderService;
exports.AiProviderService = AiProviderService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [observability_service_1.ObservabilityService])
], AiProviderService);
//# sourceMappingURL=ai-provider.service.js.map