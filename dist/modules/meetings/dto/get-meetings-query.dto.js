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
exports.GetMeetingsQueryDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
const meeting_status_enum_1 = require("../../../common/enums/meeting-status.enum");
const meeting_type_enum_1 = require("../../../common/enums/meeting-type.enum");
class GetMeetingsQueryDto {
    status;
    meetingType;
    sprintId;
    fromDate;
    toDate;
    keyword;
    page;
    limit;
}
exports.GetMeetingsQueryDto = GetMeetingsQueryDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        enum: meeting_status_enum_1.MeetingStatus,
        example: meeting_status_enum_1.MeetingStatus.Scheduled,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(meeting_status_enum_1.MeetingStatus),
    __metadata("design:type", String)
], GetMeetingsQueryDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        enum: meeting_type_enum_1.MeetingType,
        example: meeting_type_enum_1.MeetingType.DailyScrum,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(meeting_type_enum_1.MeetingType),
    __metadata("design:type", String)
], GetMeetingsQueryDto.prototype, "meetingType", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        example: '9d38e4c2-0d77-4d6c-9127-b06b66d01001',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], GetMeetingsQueryDto.prototype, "sprintId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '2026-06-01' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], GetMeetingsQueryDto.prototype, "fromDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '2026-06-30' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], GetMeetingsQueryDto.prototype, "toDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        example: 'sprint',
        description: 'Tim theo title hoac description.',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], GetMeetingsQueryDto.prototype, "keyword", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 1, minimum: 1 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], GetMeetingsQueryDto.prototype, "page", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 10, minimum: 1, maximum: 100 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(100),
    __metadata("design:type", Number)
], GetMeetingsQueryDto.prototype, "limit", void 0);
//# sourceMappingURL=get-meetings-query.dto.js.map