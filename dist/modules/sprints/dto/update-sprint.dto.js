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
exports.UpdateSprintDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
class UpdateSprintDto {
    name;
    goal;
    startDate;
    endDate;
}
exports.UpdateSprintDto = UpdateSprintDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        example: 'Sprint 1 - Analysis and design',
        description: 'Ten sprint moi, tu 2 den 150 ky tu.',
        minLength: 2,
        maxLength: 150,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(2),
    (0, class_validator_1.MaxLength)(150),
    __metadata("design:type", String)
], UpdateSprintDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        example: 'Hoan thanh use case, backlog va phan quyen',
        description: 'Muc tieu sprint, toi da 1000 ky tu.',
        maxLength: 1000,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(1000),
    __metadata("design:type", String)
], UpdateSprintDto.prototype, "goal", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        example: '2026-06-15',
        description: 'Ngay bat dau theo dinh dang YYYY-MM-DD.',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], UpdateSprintDto.prototype, "startDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        example: '2026-06-22',
        description: 'Ngay ket thuc theo dinh dang YYYY-MM-DD.',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], UpdateSprintDto.prototype, "endDate", void 0);
//# sourceMappingURL=update-sprint.dto.js.map