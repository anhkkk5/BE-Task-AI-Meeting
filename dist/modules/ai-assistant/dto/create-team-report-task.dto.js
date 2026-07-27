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
exports.CreateTeamReportTaskDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const team_report_action_item_status_enum_1 = require("../../../common/enums/team-report-action-item-status.enum");
class CreateTeamReportTaskDto {
    source;
    itemIndex;
    title;
    assigneeId;
    sprintId;
    dueDate;
}
exports.CreateTeamReportTaskDto = CreateTeamReportTaskDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        enum: team_report_action_item_status_enum_1.TeamReportActionItemSource,
        description: 'Muc den tu danh sach vuong mac hay de xuat.',
    }),
    (0, class_validator_1.IsEnum)(team_report_action_item_status_enum_1.TeamReportActionItemSource),
    __metadata("design:type", String)
], CreateTeamReportTaskDto.prototype, "source", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 0, description: 'Vi tri muc trong danh sach.' }),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CreateTeamReportTaskDto.prototype, "itemIndex", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Tieu de task. Bo trong de dung noi dung trong bao cao.',
        maxLength: 200,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(2),
    (0, class_validator_1.MaxLength)(200),
    __metadata("design:type", String)
], CreateTeamReportTaskDto.prototype, "title", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'User UUID se duoc gan task.' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], CreateTeamReportTaskDto.prototype, "assigneeId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Sprint UUID. Bo trong de tao task trong backlog.',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], CreateTeamReportTaskDto.prototype, "sprintId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '2026-07-30' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateTeamReportTaskDto.prototype, "dueDate", void 0);
//# sourceMappingURL=create-team-report-task.dto.js.map