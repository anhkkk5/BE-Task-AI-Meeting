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
exports.CommitTaskImportDto = exports.TaskImportItemDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
const task_status_enum_1 = require("../../../common/enums/task-status.enum");
class TaskImportItemDto {
    rowNumber;
    title;
    description;
    sprintId;
    sprintName;
    status;
    assigneeId;
    assigneeEmail;
    dueDate;
    estimatedHours;
    storyPoints;
}
exports.TaskImportItemDto = TaskImportItemDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 2 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(2),
    __metadata("design:type", Number)
], TaskImportItemDto.prototype, "rowNumber", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Thiết kế màn hình backlog giống Jira' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(2),
    (0, class_validator_1.MaxLength)(200),
    __metadata("design:type", String)
], TaskImportItemDto.prototype, "title", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        example: 'Làm danh sách sprint, backlog và thao tác kéo thả task.',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(2000),
    __metadata("design:type", Object)
], TaskImportItemDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'sprint-uuid' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", Object)
], TaskImportItemDto.prototype, "sprintId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Sprint 1 - Setup' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(200),
    __metadata("design:type", Object)
], TaskImportItemDto.prototype, "sprintName", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        enum: task_status_enum_1.TaskStatus,
        example: task_status_enum_1.TaskStatus.Todo,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(task_status_enum_1.TaskStatus),
    __metadata("design:type", String)
], TaskImportItemDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'user-uuid' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", Object)
], TaskImportItemDto.prototype, "assigneeId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'member@example.com' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEmail)(),
    __metadata("design:type", Object)
], TaskImportItemDto.prototype, "assigneeEmail", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '2026-07-20' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", Object)
], TaskImportItemDto.prototype, "dueDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 4 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Object)
], TaskImportItemDto.prototype, "estimatedHours", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 3 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Object)
], TaskImportItemDto.prototype, "storyPoints", void 0);
class CommitTaskImportDto {
    items;
}
exports.CommitTaskImportDto = CommitTaskImportDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        type: [TaskImportItemDto],
        description: 'Danh sách task đã preview hợp lệ. Tối đa 200 dòng cho mỗi lần import.',
    }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ArrayMinSize)(1),
    (0, class_validator_1.ArrayMaxSize)(200),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => TaskImportItemDto),
    __metadata("design:type", Array)
], CommitTaskImportDto.prototype, "items", void 0);
//# sourceMappingURL=import-tasks.dto.js.map