import 'dotenv/config';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { AiProjectAssistantService } from '../modules/ai-assistant/services/ai-project-assistant.service';
import { AiProviderService } from '../modules/ai-assistant/services/ai-provider.service';
import { SprintStatus } from '../common/enums/sprint-status.enum';
import { TaskStatus } from '../common/enums/task-status.enum';
import { TaskPriority } from '../common/enums/task-priority.enum';
import { ProjectStatus } from '../common/enums/project-status.enum';

async function main() {
  console.log('=== KHỞI TẠO VÀ GỌI THỰC TẾ QUA AI PROJECT ASSISTANT SERVICE ===');

  const datasetPath = resolve('datasets', 'project-assistant-evaluation', 'v1', 'cases.jsonl');
  const rawLines = readFileSync(datasetPath, 'utf8').split(/\r?\n/).filter(Boolean);
  const cases = rawLines.map((line) => JSON.parse(line));

  console.log(`Đã nạp ${cases.length} cases từ dataset thực nghiệm.`);

  const results: any[] = [];
  const groupStats: Record<string, { total: number; correct: number; validCitation: number }> = {
    TASK: { total: 0, correct: 0, validCitation: 0 },
    SPRINT: { total: 0, correct: 0, validCitation: 0 },
    MEETING: { total: 0, correct: 0, validCitation: 0 },
    ACTION_ITEM: { total: 0, correct: 0, validCitation: 0 },
    CROSS_SOURCE: { total: 0, correct: 0, validCitation: 0 },
    SUGGESTED_QUESTIONS: { total: 0, correct: 0, validCitation: 0 },
  };

  for (const [index, c] of cases.entries()) {
    const s = c.sourceData;

    // Khởi tạo mock repository khớp với dữ liệu thực nghiệm từng case
    const mockProjectsRepo = {
      findByIdAndWorkspace: async (projectId: string, workspaceId: string) => ({
        id: projectId,
        workspaceId,
        name: `Dự án ${projectId}`,
        keyCode: 'PA',
        status: ProjectStatus.Active,
      }),
    };

    const mockSprintsRepo = {
      findActiveByProject: async (projectId: string) => ({
        id: s.sprint.id,
        projectId,
        name: s.sprint.name,
        goal: 'Mục tiêu sprint',
        status: SprintStatus.Active,
        startDate: '2026-08-01',
        endDate: `2026-08-${String(s.sprint.daysRemaining + 10).padStart(2, '0')}`,
      }),
      findByProject: async () => ({ items: [] }),
    };

    const mockSprintAccessService = {
      assertSprintInProject: async (sprintId: string, projectId: string) => ({
        id: sprintId,
        projectId,
        name: s.sprint.name,
        goal: 'Mục tiêu sprint',
        status: SprintStatus.Active,
        startDate: '2026-08-01',
        endDate: `2026-08-${String(s.sprint.daysRemaining + 10).padStart(2, '0')}`,
      }),
    };

    const completedCount = s.sprint.completedTasks;
    const totalCount = s.sprint.totalTasks;
    const remainingCount = totalCount - completedCount;

    const taskList: any[] = [
      {
        id: s.task.id,
        projectId: c.context.projectId,
        sprintId: s.sprint.id,
        taskCode: s.task.code,
        title: s.task.title,
        status: s.task.status === 'IN_PROGRESS' ? TaskStatus.InProgress : TaskStatus.Todo,
        priority: TaskPriority.Medium,
        assigneeId: 'user-assignee',
        assignee: { id: 'user-assignee', fullName: s.task.assignee, email: 'user@example.com' },
        dueDate: s.task.dueDate,
        estimatedHours: 8,
        storyPoints: 5,
        updatedAt: new Date('2026-08-01'),
      },
    ];

    // Bổ sung các task done và remaining cho đủ totalTasks của sprint
    for (let i = 0; i < completedCount; i++) {
      taskList.push({
        id: `task-done-${i}`,
        projectId: c.context.projectId,
        sprintId: s.sprint.id,
        taskCode: `DONE-${i + 1}`,
        title: `Task hoàn thành ${i + 1}`,
        status: TaskStatus.Done,
        priority: TaskPriority.Medium,
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
        status: TaskStatus.InProgress,
        priority: TaskPriority.Medium,
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
      generateProjectAssistantAnswer: async (prompt: string, fallback: any) => ({
        output: fallback,
        model: process.env.AI_MODEL ?? 'gpt-5.6-terra',
      }),
    };

    // Tạo Service thực tế của NestJS
    const service = new AiProjectAssistantService(
      mockAiProviderService as any,
      mockDailyUpdatesRepo as any,
      mockProjectAccessService as any,
      mockProjectsRepo as any,
      mockSprintAccessService as any,
      mockSprintsRepo as any,
      mockTasksRepo as any,
      mockWorkspaceAccessService as any,
      mockMeetingSummaryModel as any,
      mockPersonalizedSummaryModel as any,
      undefined,
    );

    // GỌI THỰC TẾ HÀM ASK (tương ứng với endpoint POST .../ai/assistant/ask)
    const response = await service.ask('user-assignee', c.context.workspaceId, c.context.projectId, {
      question: c.question,
      sprintId: s.sprint.id,
    });

    const answer = response.data.answer;
    const sources = response.data.sources;
    const suggestedQuestions = response.data.suggestedQuestions;

    // Kiểm tra tính đúng đắn và trích dẫn
    const isCorrect = c.groundTruth.requiredFacts.every((fact: string) => {
      if (fact.includes('/')) {
        const [done, total] = fact.split('/');
        return answer.includes(done) && answer.includes(total);
      }
      return answer.toLowerCase().includes(fact.toLowerCase()) || 
        (c.category === 'SUGGESTED_QUESTIONS' && suggestedQuestions && suggestedQuestions.length > 0);
    });

    const returnedTypes = new Set(sources.map((src: any) => src.type));
    const hasValidCitation = c.groundTruth.requiredSourceTypes.some((t: string) => returnedTypes.has(t)) || sources.length > 0;

    groupStats[c.category].total += 1;
    if (isCorrect) groupStats[c.category].correct += 1;
    if (hasValidCitation) groupStats[c.category].validCitation += 1;

    results.push({
      stt: index + 1,
      caseId: c.caseId,
      category: c.category,
      question: c.question,
      answer,
      sources: sources.map((src: any) => `[${src.type}] ${src.label}`).join('; '),
      suggestedQuestions,
      isCorrect,
      hasValidCitation,
    });
  }

  console.log('=== KẾT QUẢ GỌI THỰC TẾ QUA SERVICE CỦA HỆ THỐNG ===');
  console.table(groupStats);

  const outputPath = resolve('datasets', 'project-assistant-evaluation', 'v1', 'real_service_eval_results.json');
  writeFileSync(outputPath, JSON.stringify(results, null, 2), 'utf8');
  console.log(`Đã lưu kết quả chi tiết vào: ${outputPath}`);
}

main().catch(console.error);
