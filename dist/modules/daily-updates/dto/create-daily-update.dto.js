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
exports.CreateDailyUpdateDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const daily_mood_enum_1 = require("../../../common/enums/daily-mood.enum");
class CreateDailyUpdateDto {
    sprintId;
    updateDate;
    yesterdayWork;
    todayPlan;
    blockers;
    needHelpFromId;
    notes;
    mood;
}
exports.CreateDailyUpdateDto = CreateDailyUpdateDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        example: '9d38e4c2-0d77-4d6c-9127-b06b66d01001',
        description: 'Sprint UUID neu bao cao gan voi mot sprint.',
        nullable: true,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", Object)
], CreateDailyUpdateDto.prototype, "sprintId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: '2026-06-20',
        description: 'Ngay bao cao theo dinh dang YYYY-MM-DD.',
    }),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateDailyUpdateDto.prototype, "updateDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'Hoan thanh API tao task va API xem danh sach task.',
        description: 'Noi dung hom qua da lam, toi da 3000 ky tu.',
        minLength: 2,
        maxLength: 3000,
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(2),
    (0, class_validator_1.MaxLength)(3000),
    __metadata("design:type", String)
], CreateDailyUpdateDto.prototype, "yesterdayWork", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'Lam API cap nhat trang thai task va API gan task.',
        description: 'Ke hoach hom nay, toi da 3000 ky tu.',
        minLength: 2,
        maxLength: 3000,
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(2),
    (0, class_validator_1.MaxLength)(3000),
    __metadata("design:type", String)
], CreateDailyUpdateDto.prototype, "todayPlan", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        example: 'Chua thong nhat rule MEMBER duoc doi trang thai task.',
        description: 'Kho khan/blocker, toi da 3000 ky tu.',
        maxLength: 3000,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(3000),
    __metadata("design:type", String)
], CreateDailyUpdateDto.prototype, "blockers", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        example: '9d38e4c2-0d77-4d6c-9127-b06b66d01002',
        description: 'UUID nguoi ma minh can ho tro trong ngay. Phai la thanh vien ACTIVE cua workspace.',
        nullable: true,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", Object)
], CreateDailyUpdateDto.prototype, "needHelpFromId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        example: 'Can review lai phan phan quyen task.',
        description: 'Ghi chu them, toi da 3000 ky tu.',
        maxLength: 3000,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(3000),
    __metadata("design:type", String)
], CreateDailyUpdateDto.prototype, "notes", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        enum: daily_mood_enum_1.DailyMood,
        example: daily_mood_enum_1.DailyMood.Normal,
        description: 'Tam trang/trang thai lam viec trong ngay.',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(daily_mood_enum_1.DailyMood),
    __metadata("design:type", String)
], CreateDailyUpdateDto.prototype, "mood", void 0);
//# sourceMappingURL=create-daily-update.dto.js.map