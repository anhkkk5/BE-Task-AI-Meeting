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
exports.CreateMeetingDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
const meeting_type_enum_1 = require("../../../common/enums/meeting-type.enum");
class CreateMeetingDto {
    sprintId;
    title;
    description;
    meetingType;
    meetingDate;
    startTime;
    endTime;
    participantIds;
}
exports.CreateMeetingDto = CreateMeetingDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        example: '9d38e4c2-0d77-4d6c-9127-b06b66d01001',
        description: 'Sprint UUID neu meeting gan voi sprint.',
        nullable: true,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", Object)
], CreateMeetingDto.prototype, "sprintId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'Sprint Planning - Sprint 4',
        description: 'Tieu de meeting, tu 2 den 200 ky tu.',
        minLength: 2,
        maxLength: 200,
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(2),
    (0, class_validator_1.MaxLength)(200),
    __metadata("design:type", String)
], CreateMeetingDto.prototype, "title", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        example: 'Hop lap ke hoach cho Sprint 4',
        description: 'Mo ta meeting, toi da 1000 ky tu.',
        maxLength: 1000,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(1000),
    __metadata("design:type", String)
], CreateMeetingDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        enum: meeting_type_enum_1.MeetingType,
        example: meeting_type_enum_1.MeetingType.SprintPlanning,
        description: 'Loai meeting.',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(meeting_type_enum_1.MeetingType),
    __metadata("design:type", String)
], CreateMeetingDto.prototype, "meetingType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: '2026-06-20',
        description: 'Ngay hop theo dinh dang YYYY-MM-DD.',
    }),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateMeetingDto.prototype, "meetingDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        example: '2026-06-20T08:00:00.000Z',
        description: 'Thoi gian bat dau neu co.',
        nullable: true,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", Object)
], CreateMeetingDto.prototype, "startTime", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        example: '2026-06-20T09:00:00.000Z',
        description: 'Thoi gian ket thuc neu co.',
        nullable: true,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", Object)
], CreateMeetingDto.prototype, "endTime", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        example: [
            '5f12e7a0-c3db-4d4a-b8e9-a6b1fdc87001',
            '5f12e7a0-c3db-4d4a-b8e9-a6b1fdc87002',
        ],
        description: 'Danh sach user UUID can them vao meeting. Nguoi tao se tu dong la HOST.',
        type: [String],
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ArrayUnique)(),
    (0, class_validator_1.IsUUID)('all', { each: true }),
    (0, class_transformer_1.Type)(() => String),
    __metadata("design:type", Array)
], CreateMeetingDto.prototype, "participantIds", void 0);
//# sourceMappingURL=create-meeting.dto.js.map