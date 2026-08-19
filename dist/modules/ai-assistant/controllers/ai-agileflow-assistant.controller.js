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
exports.AiAgileFlowAssistantController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const current_user_decorator_1 = require("../../../common/decorators/current-user.decorator");
const access_token_guard_1 = require("../../auth/guards/access-token.guard");
const ask_agileflow_assistant_dto_1 = require("../dto/ask-agileflow-assistant.dto");
const ai_agileflow_assistant_service_1 = require("../services/ai-agileflow-assistant.service");
let AiAgileFlowAssistantController = class AiAgileFlowAssistantController {
    service;
    constructor(service) {
        this.service = service;
    }
    ask(user, dto) {
        return this.service.ask(user.id, dto);
    }
};
exports.AiAgileFlowAssistantController = AiAgileFlowAssistantController;
__decorate([
    (0, common_1.Post)('ask'),
    (0, swagger_1.ApiOperation)({ summary: 'Hỏi trợ lý toàn hệ thống AgileFlow' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, ask_agileflow_assistant_dto_1.AskAgileFlowAssistantDto]),
    __metadata("design:returntype", void 0)
], AiAgileFlowAssistantController.prototype, "ask", null);
exports.AiAgileFlowAssistantController = AiAgileFlowAssistantController = __decorate([
    (0, common_1.Controller)('ai/assistant'),
    (0, swagger_1.ApiTags)('AI AgileFlow Assistant'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(access_token_guard_1.AccessTokenGuard),
    __metadata("design:paramtypes", [ai_agileflow_assistant_service_1.AiAgileFlowAssistantService])
], AiAgileFlowAssistantController);
//# sourceMappingURL=ai-agileflow-assistant.controller.js.map