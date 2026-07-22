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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AiUserPreferencesService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const ai_user_preference_entity_1 = require("../entities/ai-user-preference.entity");
const ai_user_preferences_type_1 = require("../types/ai-user-preferences.type");
let AiUserPreferencesService = class AiUserPreferencesService {
    repository;
    constructor(repository) {
        this.repository = repository;
    }
    async getPreferences(userId) {
        return {
            success: true,
            message: 'Đã lấy cấu hình cá nhân hóa.',
            data: await this.getResolvedPreferences(userId),
        };
    }
    async updatePreferences(userId, dto) {
        const current = await this.repository.findOne({ where: { userId } });
        const resolved = this.resolve(current);
        const saved = await this.repository.save(this.repository.create({
            ...current,
            userId,
            responseStyle: dto.responseStyle ?? resolved.responseStyle,
            tone: dto.tone ?? resolved.tone,
            focusAreas: dto.focusAreas ? [...dto.focusAreas] : resolved.focusAreas,
        }));
        return {
            success: true,
            message: 'Đã lưu cấu hình cá nhân hóa.',
            data: this.resolve(saved),
        };
    }
    async resetPreferences(userId) {
        await this.repository.delete({ userId });
        return {
            success: true,
            message: 'Đã khôi phục cấu hình mặc định.',
            data: this.defaultPreferences(),
        };
    }
    async getResolvedPreferences(userId) {
        const preference = await this.repository.findOne({ where: { userId } });
        return this.resolve(preference);
    }
    resolve(preference) {
        if (!preference)
            return this.defaultPreferences();
        return {
            responseStyle: preference.responseStyle,
            tone: preference.tone,
            focusAreas: preference.focusAreas?.length
                ? [...preference.focusAreas]
                : [...ai_user_preferences_type_1.DEFAULT_AI_USER_PREFERENCES.focusAreas],
        };
    }
    defaultPreferences() {
        return {
            ...ai_user_preferences_type_1.DEFAULT_AI_USER_PREFERENCES,
            focusAreas: [...ai_user_preferences_type_1.DEFAULT_AI_USER_PREFERENCES.focusAreas],
        };
    }
};
exports.AiUserPreferencesService = AiUserPreferencesService;
exports.AiUserPreferencesService = AiUserPreferencesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(ai_user_preference_entity_1.AiUserPreference)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], AiUserPreferencesService);
//# sourceMappingURL=ai-user-preferences.service.js.map