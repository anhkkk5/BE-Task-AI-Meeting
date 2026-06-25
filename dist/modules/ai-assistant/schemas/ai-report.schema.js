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
exports.AiReportSchema = exports.AiReport = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const ai_report_status_enum_1 = require("../../../common/enums/ai-report-status.enum");
const ai_report_type_enum_1 = require("../../../common/enums/ai-report-type.enum");
let AiReport = class AiReport {
    workspaceId;
    projectId;
    sprintId;
    userId;
    reportType;
    reportDate;
    inputData;
    aiOutput;
    aiModel;
    status;
    createdBy;
};
exports.AiReport = AiReport;
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], AiReport.prototype, "workspaceId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], AiReport.prototype, "projectId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String }),
    __metadata("design:type", Object)
], AiReport.prototype, "sprintId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], AiReport.prototype, "userId", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: String,
        required: true,
        enum: ai_report_type_enum_1.AiReportType,
        default: ai_report_type_enum_1.AiReportType.PersonalDailyReport,
    }),
    __metadata("design:type", String)
], AiReport.prototype, "reportType", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], AiReport.prototype, "reportDate", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Object, default: {} }),
    __metadata("design:type", Object)
], AiReport.prototype, "inputData", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Object, default: {} }),
    __metadata("design:type", Object)
], AiReport.prototype, "aiOutput", void 0);
__decorate([
    (0, mongoose_1.Prop)({ name: 'model', type: String }),
    __metadata("design:type", String)
], AiReport.prototype, "aiModel", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: String,
        required: true,
        enum: ai_report_status_enum_1.AiReportStatus,
        default: ai_report_status_enum_1.AiReportStatus.Completed,
    }),
    __metadata("design:type", String)
], AiReport.prototype, "status", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], AiReport.prototype, "createdBy", void 0);
exports.AiReport = AiReport = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true, collection: 'ai_reports' })
], AiReport);
exports.AiReportSchema = mongoose_1.SchemaFactory.createForClass(AiReport);
//# sourceMappingURL=ai-report.schema.js.map