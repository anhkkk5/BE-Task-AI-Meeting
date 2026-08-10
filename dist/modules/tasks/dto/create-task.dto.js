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
exports.CreateTaskDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
const task_type_enum_1 = require("../../../common/enums/task-type.enum");
const task_priority_enum_1 = require("../../../common/enums/task-priority.enum");
class CreateTaskDto {
    labels;
    acceptanceCriteria;
    reporterId;
    taskType;
    priority;
    parentId;
    title;
    description;
    sprintId;
    assigneeId;
    dueDate;
    estimatedHours;
    storyPoints;
}
exports.CreateTaskDto = CreateTaskDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: [String], example: ['frontend', 'urgent'] }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    (0, class_validator_1.MaxLength)(40, { each: true }),
    __metadata("design:type", Array)
], CreateTaskDto.prototype, "labels", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ maxLength: 4000 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(4000),
    __metadata("design:type", String)
], CreateTaskDto.prototype, "acceptanceCriteria", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'User báo cáo Task; mặc định là người tạo.' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], CreateTaskDto.prototype, "reporterId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: task_type_enum_1.TaskType, default: task_type_enum_1.TaskType.Task }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(task_type_enum_1.TaskType),
    __metadata("design:type", String)
], CreateTaskDto.prototype, "taskType", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: task_priority_enum_1.TaskPriority, default: task_priority_enum_1.TaskPriority.Medium }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(task_priority_enum_1.TaskPriority),
    __metadata("design:type", String)
], CreateTaskDto.prototype, "priority", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Task cha trong cùng Project.' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], CreateTaskDto.prototype, "parentId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'Code API tao task',
        description: 'Tieu de task, tu 2 den 200 ky tu.',
        minLength: 2,
        maxLength: 200,
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(2),
    (0, class_validator_1.MaxLength)(200),
    __metadata("design:type", String)
], CreateTaskDto.prototype, "title", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        example: 'Xay dung API tao task trong project',
        description: 'Mo ta chi tiet task, toi da 2000 ky tu.',
        maxLength: 2000,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(2000),
    __metadata("design:type", String)
], CreateTaskDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        example: '9d38e4c2-0d77-4d6c-9127-b06b66d01001',
        description: 'Sprint UUID neu task duoc dua truc tiep vao sprint.',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], CreateTaskDto.prototype, "sprintId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        example: '5f12e7a0-c3db-4d4a-b8e9-a6b1fdc87001',
        description: 'User UUID cua assignee ACTIVE trong workspace.',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], CreateTaskDto.prototype, "assigneeId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        example: '2026-06-25',
        description: 'Deadline theo dinh dang YYYY-MM-DD.',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateTaskDto.prototype, "dueDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        example: 6,
        minimum: 0.1,
        description: 'So gio uoc luong, phai lon hon 0.',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0.1),
    __metadata("design:type", Number)
], CreateTaskDto.prototype, "estimatedHours", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        example: 3,
        minimum: 1,
        description: 'Story points, phai la so nguyen duong.',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], CreateTaskDto.prototype, "storyPoints", void 0);
//# sourceMappingURL=create-task.dto.js.map