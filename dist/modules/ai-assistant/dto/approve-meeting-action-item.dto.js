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
exports.ApproveMeetingActionItemDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const task_priority_enum_1 = require("../../../common/enums/task-priority.enum");
const class_validator_1 = require("class-validator");
class ApproveMeetingActionItemDto {
    title;
    description;
    priority;
    assigneeId;
    sprintId;
    dueDate;
    allowDuplicate;
}
exports.ApproveMeetingActionItemDto = ApproveMeetingActionItemDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Tieu de task. Bo trong de dung noi dung AI de xuat.',
        maxLength: 200,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(2),
    (0, class_validator_1.MaxLength)(200),
    __metadata("design:type", String)
], ApproveMeetingActionItemDto.prototype, "title", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ maxLength: 2000 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(2000),
    __metadata("design:type", String)
], ApproveMeetingActionItemDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: task_priority_enum_1.TaskPriority }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(task_priority_enum_1.TaskPriority),
    __metadata("design:type", String)
], ApproveMeetingActionItemDto.prototype, "priority", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'User UUID se duoc gan task.' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], ApproveMeetingActionItemDto.prototype, "assigneeId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Sprint UUID. Bo trong de tao task trong backlog.',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], ApproveMeetingActionItemDto.prototype, "sprintId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '2026-07-30' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], ApproveMeetingActionItemDto.prototype, "dueDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Cho phép tạo dù hệ thống phát hiện task tương tự.' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], ApproveMeetingActionItemDto.prototype, "allowDuplicate", void 0);
//# sourceMappingURL=approve-meeting-action-item.dto.js.map