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
exports.AiDraftController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const current_user_decorator_1 = require("../../../common/decorators/current-user.decorator");
const workspace_member_guard_1 = require("../../../common/guards/workspace-member.guard");
const access_token_guard_1 = require("../../auth/guards/access-token.guard");
const draft_daily_update_dto_1 = require("../dto/draft-daily-update.dto");
const draft_handover_dto_1 = require("../dto/draft-handover.dto");
const ai_draft_service_1 = require("../services/ai-draft.service");
let AiDraftController = class AiDraftController {
    aiDraftService;
    constructor(aiDraftService) {
        this.aiDraftService = aiDraftService;
    }
    draftMyDailyUpdate(user, workspaceId, projectId, dto) {
        return this.aiDraftService.draftMyDailyUpdate(user.id, workspaceId, projectId, dto);
    }
    draftHandover(user, workspaceId, projectId, dto) {
        return this.aiDraftService.draftHandover(user.id, workspaceId, projectId, dto);
    }
};
exports.AiDraftController = AiDraftController;
__decorate([
    (0, common_1.Post)('daily-update-draft'),
    (0, common_1.UseGuards)(workspace_member_guard_1.WorkspaceMemberGuard),
    (0, swagger_1.ApiOperation)({
        summary: 'Draft my daily update',
        description: 'Sinh nhap 4 o cua form bao cao ca nhan tu task va ban giao trong ngay. Khong ghi vao DB, nguoi dung tu sua roi gui.',
    }),
    (0, swagger_1.ApiParam)({ name: 'workspaceId', example: 'workspace-uuid' }),
    (0, swagger_1.ApiParam)({ name: 'projectId', example: 'project-uuid' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Soan nhap thanh cong.' }),
    (0, swagger_1.ApiResponse)({ status: 503, description: 'AI provider that bai.' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('workspaceId')),
    __param(2, (0, common_1.Param)('projectId')),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, draft_daily_update_dto_1.DraftDailyUpdateDto]),
    __metadata("design:returntype", void 0)
], AiDraftController.prototype, "draftMyDailyUpdate", null);
__decorate([
    (0, common_1.Post)('handover-draft'),
    (0, common_1.UseGuards)(workspace_member_guard_1.WorkspaceMemberGuard),
    (0, swagger_1.ApiOperation)({
        summary: 'Draft handover content',
        description: 'Sinh nhap noi dung ban giao cho task dang duoc gan cho nguoi goi. Khong ghi vao DB.',
    }),
    (0, swagger_1.ApiParam)({ name: 'workspaceId', example: 'workspace-uuid' }),
    (0, swagger_1.ApiParam)({ name: 'projectId', example: 'project-uuid' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Soan nhap thanh cong.' }),
    (0, swagger_1.ApiResponse)({
        status: 403,
        description: 'Task khong duoc gan cho nguoi goi.',
    }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('workspaceId')),
    __param(2, (0, common_1.Param)('projectId')),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, draft_handover_dto_1.DraftHandoverDto]),
    __metadata("design:returntype", void 0)
], AiDraftController.prototype, "draftHandover", null);
exports.AiDraftController = AiDraftController = __decorate([
    (0, common_1.Controller)('workspaces/:workspaceId/projects/:projectId/ai'),
    (0, swagger_1.ApiTags)('AI Drafts'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(access_token_guard_1.AccessTokenGuard),
    __metadata("design:paramtypes", [ai_draft_service_1.AiDraftService])
], AiDraftController);
//# sourceMappingURL=ai-draft.controller.js.map