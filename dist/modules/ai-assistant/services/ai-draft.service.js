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
exports.AiDraftService = void 0;
const common_1 = require("@nestjs/common");
const daily_updates_repository_1 = require("../../daily-updates/repositories/daily-updates.repository");
const project_access_service_1 = require("../../projects/services/project-access.service");
const tasks_repository_1 = require("../../tasks/repositories/tasks.repository");
const ai_user_preferences_service_1 = require("../../users/services/ai-user-preferences.service");
const workspace_access_service_1 = require("../../workspaces/services/workspace-access.service");
const ai_provider_service_1 = require("./ai-provider.service");
const ai_report_data_builder_service_1 = require("./ai-report-data-builder.service");
const prompt_builder_service_1 = require("./prompt-builder.service");
let AiDraftService = class AiDraftService {
    aiProviderService;
    dataBuilderService;
    promptBuilderService;
    projectAccessService;
    workspaceAccessService;
    tasksRepository;
    dailyUpdatesRepository;
    aiUserPreferencesService;
    constructor(aiProviderService, dataBuilderService, promptBuilderService, projectAccessService, workspaceAccessService, tasksRepository, dailyUpdatesRepository, aiUserPreferencesService) {
        this.aiProviderService = aiProviderService;
        this.dataBuilderService = dataBuilderService;
        this.promptBuilderService = promptBuilderService;
        this.projectAccessService = projectAccessService;
        this.workspaceAccessService = workspaceAccessService;
        this.tasksRepository = tasksRepository;
        this.dailyUpdatesRepository = dailyUpdatesRepository;
        this.aiUserPreferencesService = aiUserPreferencesService;
    }
    async draftMyDailyUpdate(currentUserId, workspaceId, projectId, dto) {
        await this.workspaceAccessService.assertWorkspaceMember(currentUserId, workspaceId);
        await this.projectAccessService.assertProjectInWorkspace(projectId, workspaceId);
        const inputData = await this.dataBuilderService.buildPersonalDailyReportInput({
            workspaceId,
            projectId,
            targetUserId: currentUserId,
            reportDate: dto.updateDate,
            sprintId: dto.sprintId ?? undefined,
        });
        const preferences = await this.aiUserPreferencesService.getResolvedPreferences(currentUserId);
        const prompt = this.promptBuilderService.buildDailyUpdateDraftPrompt(inputData, preferences);
        try {
            const result = await this.aiProviderService.generateDailyUpdateDraft(prompt, inputData);
            return {
                success: true,
                message: 'Soan nhap bao cao ca nhan thanh cong',
                data: {
                    draft: result.output,
                    model: result.model,
                },
            };
        }
        catch {
            throw new common_1.ServiceUnavailableException('AI provider failed');
        }
    }
    async draftHandover(currentUserId, workspaceId, projectId, dto) {
        await this.workspaceAccessService.assertWorkspaceMember(currentUserId, workspaceId);
        const project = await this.projectAccessService.assertProjectInWorkspace(projectId, workspaceId);
        const task = await this.tasksRepository.findByIdAndProject(dto.taskId, projectId);
        if (!task) {
            throw new common_1.NotFoundException('Task not found in this project');
        }
        if (task.assigneeId !== currentUserId) {
            throw new common_1.ForbiddenException('Chi nguoi dang duoc gan task moi soan duoc noi dung ban giao');
        }
        const receiver = dto.receiverId
            ? await this.workspaceAccessService.assertWorkspaceMember(dto.receiverId, workspaceId)
            : null;
        const recentUpdates = await this.dailyUpdatesRepository.findMy(projectId, currentUserId, { page: 1, limit: 5 });
        const inputData = {
            task: {
                id: task.id,
                taskCode: task.taskCode,
                title: task.title,
                description: task.description ?? null,
                status: task.status,
                dueDate: task.dueDate ?? null,
                assigneeName: task.assignee?.fullName ?? null,
            },
            project: {
                id: project.id,
                name: project.name,
                keyCode: project.keyCode,
            },
            recentDailyUpdates: recentUpdates.items.map((item) => ({
                updateDate: item.updateDate,
                yesterdayWork: item.yesterdayWork,
                todayPlan: item.todayPlan,
                blockers: item.blockers,
            })),
            receiverName: receiver?.user?.fullName ?? null,
        };
        const prompt = this.promptBuilderService.buildHandoverDraftPrompt(inputData);
        try {
            const result = await this.aiProviderService.generateHandoverDraft(prompt, inputData);
            return {
                success: true,
                message: 'Soan nhap noi dung ban giao thanh cong',
                data: {
                    draft: result.output,
                    model: result.model,
                },
            };
        }
        catch {
            throw new common_1.ServiceUnavailableException('AI provider failed');
        }
    }
};
exports.AiDraftService = AiDraftService;
exports.AiDraftService = AiDraftService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [ai_provider_service_1.AiProviderService,
        ai_report_data_builder_service_1.AiReportDataBuilderService,
        prompt_builder_service_1.PromptBuilderService,
        project_access_service_1.ProjectAccessService,
        workspace_access_service_1.WorkspaceAccessService,
        tasks_repository_1.TasksRepository,
        daily_updates_repository_1.DailyUpdatesRepository,
        ai_user_preferences_service_1.AiUserPreferencesService])
], AiDraftService);
//# sourceMappingURL=ai-draft.service.js.map