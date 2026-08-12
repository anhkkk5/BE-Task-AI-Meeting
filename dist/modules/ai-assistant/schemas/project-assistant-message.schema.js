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
exports.ProjectAssistantMessageSchema = exports.ProjectAssistantMessage = void 0;
const mongoose_1 = require("@nestjs/mongoose");
let ProjectAssistantMessage = class ProjectAssistantMessage {
    workspaceId;
    projectId;
    userId;
    sprintId;
    role;
    content;
    sources;
    actionDraft;
};
exports.ProjectAssistantMessage = ProjectAssistantMessage;
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], ProjectAssistantMessage.prototype, "workspaceId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, index: true }),
    __metadata("design:type", String)
], ProjectAssistantMessage.prototype, "projectId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, index: true }),
    __metadata("design:type", String)
], ProjectAssistantMessage.prototype, "userId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String }),
    __metadata("design:type", Object)
], ProjectAssistantMessage.prototype, "sprintId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, enum: ['USER', 'ASSISTANT'] }),
    __metadata("design:type", String)
], ProjectAssistantMessage.prototype, "role", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], ProjectAssistantMessage.prototype, "content", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [Object], default: [] }),
    __metadata("design:type", Array)
], ProjectAssistantMessage.prototype, "sources", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Object, default: null }),
    __metadata("design:type", Object)
], ProjectAssistantMessage.prototype, "actionDraft", void 0);
exports.ProjectAssistantMessage = ProjectAssistantMessage = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true, collection: 'project_assistant_messages' })
], ProjectAssistantMessage);
exports.ProjectAssistantMessageSchema = mongoose_1.SchemaFactory.createForClass(ProjectAssistantMessage);
exports.ProjectAssistantMessageSchema.index({ projectId: 1, userId: 1, createdAt: -1 });
//# sourceMappingURL=project-assistant-message.schema.js.map