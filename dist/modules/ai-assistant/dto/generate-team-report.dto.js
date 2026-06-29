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
exports.GenerateTeamReportDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
class GenerateTeamReportDto {
    reportDate;
    sprintId;
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
//# sourceMappingURL=generate-team-report.dto.js.map