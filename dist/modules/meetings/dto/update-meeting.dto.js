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
exports.UpdateMeetingDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const meeting_type_enum_1 = require("../../../common/enums/meeting-type.enum");
class UpdateMeetingDto {
    sprintId;
    title;
    description;
    meetingType;
    meetingDate;
    startTime;
    endTime;
}
exports.UpdateMeetingDto = UpdateMeetingDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        example: '9d38e4c2-0d77-4d6c-9127-b06b66d01001',
        description: 'Sprint UUID moi, hoac null de bo lien ket sprint.',
        nullable: true,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", Object)
], UpdateMeetingDto.prototype, "sprintId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        example: 'Sprint Planning - Sprint 4 Updated',
        minLength: 2,
        maxLength: 200,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(2),
    (0, class_validator_1.MaxLength)(200),
    __metadata("design:type", String)
], UpdateMeetingDto.prototype, "title", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        example: 'Cap nhat noi dung cuoc hop',
        maxLength: 1000,
        nullable: true,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(1000),
    __metadata("design:type", Object)
], UpdateMeetingDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        enum: meeting_type_enum_1.MeetingType,
        example: meeting_type_enum_1.MeetingType.General,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(meeting_type_enum_1.MeetingType),
    __metadata("design:type", String)
], UpdateMeetingDto.prototype, "meetingType", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        example: '2026-06-21',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], UpdateMeetingDto.prototype, "meetingDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        example: '2026-06-21T08:00:00.000Z',
        nullable: true,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", Object)
], UpdateMeetingDto.prototype, "startTime", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        example: '2026-06-21T09:00:00.000Z',
        nullable: true,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", Object)
], UpdateMeetingDto.prototype, "endTime", void 0);
//# sourceMappingURL=update-meeting.dto.js.map