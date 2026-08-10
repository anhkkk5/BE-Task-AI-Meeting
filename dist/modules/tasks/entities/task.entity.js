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
exports.Task = void 0;
const typeorm_1 = require("typeorm");
const task_status_enum_1 = require("../../../common/enums/task-status.enum");
const project_entity_1 = require("../../projects/entities/project.entity");
const sprint_entity_1 = require("../../sprints/entities/sprint.entity");
const user_entity_1 = require("../../users/entities/user.entity");
let Task = class Task {
    isBlocked;
    isBlocking;
    id;
    projectId;
    sprintId;
    taskCode;
    title;
    description;
    status;
    assigneeId;
    createdBy;
    dueDate;
    estimatedHours;
    storyPoints;
    project;
    sprint;
    assignee;
    creator;
    createdAt;
    updatedAt;
    deletedAt;
};
exports.Task = Task;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Task.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Index)(),
    (0, typeorm_1.Column)({ name: 'project_id', type: 'varchar', length: 36 }),
    __metadata("design:type", String)
], Task.prototype, "projectId", void 0);
__decorate([
    (0, typeorm_1.Index)(),
    (0, typeorm_1.Column)({ name: 'sprint_id', type: 'varchar', length: 36, nullable: true }),
    __metadata("design:type", Object)
], Task.prototype, "sprintId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'task_code', type: 'varchar', length: 40 }),
    __metadata("design:type", String)
], Task.prototype, "taskCode", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 200 }),
    __metadata("design:type", String)
], Task.prototype, "title", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 2000, nullable: true }),
    __metadata("design:type", Object)
], Task.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Index)(),
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: task_status_enum_1.TaskStatus,
        default: task_status_enum_1.TaskStatus.Backlog,
    }),
    __metadata("design:type", String)
], Task.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Index)(),
    (0, typeorm_1.Column)({ name: 'assignee_id', type: 'varchar', length: 36, nullable: true }),
    __metadata("design:type", Object)
], Task.prototype, "assigneeId", void 0);
__decorate([
    (0, typeorm_1.Index)(),
    (0, typeorm_1.Column)({ name: 'created_by', type: 'varchar', length: 36 }),
    __metadata("design:type", String)
], Task.prototype, "createdBy", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'due_date', type: 'date', nullable: true }),
    __metadata("design:type", Object)
], Task.prototype, "dueDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'estimated_hours', type: 'float', nullable: true }),
    __metadata("design:type", Object)
], Task.prototype, "estimatedHours", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'story_points', type: 'int', nullable: true }),
    __metadata("design:type", Object)
], Task.prototype, "storyPoints", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => project_entity_1.Project, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'project_id' }),
    __metadata("design:type", project_entity_1.Project)
], Task.prototype, "project", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => sprint_entity_1.Sprint, { nullable: true, onDelete: 'SET NULL' }),
    (0, typeorm_1.JoinColumn)({ name: 'sprint_id' }),
    __metadata("design:type", Object)
], Task.prototype, "sprint", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, { nullable: true, onDelete: 'SET NULL' }),
    (0, typeorm_1.JoinColumn)({ name: 'assignee_id' }),
    __metadata("design:type", Object)
], Task.prototype, "assignee", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'created_by' }),
    __metadata("design:type", user_entity_1.User)
], Task.prototype, "creator", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], Task.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], Task.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.DeleteDateColumn)({ name: 'deleted_at', nullable: true }),
    __metadata("design:type", Object)
], Task.prototype, "deletedAt", void 0);
exports.Task = Task = __decorate([
    (0, typeorm_1.Entity)('tasks'),
    (0, typeorm_1.Index)(['projectId', 'taskCode'], { unique: true })
], Task);
//# sourceMappingURL=task.entity.js.map