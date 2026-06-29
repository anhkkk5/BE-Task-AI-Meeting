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
exports.MeetingSummarySchema = exports.MeetingSummary = exports.MeetingSummaryActionItemSchema = exports.MeetingSummaryActionItemSchemaClass = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const ai_report_status_enum_1 = require("../../../common/enums/ai-report-status.enum");
let MeetingSummaryActionItemSchemaClass = class MeetingSummaryActionItemSchemaClass {
    text;
    assigneeName;
    assigneeUserId;
    dueDate;
    status;
    source;
};
exports.MeetingSummaryActionItemSchemaClass = MeetingSummaryActionItemSchemaClass;
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], MeetingSummaryActionItemSchemaClass.prototype, "text", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String }),
    __metadata("design:type", Object)
], MeetingSummaryActionItemSchemaClass.prototype, "assigneeName", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String }),
    __metadata("design:type", Object)
], MeetingSummaryActionItemSchemaClass.prototype, "assigneeUserId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String }),
    __metadata("design:type", Object)
], MeetingSummaryActionItemSchemaClass.prototype, "dueDate", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String }),
    __metadata("design:type", Object)
], MeetingSummaryActionItemSchemaClass.prototype, "status", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String }),
    __metadata("design:type", Object)
], MeetingSummaryActionItemSchemaClass.prototype, "source", void 0);
exports.MeetingSummaryActionItemSchemaClass = MeetingSummaryActionItemSchemaClass = __decorate([
    (0, mongoose_1.Schema)({ _id: false })
], MeetingSummaryActionItemSchemaClass);
exports.MeetingSummaryActionItemSchema = mongoose_1.SchemaFactory.createForClass(MeetingSummaryActionItemSchemaClass);
let MeetingSummary = class MeetingSummary {
    workspaceId;
    projectId;
    sprintId;
    meetingId;
    transcriptId;
    title;
    summary;
    keyPoints;
    decisions;
    actionItems;
    risks;
    openQuestions;
    nextSteps;
    aiOutput;
    aiModel;
    status;
    createdBy;
};
exports.MeetingSummary = MeetingSummary;
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], MeetingSummary.prototype, "workspaceId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], MeetingSummary.prototype, "projectId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String }),
    __metadata("design:type", Object)
], MeetingSummary.prototype, "sprintId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], MeetingSummary.prototype, "meetingId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], MeetingSummary.prototype, "transcriptId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], MeetingSummary.prototype, "title", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], MeetingSummary.prototype, "summary", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [String], default: [] }),
    __metadata("design:type", Array)
], MeetingSummary.prototype, "keyPoints", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [String], default: [] }),
    __metadata("design:type", Array)
], MeetingSummary.prototype, "decisions", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [exports.MeetingSummaryActionItemSchema], default: [] }),
    __metadata("design:type", Array)
], MeetingSummary.prototype, "actionItems", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [String], default: [] }),
    __metadata("design:type", Array)
], MeetingSummary.prototype, "risks", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [String], default: [] }),
    __metadata("design:type", Array)
], MeetingSummary.prototype, "openQuestions", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [String], default: [] }),
    __metadata("design:type", Array)
], MeetingSummary.prototype, "nextSteps", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Object, default: {} }),
    __metadata("design:type", Object)
], MeetingSummary.prototype, "aiOutput", void 0);
__decorate([
    (0, mongoose_1.Prop)({ name: 'model', type: String }),
    __metadata("design:type", String)
], MeetingSummary.prototype, "aiModel", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: String,
        required: true,
        enum: ai_report_status_enum_1.AiReportStatus,
        default: ai_report_status_enum_1.AiReportStatus.Completed,
    }),
    __metadata("design:type", String)
], MeetingSummary.prototype, "status", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], MeetingSummary.prototype, "createdBy", void 0);
exports.MeetingSummary = MeetingSummary = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true, collection: 'meeting_summaries' })
], MeetingSummary);
exports.MeetingSummarySchema = mongoose_1.SchemaFactory.createForClass(MeetingSummary);
//# sourceMappingURL=meeting-summary.schema.js.map