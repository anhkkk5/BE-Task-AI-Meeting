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
exports.MeetingImportJobSchema = exports.MeetingImportJob = void 0;
const mongoose_1 = require("@nestjs/mongoose");
let MeetingImportJob = class MeetingImportJob {
    workspaceId;
    projectId;
    meetingId;
    createdBy;
    fileName;
    mimeType;
    fileSize;
    kind;
    status;
    progress;
    message;
    error;
    transcriptId;
    summaryId;
    transcript;
    summary;
};
exports.MeetingImportJob = MeetingImportJob;
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], MeetingImportJob.prototype, "workspaceId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], MeetingImportJob.prototype, "projectId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String }),
    __metadata("design:type", Object)
], MeetingImportJob.prototype, "meetingId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], MeetingImportJob.prototype, "createdBy", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], MeetingImportJob.prototype, "fileName", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], MeetingImportJob.prototype, "mimeType", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Number)
], MeetingImportJob.prototype, "fileSize", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], MeetingImportJob.prototype, "kind", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, default: 'QUEUED' }),
    __metadata("design:type", String)
], MeetingImportJob.prototype, "status", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, default: 5 }),
    __metadata("design:type", Number)
], MeetingImportJob.prototype, "progress", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String }),
    __metadata("design:type", Object)
], MeetingImportJob.prototype, "message", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String }),
    __metadata("design:type", Object)
], MeetingImportJob.prototype, "error", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String }),
    __metadata("design:type", Object)
], MeetingImportJob.prototype, "transcriptId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String }),
    __metadata("design:type", Object)
], MeetingImportJob.prototype, "summaryId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String }),
    __metadata("design:type", Object)
], MeetingImportJob.prototype, "transcript", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Object }),
    __metadata("design:type", Object)
], MeetingImportJob.prototype, "summary", void 0);
exports.MeetingImportJob = MeetingImportJob = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true, collection: 'meeting_import_jobs' })
], MeetingImportJob);
exports.MeetingImportJobSchema = mongoose_1.SchemaFactory.createForClass(MeetingImportJob);
exports.MeetingImportJobSchema.index({ meetingId: 1, createdAt: -1 });
exports.MeetingImportJobSchema.index({ projectId: 1, createdAt: -1 });
//# sourceMappingURL=meeting-import-job.schema.js.map