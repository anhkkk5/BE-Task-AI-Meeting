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
exports.AskProjectAssistantDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
class AskProjectAssistantDto {
    question;
    sprintId;
}
exports.AskProjectAssistantDto = AskProjectAssistantDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'Sprint hiện tại có những rủi ro nào cần xử lý trước?',
        minLength: 3,
        maxLength: 500,
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(3),
    (0, class_validator_1.MaxLength)(500),
    __metadata("design:type", String)
], AskProjectAssistantDto.prototype, "question", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Giới hạn câu hỏi trong một Sprint. Bỏ trống để hỏi toàn dự án.',
        example: '2b34712e-7eb4-4baa-bf20-f7bb61d80c5e',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], AskProjectAssistantDto.prototype, "sprintId", void 0);
//# sourceMappingURL=ask-project-assistant.dto.js.map