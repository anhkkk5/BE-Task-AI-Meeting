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
exports.AiAgileFlowAssistantService = void 0;
const common_1 = require("@nestjs/common");
const project_status_enum_1 = require("../../../common/enums/project-status.enum");
const sprint_status_enum_1 = require("../../../common/enums/sprint-status.enum");
const projects_repository_1 = require("../../projects/repositories/projects.repository");
const sprints_repository_1 = require("../../sprints/repositories/sprints.repository");
const workspace_members_repository_1 = require("../../workspaces/repositories/workspace-members.repository");
const ai_project_assistant_service_1 = require("./ai-project-assistant.service");
const ai_provider_service_1 = require("./ai-provider.service");
const PRODUCT_KNOWLEDGE = `
AgileFlow là hệ thống quản lý dự án Agile gồm: Workspace và phân quyền OWNER/ADMIN/MEMBER;
Project; Backlog; Sprint; bảng công việc; Task và phụ thuộc; cập nhật hằng ngày; cuộc họp,
biên bản và tóm tắt AI; bàn giao ca; báo cáo AI; thống kê tiến độ; thông báo và hồ sơ cá nhân.
Backlog là danh sách công việc của dự án chưa được đưa vào Sprint. Người dùng có thể tạo Sprint,
kéo hoặc gán Task từ Backlog vào Sprint, theo dõi trạng thái và hoàn thành Sprint.
Chỉ hướng dẫn những tính năng có trong danh sách trên. Không bịa nút, quyền hoặc dữ liệu.
`;
let AiAgileFlowAssistantService = class AiAgileFlowAssistantService {
    workspaceMembersRepository;
    projectsRepository;
    sprintsRepository;
    projectAssistantService;
    aiProviderService;
    constructor(workspaceMembersRepository, projectsRepository, sprintsRepository, projectAssistantService, aiProviderService) {
        this.workspaceMembersRepository = workspaceMembersRepository;
        this.projectsRepository = projectsRepository;
        this.sprintsRepository = sprintsRepository;
        this.projectAssistantService = projectAssistantService;
        this.aiProviderService = aiProviderService;
    }
    async ask(userId, dto) {
        if (this.isFeatureQuestion(dto.question))
            return this.answerFeatureQuestion(dto.question);
        if (!dto.workspaceId) {
            const memberships = await this.workspaceMembersRepository.findActiveByUser(userId, 'ACTIVE');
            return this.choiceResponse('NEED_WORKSPACE', 'Bạn muốn tra cứu dữ liệu trong Workspace nào?', memberships.map(({ workspace }) => ({
                id: workspace.id,
                label: workspace.name,
                description: workspace.description ?? undefined,
            })));
        }
        await this.assertWorkspaceMembership(userId, dto.workspaceId);
        if (!dto.projectId) {
            const projects = await this.projectsRepository.findByWorkspace(dto.workspaceId, {
                status: project_status_enum_1.ProjectStatus.Active,
                page: 1,
                limit: 100,
            });
            return this.choiceResponse('NEED_PROJECT', 'Bạn muốn tra cứu trong dự án nào?', projects.items.map((project) => ({
                id: project.id,
                label: project.name,
                description: project.keyCode,
            })));
        }
        const project = await this.projectsRepository.findByIdAndWorkspace(dto.projectId, dto.workspaceId);
        if (!project)
            throw new common_1.ForbiddenException('Dự án không thuộc Workspace đã chọn');
        if (this.needsSprint(dto.question) && !dto.sprintId) {
            const sprints = await this.sprintsRepository.findByProject(dto.projectId, { page: 1, limit: 100 });
            const visible = sprints.items.filter((sprint) => [
                sprint_status_enum_1.SprintStatus.Active,
                sprint_status_enum_1.SprintStatus.Planned,
                sprint_status_enum_1.SprintStatus.Completed,
            ].includes(sprint.status));
            return this.choiceResponse('NEED_SPRINT', 'Bạn muốn xem Sprint nào?', visible.map((sprint) => ({
                id: sprint.id,
                label: sprint.name,
                description: this.sprintStatusLabel(sprint.status),
            })));
        }
        const result = await this.projectAssistantService.ask(userId, dto.workspaceId, dto.projectId, {
            question: dto.question,
            ...(dto.sprintId ? { sprintId: dto.sprintId } : {}),
        });
        return {
            ...result,
            data: {
                ...result.data,
                state: 'READY',
                choices: [],
            },
        };
    }
    async answerFeatureQuestion(question) {
        const fallback = {
            answer: 'Tôi có thể hướng dẫn bạn sử dụng Workspace, Project, Backlog, Sprint, Task, cuộc họp, bàn giao và báo cáo AI trong AgileFlow.',
            suggestedQuestions: [
                'Backlog là gì?',
                'Cách tạo Sprint?',
                'Cách mời thành viên vào Workspace?',
            ],
        };
        const prompt = `${PRODUCT_KNOWLEDGE}\nCâu hỏi: ${question}\nHãy trả lời ngắn gọn bằng tiếng Việt và nêu các bước thao tác nếu phù hợp.`;
        let output = fallback;
        try {
            output = (await this.aiProviderService.generateProjectAssistantAnswer(prompt, fallback)).output;
        }
        catch {
        }
        return {
            success: true,
            message: 'Hỏi trợ lý AgileFlow thành công',
            data: {
                answer: output.answer,
                suggestedQuestions: output.suggestedQuestions,
                sources: [],
                state: 'GLOBAL',
                choices: [],
                scope: { workspaceId: null, projectId: null, sprintId: null },
            },
        };
    }
    choiceResponse(state, answer, choices) {
        return {
            success: true,
            message: 'Cần bổ sung phạm vi tra cứu',
            data: {
                answer: choices.length
                    ? answer
                    : 'Không có dữ liệu phù hợp mà tài khoản của bạn được phép truy cập.',
                suggestedQuestions: [],
                sources: [],
                state,
                choices,
                scope: {},
            },
        };
    }
    isFeatureQuestion(question) {
        const normalized = this.normalize(question);
        return [
            'la gi',
            'cach ',
            'lam sao',
            'huong dan',
            'tinh nang',
            'quyen gi',
            'co tac dung gi',
        ].some((term) => normalized.includes(term));
    }
    needsSprint(question) {
        const normalized = this.normalize(question);
        return [
            'sprint',
            'backlog',
            'tien do',
            'qua han',
            'cong viec',
            'task',
        ].some((term) => normalized.includes(term));
    }
    normalize(value) {
        return value
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '');
    }
    async assertWorkspaceMembership(userId, workspaceId) {
        const membership = await this.workspaceMembersRepository.findActiveByWorkspaceAndUser(workspaceId, userId);
        if (!membership)
            throw new common_1.ForbiddenException('Bạn không có quyền truy cập Workspace này');
    }
    sprintStatusLabel(status) {
        if (status === sprint_status_enum_1.SprintStatus.Active)
            return 'Đang chạy';
        if (status === sprint_status_enum_1.SprintStatus.Completed)
            return 'Đã hoàn thành';
        return 'Đã lên kế hoạch';
    }
};
exports.AiAgileFlowAssistantService = AiAgileFlowAssistantService;
exports.AiAgileFlowAssistantService = AiAgileFlowAssistantService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [workspace_members_repository_1.WorkspaceMembersRepository,
        projects_repository_1.ProjectsRepository,
        sprints_repository_1.SprintsRepository,
        ai_project_assistant_service_1.AiProjectAssistantService,
        ai_provider_service_1.AiProviderService])
], AiAgileFlowAssistantService);
//# sourceMappingURL=ai-agileflow-assistant.service.js.map