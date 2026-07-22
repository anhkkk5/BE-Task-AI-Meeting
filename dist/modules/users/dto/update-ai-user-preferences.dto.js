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
exports.UpdateAiUserPreferencesDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const ai_focus_area_enum_1 = require("../enums/ai-focus-area.enum");
const ai_response_style_enum_1 = require("../enums/ai-response-style.enum");
const ai_tone_enum_1 = require("../enums/ai-tone.enum");
class UpdateAiUserPreferencesDto {
    responseStyle;
    tone;
    focusAreas;
}
exports.UpdateAiUserPreferencesDto = UpdateAiUserPreferencesDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        enum: ai_response_style_enum_1.AiResponseStyle,
        example: ai_response_style_enum_1.AiResponseStyle.Balanced,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(ai_response_style_enum_1.AiResponseStyle),
    __metadata("design:type", String)
], UpdateAiUserPreferencesDto.prototype, "responseStyle", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: ai_tone_enum_1.AiTone, example: ai_tone_enum_1.AiTone.Professional }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(ai_tone_enum_1.AiTone),
    __metadata("design:type", String)
], UpdateAiUserPreferencesDto.prototype, "tone", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        enum: ai_focus_area_enum_1.AiFocusArea,
        isArray: true,
        example: [
            ai_focus_area_enum_1.AiFocusArea.Progress,
            ai_focus_area_enum_1.AiFocusArea.Blockers,
            ai_focus_area_enum_1.AiFocusArea.ActionItems,
        ],
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ArrayNotEmpty)(),
    (0, class_validator_1.ArrayUnique)(),
    (0, class_validator_1.IsEnum)(ai_focus_area_enum_1.AiFocusArea, { each: true }),
    __metadata("design:type", Array)
], UpdateAiUserPreferencesDto.prototype, "focusAreas", void 0);
//# sourceMappingURL=update-ai-user-preferences.dto.js.map