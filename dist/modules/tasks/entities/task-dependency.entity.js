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
exports.TaskDependency = void 0;
const typeorm_1 = require("typeorm");
const task_dependency_type_enum_1 = require("../../../common/enums/task-dependency-type.enum");
const user_entity_1 = require("../../users/entities/user.entity");
const task_entity_1 = require("./task.entity");
let TaskDependency = class TaskDependency {
    id;
    sourceTaskId;
    targetTaskId;
    type;
    createdBy;
    sourceTask;
    targetTask;
    creator;
    createdAt;
};
exports.TaskDependency = TaskDependency;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], TaskDependency.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'source_task_id', type: 'varchar', length: 36 }),
    __metadata("design:type", String)
], TaskDependency.prototype, "sourceTaskId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'target_task_id', type: 'varchar', length: 36 }),
    __metadata("design:type", String)
], TaskDependency.prototype, "targetTaskId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: task_dependency_type_enum_1.TaskDependencyType }),
    __metadata("design:type", String)
], TaskDependency.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'created_by', type: 'varchar', length: 36 }),
    __metadata("design:type", String)
], TaskDependency.prototype, "createdBy", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => task_entity_1.Task, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'source_task_id' }),
    __metadata("design:type", task_entity_1.Task)
], TaskDependency.prototype, "sourceTask", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => task_entity_1.Task, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'target_task_id' }),
    __metadata("design:type", task_entity_1.Task)
], TaskDependency.prototype, "targetTask", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'created_by' }),
    __metadata("design:type", user_entity_1.User)
], TaskDependency.prototype, "creator", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at', precision: 6 }),
    __metadata("design:type", Date)
], TaskDependency.prototype, "createdAt", void 0);
exports.TaskDependency = TaskDependency = __decorate([
    (0, typeorm_1.Entity)('task_dependencies'),
    (0, typeorm_1.Index)(['sourceTaskId', 'targetTaskId', 'type'], { unique: true })
], TaskDependency);
//# sourceMappingURL=task-dependency.entity.js.map