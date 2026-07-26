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
exports.GenerateTeamReportDto = exports.TeamReportDataSourcesDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
class TeamReportDataSourcesDto {
    tasks;
    dailyUpdates;
    meetingTranscripts;
    previousReport;
}
exports.TeamReportDataSourcesDto = TeamReportDataSourcesDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        default: true,
        description: 'Task va trang thai task.',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], TeamReportDataSourcesDto.prototype, "tasks", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        default: true,
        description: 'Cap nhat hang ngay cua thanh vien.',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], TeamReportDataSourcesDto.prototype, "dailyUpdates", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        default: true,
        description: 'Bien ban cuoc hop gan nhat trong ngay.',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], TeamReportDataSourcesDto.prototype, "meetingTranscripts", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        default: false,
        description: 'Bao cao giao ban ngay truoc de so sanh tien do.',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], TeamReportDataSourcesDto.prototype, "previousReport", void 0);
class GenerateTeamReportDto {
    reportDate;
    sprintId;
    dataSources;
    extraInstruction;
}
exports.GenerateTeamReportDto = GenerateTeamReportDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        example: '2026-06-22',
        description: 'Ngay can tao AI team daily report.',
    }),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], GenerateTeamReportDto.prototype, "reportDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        example: '9d38e4c2-0d77-4d6c-9127-b06b66d01001',
        description: 'Sprint UUID neu muon tong hop theo sprint.',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], GenerateTeamReportDto.prototype, "sprintId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        type: TeamReportDataSourcesDto,
        description: 'Nguon du lieu AI duoc phep su dung.',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => TeamReportDataSourcesDto),
    __metadata("design:type", TeamReportDataSourcesDto)
], GenerateTeamReportDto.prototype, "dataSources", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        example: 'Tap trung vao cong viec bi cham va nguoi can ho tro.',
        description: 'Yeu cau them cho AI. Chi doi cach trinh bay, khong duoc bo du lieu.',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(500),
    __metadata("design:type", String)
], GenerateTeamReportDto.prototype, "extraInstruction", void 0);
//# sourceMappingURL=generate-team-report.dto.js.map