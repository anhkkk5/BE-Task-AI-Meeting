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
exports.SaveMeetingTranscriptDto = exports.MeetingTranscriptSpeakerDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
class MeetingTranscriptSpeakerDto {
    speakerName;
    userId;
    text;
}
exports.MeetingTranscriptSpeakerDto = MeetingTranscriptSpeakerDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        example: 'Nguyen Van A',
        maxLength: 120,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(120),
    __metadata("design:type", String)
], MeetingTranscriptSpeakerDto.prototype, "speakerName", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        example: '5f12e7a0-c3db-4d4a-b8e9-a6b1fdc87001',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], MeetingTranscriptSpeakerDto.prototype, "userId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'Hom nay chung ta hop ve Sprint 4.',
        maxLength: 5000,
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(1),
    (0, class_validator_1.MaxLength)(5000),
    __metadata("design:type", String)
], MeetingTranscriptSpeakerDto.prototype, "text", void 0);
class SaveMeetingTranscriptDto {
    rawTranscript;
    speakers;
}
exports.SaveMeetingTranscriptDto = SaveMeetingTranscriptDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'Nguyen Van A: Hom nay chung ta hop ve Sprint 4.\\nNguyen Van B: Em se lam Meeting Module.',
        description: 'Transcript dang text, toi da 50000 ky tu.',
        minLength: 1,
        maxLength: 50000,
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(1),
    (0, class_validator_1.MaxLength)(50000),
    __metadata("design:type", String)
], SaveMeetingTranscriptDto.prototype, "rawTranscript", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        type: [MeetingTranscriptSpeakerDto],
        description: 'Danh sach phan doan theo speaker neu co.',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ArrayMaxSize)(100),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => MeetingTranscriptSpeakerDto),
    __metadata("design:type", Array)
], SaveMeetingTranscriptDto.prototype, "speakers", void 0);
//# sourceMappingURL=save-meeting-transcript.dto.js.map