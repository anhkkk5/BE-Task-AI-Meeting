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
exports.AiUserPreference = void 0;
const typeorm_1 = require("typeorm");
const ai_response_style_enum_1 = require("../enums/ai-response-style.enum");
const ai_tone_enum_1 = require("../enums/ai-tone.enum");
let AiUserPreference = class AiUserPreference {
    userId;
    responseStyle;
    tone;
    focusAreas;
    createdAt;
    updatedAt;
};
exports.AiUserPreference = AiUserPreference;
__decorate([
    (0, typeorm_1.PrimaryColumn)({ name: 'user_id', type: 'varchar', length: 36 }),
    __metadata("design:type", String)
], AiUserPreference.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'response_style',
        type: 'enum',
        enum: ai_response_style_enum_1.AiResponseStyle,
        default: ai_response_style_enum_1.AiResponseStyle.Balanced,
    }),
    __metadata("design:type", String)
], AiUserPreference.prototype, "responseStyle", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: ai_tone_enum_1.AiTone,
        default: ai_tone_enum_1.AiTone.Professional,
    }),
    __metadata("design:type", String)
], AiUserPreference.prototype, "tone", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'focus_areas', type: 'simple-json', nullable: true }),
    __metadata("design:type", Object)
], AiUserPreference.prototype, "focusAreas", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], AiUserPreference.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], AiUserPreference.prototype, "updatedAt", void 0);
exports.AiUserPreference = AiUserPreference = __decorate([
    (0, typeorm_1.Entity)('ai_user_preferences')
], AiUserPreference);
//# sourceMappingURL=ai-user-preference.entity.js.map