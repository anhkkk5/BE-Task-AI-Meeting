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
exports.PersonalizedMeetingSummarySchema = exports.PersonalizedMeetingSummary = exports.PersonalizedMeetingActionItemSchema = exports.PersonalizedMeetingActionItemSchemaClass = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const ai_report_status_enum_1 = require("../../../common/enums/ai-report-status.enum");
let PersonalizedMeetingActionItemSchemaClass = class PersonalizedMeetingActionItemSchemaClass {
    title;
    assigneeId;
    assigneeName;
    deadline;
    source;
};
exports.PersonalizedMeetingActionItemSchemaClass = PersonalizedMeetingActionItemSchemaClass;
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], PersonalizedMeetingActionItemSchemaClass.prototype, "title", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String }),
    __metadata("design:type", Object)
], PersonalizedMeetingActionItemSchemaClass.prototype, "assigneeId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String }),
    __metadata("design:type", Object)
], PersonalizedMeetingActionItemSchemaClass.prototype, "assigneeName", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String }),
    __metadata("design:type", Object)
], PersonalizedMeetingActionItemSchemaClass.prototype, "deadline", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String }),
    __metadata("design:type", Object)
], PersonalizedMeetingActionItemSchemaClass.prototype, "source", void 0);
exports.PersonalizedMeetingActionItemSchemaClass = PersonalizedMeetingActionItemSchemaClass = __decorate([
    (0, mongoose_1.Schema)({ _id: false })
], PersonalizedMeetingActionItemSchemaClass);
exports.PersonalizedMeetingActionItemSchema = mongoose_1.SchemaFactory.createForClass(PersonalizedMeetingActionItemSchemaClass);
let PersonalizedMeetingSummary = class PersonalizedMeetingSummary {
    workspaceId;
    projectId;
    sprintId;
    meetingId;
    userId;
    sourceSummaryId;
    transcriptId;
    inputData;
    aiOutput;
    aiModel;
    status;
    createdBy;
};
exports.PersonalizedMeetingSummary = PersonalizedMeetingSummary;
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], PersonalizedMeetingSummary.prototype, "workspaceId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], PersonalizedMeetingSummary.prototype, "projectId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String }),
    __metadata("design:type", Object)
], PersonalizedMeetingSummary.prototype, "sprintId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], PersonalizedMeetingSummary.prototype, "meetingId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], PersonalizedMeetingSummary.prototype, "userId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], PersonalizedMeetingSummary.prototype, "sourceSummaryId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String }),
    __metadata("design:type", Object)
], PersonalizedMeetingSummary.prototype, "transcriptId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Object, default: {} }),
    __metadata("design:type", Object)
], PersonalizedMeetingSummary.prototype, "inputData", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Object, default: {} }),
    __metadata("design:type", Object)
], PersonalizedMeetingSummary.prototype, "aiOutput", void 0);
__decorate([
    (0, mongoose_1.Prop)({ name: 'model', type: String }),
    __metadata("design:type", String)
], PersonalizedMeetingSummary.prototype, "aiModel", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: String,
        required: true,
        enum: ai_report_status_enum_1.AiReportStatus,
        default: ai_report_status_enum_1.AiReportStatus.Completed,
    }),
    __metadata("design:type", String)
], PersonalizedMeetingSummary.prototype, "status", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], PersonalizedMeetingSummary.prototype, "createdBy", void 0);
exports.PersonalizedMeetingSummary = PersonalizedMeetingSummary = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true, collection: 'personalized_meeting_summaries' })
], PersonalizedMeetingSummary);
exports.PersonalizedMeetingSummarySchema = mongoose_1.SchemaFactory.createForClass(PersonalizedMeetingSummary);
exports.PersonalizedMeetingSummarySchema.index({
    meetingId: 1,
    userId: 1,
    sourceSummaryId: 1,
});
exports.PersonalizedMeetingSummarySchema.index({
    workspaceId: 1,
    projectId: 1,
    userId: 1,
});
//# sourceMappingURL=personalized-meeting-summary.schema.js.map