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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AiProjectAssistantController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const current_user_decorator_1 = require("../../../common/decorators/current-user.decorator");
const workspace_member_guard_1 = require("../../../common/guards/workspace-member.guard");
const access_token_guard_1 = require("../../auth/guards/access-token.guard");
const ask_project_assistant_dto_1 = require("../dto/ask-project-assistant.dto");
const ai_project_assistant_service_1 = require("../services/ai-project-assistant.service");
let AiProjectAssistantController = class AiProjectAssistantController {
    aiProjectAssistantService;
    constructor(aiProjectAssistantService) {
        this.aiProjectAssistantService = aiProjectAssistantService;
    }
    ask(user, workspaceId, projectId, dto) {
        return this.aiProjectAssistantService.ask(user.id, workspaceId, projectId, dto);
    }
    getHistory(user, workspaceId, projectId) {
        return this.aiProjectAssistantService.getHistory(user.id, workspaceId, projectId);
    }
    clearHistory(user, workspaceId, projectId) {
        return this.aiProjectAssistantService.clearHistory(user.id, workspaceId, projectId);
    }
    getSprintRisk(user, workspaceId, projectId, sprintId) {
        return this.aiProjectAssistantService.getSprintRisk(user.id, workspaceId, projectId, sprintId);
    }
};
exports.AiProjectAssistantController = AiProjectAssistantController;
__decorate([
    (0, common_1.Post)('ask'),
    (0, swagger_1.ApiOperation)({
        summary: 'Hỏi trợ lý dự án',
        description: 'Trả lời dựa trên Sprint, task và cập nhật hằng ngày mà thành viên được phép xem.',
    }),
    (0, swagger_1.ApiParam)({ name: 'workspaceId', example: 'workspace-uuid' }),
    (0, swagger_1.ApiParam)({ name: 'projectId', example: 'project-uuid' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Trả lời câu hỏi thành công.' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('workspaceId')),
    __param(2, (0, common_1.Param)('projectId')),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, ask_project_assistant_dto_1.AskProjectAssistantDto]),
    __metadata("design:returntype", void 0)
], AiProjectAssistantController.prototype, "ask", null);
__decorate([
    (0, common_1.Get)('history'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('workspaceId')),
    __param(2, (0, common_1.Param)('projectId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", void 0)
], AiProjectAssistantController.prototype, "getHistory", null);
__decorate([
    (0, common_1.Delete)('history'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('workspaceId')),
    __param(2, (0, common_1.Param)('projectId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", void 0)
], AiProjectAssistantController.prototype, "clearHistory", null);
__decorate([
    (0, common_1.Get)('sprints/:sprintId/risk'),
    (0, swagger_1.ApiOperation)({
        summary: 'Dự báo rủi ro Sprint',
        description: 'Chấm điểm rủi ro có giải thích từ tiến độ, quá hạn, blocker, task chưa giao và task đứng lâu.',
    }),
    (0, swagger_1.ApiParam)({ name: 'workspaceId', example: 'workspace-uuid' }),
    (0, swagger_1.ApiParam)({ name: 'projectId', example: 'project-uuid' }),
    (0, swagger_1.ApiParam)({ name: 'sprintId', example: 'sprint-uuid' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Lấy dự báo rủi ro thành công.' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('workspaceId')),
    __param(2, (0, common_1.Param)('projectId')),
    __param(3, (0, common_1.Param)('sprintId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String]),
    __metadata("design:returntype", void 0)
], AiProjectAssistantController.prototype, "getSprintRisk", null);
exports.AiProjectAssistantController = AiProjectAssistantController = __decorate([
    (0, common_1.Controller)('workspaces/:workspaceId/projects/:projectId/ai/assistant'),
    (0, swagger_1.ApiTags)('AI Project Assistant'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(access_token_guard_1.AccessTokenGuard, workspace_member_guard_1.WorkspaceMemberGuard),
    __metadata("design:paramtypes", [ai_project_assistant_service_1.AiProjectAssistantService])
], AiProjectAssistantController);
//# sourceMappingURL=ai-project-assistant.controller.js.map