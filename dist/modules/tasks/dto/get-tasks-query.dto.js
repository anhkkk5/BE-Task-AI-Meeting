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
exports.GetTasksQueryDto = exports.TaskDependencyStateFilter = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
const task_status_enum_1 = require("../../../common/enums/task-status.enum");
const task_type_enum_1 = require("../../../common/enums/task-type.enum");
const task_priority_enum_1 = require("../../../common/enums/task-priority.enum");
var TaskDependencyStateFilter;
(function (TaskDependencyStateFilter) {
    TaskDependencyStateFilter["Blocked"] = "BLOCKED";
    TaskDependencyStateFilter["Blocking"] = "BLOCKING";
})(TaskDependencyStateFilter || (exports.TaskDependencyStateFilter = TaskDependencyStateFilter = {}));
class GetTasksQueryDto {
    sprintId;
    status;
    assigneeId;
    keyword;
    dependencyState;
    taskType;
    priority;
    parentId;
    page;
    limit;
}
exports.GetTasksQueryDto = GetTasksQueryDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        example: '9d38e4c2-0d77-4d6c-9127-b06b66d01001',
        description: 'Loc task theo sprint UUID.',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], GetTasksQueryDto.prototype, "sprintId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        enum: task_status_enum_1.TaskStatus,
        example: task_status_enum_1.TaskStatus.Todo,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(task_status_enum_1.TaskStatus),
    __metadata("design:type", String)
], GetTasksQueryDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        example: '5f12e7a0-c3db-4d4a-b8e9-a6b1fdc87001',
        description: 'Loc task theo assignee UUID.',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], GetTasksQueryDto.prototype, "assigneeId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        example: 'api',
        description: 'Tim theo title hoac taskCode.',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], GetTasksQueryDto.prototype, "keyword", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: TaskDependencyStateFilter }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(TaskDependencyStateFilter),
    __metadata("design:type", String)
], GetTasksQueryDto.prototype, "dependencyState", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: task_type_enum_1.TaskType }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(task_type_enum_1.TaskType),
    __metadata("design:type", String)
], GetTasksQueryDto.prototype, "taskType", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: task_priority_enum_1.TaskPriority }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(task_priority_enum_1.TaskPriority),
    __metadata("design:type", String)
], GetTasksQueryDto.prototype, "priority", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Lọc các Task con trực tiếp.' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], GetTasksQueryDto.prototype, "parentId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 1, minimum: 1 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], GetTasksQueryDto.prototype, "page", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 10, minimum: 1, maximum: 100 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(100),
    __metadata("design:type", Number)
], GetTasksQueryDto.prototype, "limit", void 0);
//# sourceMappingURL=get-tasks-query.dto.js.map