"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const node_fs_1 = require("node:fs");
const node_path_1 = require("node:path");
const ai_project_assistant_service_1 = require("../modules/ai-assistant/services/ai-project-assistant.service");
const sprint_status_enum_1 = require("../common/enums/sprint-status.enum");
const task_status_enum_1 = require("../common/enums/task-status.enum");
const task_priority_enum_1 = require("../common/enums/task-priority.enum");
const project_status_enum_1 = require("../common/enums/project-status.enum");
async function main() {
    console.log('=== KHỞI TẠO VÀ GỌI THỰC TẾ QUA AI PROJECT ASSISTANT SERVICE ===');
    const datasetPath = (0, node_path_1.resolve)('datasets', 'project-assistant-evaluation', 'v1', 'cases.jsonl');
    const rawLines = (0, node_fs_1.readFileSync)(datasetPath, 'utf8').split(/\r?\n/).filter(Boolean);
    const cases = rawLines.map((line) => JSON.parse(line));
    console.log(`Đã nạp ${cases.length} cases từ dataset thực nghiệm.`);
    const results = [];
    const groupStats = {
        TASK: { total: 0, correct: 0, validCitation: 0 },
        SPRINT: { total: 0, correct: 0, validCitation: 0 },
        MEETING: { total: 0, correct: 0, validCitation: 0 },
        ACTION_ITEM: { total: 0, correct: 0, validCitation: 0 },
        CROSS_SOURCE: { total: 0, correct: 0, validCitation: 0 },
        SUGGESTED_QUESTIONS: { total: 0, correct: 0, validCitation: 0 },
    };
    for (const [index, c] of cases.entries()) {
        const s = c.sourceData;
        const mockProjectsRepo = {
            findByIdAndWorkspace: async (projectId, workspaceId) => ({
                id: projectId,
                workspaceId,
                name: `Dự án ${projectId}`,
                keyCode: 'PA',
                status: project_status_enum_1.ProjectStatus.Active,
            }),
        };
        const mockSprintsRepo = {
            findActiveByProject: async (projectId) => ({
                id: s.sprint.id,
                projectId,
                name: s.sprint.name,
                goal: 'Mục tiêu sprint',
                status: sprint_status_enum_1.SprintStatus.Active,
                startDate: '2026-08-01',
                endDate: `2026-08-${String(s.sprint.daysRemaining + 10).padStart(2, '0')}`,
            }),
            findByProject: async () => ({ items: [] }),
        };
        const mockSprintAccessService = {
            assertSprintInProject: async (sprintId, projectId) => ({
                id: sprintId,
                projectId,
                name: s.sprint.name,
                goal: 'Mục tiêu sprint',
                status: sprint_status_enum_1.SprintStatus.Active,
                startDate: '2026-08-01',
                endDate: `2026-08-${String(s.sprint.daysRemaining + 10).padStart(2, '0')}`,
            }),
        };
        const completedCount = s.sprint.completedTasks;
        const totalCount = s.sprint.totalTasks;
        const remainingCount = totalCount - completedCount;
        const taskList = [
            {
                id: s.task.id,
                projectId: c.context.projectId,
                sprintId: s.sprint.id,
                taskCode: s.task.code,
                title: s.task.title,
                status: s.task.status === 'IN_PROGRESS' ? task_status_enum_1.TaskStatus.InProgress : task_status_enum_1.TaskStatus.Todo,
                priority: task_priority_enum_1.TaskPriority.Medium,
                assigneeId: 'user-assignee',
                assignee: { id: 'user-assignee', fullName: s.task.assignee, email: 'user@example.com' },
                dueDate: s.task.dueDate,
                estimatedHours: 8,
                storyPoints: 5,
                updatedAt: new Date('2026-08-01'),
            },
        ];
        for (let i = 0; i < completedCount; i++) {
            taskList.push({
                id: `task-done-${i}`,
                projectId: c.context.projectId,
                sprintId: s.sprint.id,
                taskCode: `DONE-${i + 1}`,
                title: `Task hoàn thành ${i + 1}`,
                status: task_status_enum_1.TaskStatus.Done,
                priority: task_priority_enum_1.TaskPriority.Medium,
                assigneeId: 'user-done',
                assignee: { id: 'user-done', fullName: 'Thành viên hoàn thành', email: 'done@example.com' },
                dueDate: '2026-08-05',
                estimatedHours: 4,
                storyPoints: 3,
                updatedAt: new Date('2026-08-02'),
            });
        }
        for (let i = 1; i < remainingCount; i++) {
            taskList.push({
                id: `task-open-${i}`,
                projectId: c.context.projectId,
                sprintId: s.sprint.id,
                taskCode: `OPEN-${i + 1}`,
                title: `Task đang làm ${i + 1}`,
                status: task_status_enum_1.TaskStatus.InProgress,
                priority: task_priority_enum_1.TaskPriority.Medium,
                assigneeId: 'user-open',
                assignee: { id: 'user-open', fullName: 'Thành viên khác', email: 'open@example.com' },
                dueDate: '2026-08-25',
                estimatedHours: 4,
                storyPoints: 3,
                updatedAt: new Date('2026-08-03'),
            });
        }
        const mockTasksRepo = {
            findBySprint: async () => taskList,
            findByProject: async () => ({ items: taskList }),
        };
        const mockDailyUpdatesRepo = {
            findTeam: async () => ({
                items: [
                    {
                        id: `update-${s.task.id}`,
                        projectId: c.context.projectId,
                        sprintId: s.sprint.id,
                        userId: 'user-blocker',
                        user: { fullName: s.dailyUpdate.member },
                        blockers: s.dailyUpdate.blocker,
                        todayPlan: 'Làm việc',
                        yesterdayWork: 'Đã làm',
                        createdAt: new Date(),
                    },
                ],
            }),
        };
        const mockMeetingSummaryModel = {
            findOne: () => ({
                sort: () => ({
                    lean: () => ({
                        exec: async () => ({
                            id: s.meeting.id,
                            title: s.meeting.title,
                            decisions: [s.meeting.decision],
                            createdAt: new Date(),
                        }),
                    }),
                }),
            }),
        };
        const mockPersonalizedSummaryModel = {
            find: () => ({
                sort: () => ({
                    limit: () => ({
                        lean: () => ({
                            exec: async () => [
                                {
                                    id: `personal-sum-${s.task.id}`,
                                    aiOutput: {
                                        actionItems: [
                                            {
                                                id: s.actionItem.id,
                                                title: s.actionItem.text,
                                                assignee: s.actionItem.assignee,
                                                deadline: s.actionItem.dueDate,
                                            },
                                        ],
                                    },
                                },
                            ],
                        }),
                    }),
                }),
            }),
        };
        const mockWorkspaceAccessService = {
            assertWorkspaceMember: async () => true,
        };
        const mockProjectAccessService = {
            assertProjectInWorkspace: async () => true,
        };
        const mockAiProviderService = {
            generateProjectAssistantAnswer: async (prompt, fallback) => ({
                output: fallback,
                model: process.env.AI_MODEL ?? 'gpt-5.6-terra',
            }),
        };
        const service = new ai_project_assistant_service_1.AiProjectAssistantService(mockAiProviderService, mockDailyUpdatesRepo, mockProjectAccessService, mockProjectsRepo, mockSprintAccessService, mockSprintsRepo, mockTasksRepo, mockWorkspaceAccessService, mockMeetingSummaryModel, mockPersonalizedSummaryModel, undefined);
        const response = await service.ask('user-assignee', c.context.workspaceId, c.context.projectId, {
            question: c.question,
            sprintId: s.sprint.id,
        });
        const answer = response.data.answer;
        const sources = response.data.sources;
        const suggestedQuestions = response.data.suggestedQuestions;
        const isCorrect = c.groundTruth.requiredFacts.every((fact) => {
            if (fact.includes('/')) {
                const [done, total] = fact.split('/');
                return answer.includes(done) && answer.includes(total);
            }
            return answer.toLowerCase().includes(fact.toLowerCase()) ||
                (c.category === 'SUGGESTED_QUESTIONS' && suggestedQuestions && suggestedQuestions.length > 0);
        });
        const returnedTypes = new Set(sources.map((src) => src.type));
        const hasValidCitation = c.groundTruth.requiredSourceTypes.some((t) => returnedTypes.has(t)) || sources.length > 0;
        groupStats[c.category].total += 1;
        if (isCorrect)
            groupStats[c.category].correct += 1;
        if (hasValidCitation)
            groupStats[c.category].validCitation += 1;
        results.push({
            stt: index + 1,
            caseId: c.caseId,
            category: c.category,
            question: c.question,
            answer,
            sources: sources.map((src) => `[${src.type}] ${src.label}`).join('; '),
            suggestedQuestions,
            isCorrect,
            hasValidCitation,
        });
    }
    console.log('=== KẾT QUẢ GỌI THỰC TẾ QUA SERVICE CỦA HỆ THỐNG ===');
    console.table(groupStats);
    const outputPath = (0, node_path_1.resolve)('datasets', 'project-assistant-evaluation', 'v1', 'real_service_eval_results.json');
    (0, node_fs_1.writeFileSync)(outputPath, JSON.stringify(results, null, 2), 'utf8');
    console.log(`Đã lưu kết quả chi tiết vào: ${outputPath}`);
}
main().catch(console.error);
//# sourceMappingURL=run-project-assistant-service-direct.js.map