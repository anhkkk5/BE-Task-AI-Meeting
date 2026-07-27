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
exports.RequestTeamReportHandoverDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const team_report_action_item_status_enum_1 = require("../../../common/enums/team-report-action-item-status.enum");
class RequestTeamReportHandoverDto {
    source;
    itemIndex;
    taskId;
    suggestedReceiverId;
    note;
}
exports.RequestTeamReportHandoverDto = RequestTeamReportHandoverDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        enum: team_report_action_item_status_enum_1.TeamReportActionItemSource,
        description: 'Muc den tu danh sach vuong mac hay de xuat.',
    }),
    (0, class_validator_1.IsEnum)(team_report_action_item_status_enum_1.TeamReportActionItemSource),
    __metadata("design:type", String)
], RequestTeamReportHandoverDto.prototype, "source", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 0, description: 'Vi tri muc trong danh sach.' }),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], RequestTeamReportHandoverDto.prototype, "itemIndex", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Task can duoc ban giao, lay tu vuong mac trong bao cao.',
        example: '2f7b08fd-82f8-4bee-8c5f-8fb9fc796463',
    }),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], RequestTeamReportHandoverDto.prototype, "taskId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Nguoi duoc de xuat nhan ban giao. Bat buoc de he thong kiem tra ho con hoat dong.',
    }),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], RequestTeamReportHandoverDto.prototype, "suggestedReceiverId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Ly do de nghi ban giao, hien cho nguoi giu task doc.',
        maxLength: 500,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(500),
    __metadata("design:type", String)
], RequestTeamReportHandoverDto.prototype, "note", void 0);
//# sourceMappingURL=request-team-report-handover.dto.js.map