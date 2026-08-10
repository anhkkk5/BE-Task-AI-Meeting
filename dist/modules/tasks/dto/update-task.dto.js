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
exports.UpdateTaskDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
const task_type_enum_1 = require("../../../common/enums/task-type.enum");
const task_priority_enum_1 = require("../../../common/enums/task-priority.enum");
class UpdateTaskDto {
    labels;
    acceptanceCriteria;
    reporterId;
    taskType;
    priority;
    parentId;
    title;
    description;
    dueDate;
    estimatedHours;
    storyPoints;
}
exports.UpdateTaskDto = UpdateTaskDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: [String] }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    (0, class_validator_1.MaxLength)(40, { each: true }),
    __metadata("design:type", Array)
], UpdateTaskDto.prototype, "labels", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ maxLength: 4000 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(4000),
    __metadata("design:type", String)
], UpdateTaskDto.prototype, "acceptanceCriteria", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", Object)
], UpdateTaskDto.prototype, "reporterId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: task_type_enum_1.TaskType }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(task_type_enum_1.TaskType),
    __metadata("design:type", String)
], UpdateTaskDto.prototype, "taskType", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: task_priority_enum_1.TaskPriority }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(task_priority_enum_1.TaskPriority),
    __metadata("design:type", String)
], UpdateTaskDto.prototype, "priority", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ nullable: true, description: 'UUID Task cha; null để bỏ liên kết.' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", Object)
], UpdateTaskDto.prototype, "parentId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        example: 'Code API tao va cap nhat task',
        description: 'Tieu de task moi, tu 2 den 200 ky tu.',
        minLength: 2,
        maxLength: 200,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(2),
    (0, class_validator_1.MaxLength)(200),
    __metadata("design:type", String)
], UpdateTaskDto.prototype, "title", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        example: 'Cap nhat mo ta task',
        description: 'Mo ta chi tiet task, toi da 2000 ky tu.',
        maxLength: 2000,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(2000),
    __metadata("design:type", String)
], UpdateTaskDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        example: '2026-06-28',
        description: 'Deadline theo dinh dang YYYY-MM-DD.',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], UpdateTaskDto.prototype, "dueDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 8, minimum: 0.1 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0.1),
    __metadata("design:type", Number)
], UpdateTaskDto.prototype, "estimatedHours", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 5, minimum: 1 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], UpdateTaskDto.prototype, "storyPoints", void 0);
//# sourceMappingURL=update-task.dto.js.map