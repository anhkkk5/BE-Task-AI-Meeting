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
exports.TaskActivityLog = exports.TaskActivityAction = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("../../users/entities/user.entity");
const task_entity_1 = require("./task.entity");
var TaskActivityAction;
(function (TaskActivityAction) {
    TaskActivityAction["Created"] = "CREATED";
    TaskActivityAction["Updated"] = "UPDATED";
    TaskActivityAction["StatusChanged"] = "STATUS_CHANGED";
    TaskActivityAction["Assigned"] = "ASSIGNED";
    TaskActivityAction["SprintMoved"] = "SPRINT_MOVED";
    TaskActivityAction["Cancelled"] = "CANCELLED";
    TaskActivityAction["Deleted"] = "DELETED";
    TaskActivityAction["Commented"] = "COMMENTED";
    TaskActivityAction["CommentUpdated"] = "COMMENT_UPDATED";
    TaskActivityAction["CommentDeleted"] = "COMMENT_DELETED";
})(TaskActivityAction || (exports.TaskActivityAction = TaskActivityAction = {}));
let TaskActivityLog = class TaskActivityLog {
    id;
    taskId;
    projectId;
    actorId;
    action;
    changes;
    task;
    actor;
    createdAt;
};
exports.TaskActivityLog = TaskActivityLog;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], TaskActivityLog.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'task_id', type: 'varchar', length: 36 }),
    __metadata("design:type", String)
], TaskActivityLog.prototype, "taskId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'project_id', type: 'varchar', length: 36 }),
    __metadata("design:type", String)
], TaskActivityLog.prototype, "projectId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'actor_id', type: 'varchar', length: 36 }),
    __metadata("design:type", String)
], TaskActivityLog.prototype, "actorId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 40 }),
    __metadata("design:type", String)
], TaskActivityLog.prototype, "action", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'json', nullable: true }),
    __metadata("design:type", Object)
], TaskActivityLog.prototype, "changes", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => task_entity_1.Task, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'task_id' }),
    __metadata("design:type", task_entity_1.Task)
], TaskActivityLog.prototype, "task", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'actor_id' }),
    __metadata("design:type", user_entity_1.User)
], TaskActivityLog.prototype, "actor", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at', precision: 6 }),
    __metadata("design:type", Date)
], TaskActivityLog.prototype, "createdAt", void 0);
exports.TaskActivityLog = TaskActivityLog = __decorate([
    (0, typeorm_1.Entity)('task_activity_logs'),
    (0, typeorm_1.Index)(['taskId', 'createdAt'])
], TaskActivityLog);
//# sourceMappingURL=task-activity-log.entity.js.map