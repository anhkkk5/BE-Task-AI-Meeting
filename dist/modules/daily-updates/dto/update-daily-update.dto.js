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
exports.UpdateDailyUpdateDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const daily_mood_enum_1 = require("../../../common/enums/daily-mood.enum");
class UpdateDailyUpdateDto {
    sprintId;
    yesterdayWork;
    todayPlan;
    blockers;
    needHelpFromId;
    notes;
    mood;
}
exports.UpdateDailyUpdateDto = UpdateDailyUpdateDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        example: '9d38e4c2-0d77-4d6c-9127-b06b66d01001',
        description: 'Sprint UUID moi, hoac null de dua bao cao ra khoi sprint.',
        nullable: true,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", Object)
], UpdateDailyUpdateDto.prototype, "sprintId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        example: 'Da hoan thanh API tao task va API update task.',
        description: 'Noi dung hom qua da lam, toi da 3000 ky tu.',
        minLength: 2,
        maxLength: 3000,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(2),
    (0, class_validator_1.MaxLength)(3000),
    __metadata("design:type", String)
], UpdateDailyUpdateDto.prototype, "yesterdayWork", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        example: 'Lam test case cho Task Module.',
        description: 'Ke hoach hom nay, toi da 3000 ky tu.',
        minLength: 2,
        maxLength: 3000,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(2),
    (0, class_validator_1.MaxLength)(3000),
    __metadata("design:type", String)
], UpdateDailyUpdateDto.prototype, "todayPlan", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        example: 'Khong con blocker.',
        description: 'Kho khan/blocker moi, toi da 3000 ky tu.',
        maxLength: 3000,
        nullable: true,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(3000),
    __metadata("design:type", Object)
], UpdateDailyUpdateDto.prototype, "blockers", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        example: '9d38e4c2-0d77-4d6c-9127-b06b66d01002',
        description: 'UUID nguoi can ho tro moi, hoac null de bo yeu cau ho tro. Phai la thanh vien ACTIVE cua workspace.',
        nullable: true,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", Object)
], UpdateDailyUpdateDto.prototype, "needHelpFromId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        example: 'Can push code len Git.',
        description: 'Ghi chu moi, toi da 3000 ky tu.',
        maxLength: 3000,
        nullable: true,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(3000),
    __metadata("design:type", Object)
], UpdateDailyUpdateDto.prototype, "notes", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        enum: daily_mood_enum_1.DailyMood,
        example: daily_mood_enum_1.DailyMood.Good,
        description: 'Tam trang/trang thai moi.',
        nullable: true,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(daily_mood_enum_1.DailyMood),
    __metadata("design:type", Object)
], UpdateDailyUpdateDto.prototype, "mood", void 0);
//# sourceMappingURL=update-daily-update.dto.js.map