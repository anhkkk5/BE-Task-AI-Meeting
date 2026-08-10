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
exports.TaskComment = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("../../users/entities/user.entity");
const task_entity_1 = require("./task.entity");
let TaskComment = class TaskComment {
    id;
    taskId;
    authorId;
    content;
    mentionedUserIds;
    task;
    author;
    createdAt;
    updatedAt;
    deletedAt;
};
exports.TaskComment = TaskComment;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], TaskComment.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'task_id', type: 'varchar', length: 36 }),
    __metadata("design:type", String)
], TaskComment.prototype, "taskId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'author_id', type: 'varchar', length: 36 }),
    __metadata("design:type", String)
], TaskComment.prototype, "authorId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text' }),
    __metadata("design:type", String)
], TaskComment.prototype, "content", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'mentioned_user_ids', type: 'json', nullable: true }),
    __metadata("design:type", Object)
], TaskComment.prototype, "mentionedUserIds", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => task_entity_1.Task, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'task_id' }),
    __metadata("design:type", task_entity_1.Task)
], TaskComment.prototype, "task", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'author_id' }),
    __metadata("design:type", user_entity_1.User)
], TaskComment.prototype, "author", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at', precision: 6 }),
    __metadata("design:type", Date)
], TaskComment.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at', precision: 6 }),
    __metadata("design:type", Date)
], TaskComment.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.DeleteDateColumn)({ name: 'deleted_at', nullable: true }),
    __metadata("design:type", Object)
], TaskComment.prototype, "deletedAt", void 0);
exports.TaskComment = TaskComment = __decorate([
    (0, typeorm_1.Entity)('task_comments'),
    (0, typeorm_1.Index)(['taskId', 'createdAt'])
], TaskComment);
//# sourceMappingURL=task-comment.entity.js.map