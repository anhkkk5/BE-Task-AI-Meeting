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
exports.AppendLiveTranscriptSegmentDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
class AppendLiveTranscriptSegmentDto {
    text;
    startedAt;
    endedAt;
    confidence;
    source;
}
exports.AppendLiveTranscriptSegmentDto = AppendLiveTranscriptSegmentDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'Em da import backlog tu Excel va can anh review sprint mapping.',
        description: 'Noi dung vua duoc nhan dien tu mic cua user hien tai.',
        minLength: 1,
        maxLength: 3000,
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(1),
    (0, class_validator_1.MaxLength)(3000),
    __metadata("design:type", String)
], AppendLiveTranscriptSegmentDto.prototype, "text", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        example: '2026-07-13T09:00:12.000Z',
        description: 'Thoi diem bat dau doan noi. Neu khong gui thi backend tu lay now.',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], AppendLiveTranscriptSegmentDto.prototype, "startedAt", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        example: '2026-07-13T09:00:16.000Z',
        description: 'Thoi diem ket thuc doan noi.',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], AppendLiveTranscriptSegmentDto.prototype, "endedAt", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        example: 0.92,
        minimum: 0,
        maximum: 1,
        description: 'Do tin cay cua speech-to-text neu provider co tra ve.',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(1),
    __metadata("design:type", Number)
], AppendLiveTranscriptSegmentDto.prototype, "confidence", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        example: 'browser-speech',
        maxLength: 50,
        description: 'Nguon tao transcript: browser-speech, deepgram, assemblyai...',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(50),
    __metadata("design:type", String)
], AppendLiveTranscriptSegmentDto.prototype, "source", void 0);
//# sourceMappingURL=append-live-transcript-segment.dto.js.map