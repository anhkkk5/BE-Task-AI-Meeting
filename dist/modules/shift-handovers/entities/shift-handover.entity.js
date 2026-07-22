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
exports.ShiftHandover = void 0;
const typeorm_1 = require("typeorm");
const handover_status_enum_1 = require("../../../common/enums/handover-status.enum");
const project_entity_1 = require("../../projects/entities/project.entity");
const task_entity_1 = require("../../tasks/entities/task.entity");
const user_entity_1 = require("../../users/entities/user.entity");
const workspace_entity_1 = require("../../workspaces/entities/workspace.entity");
let ShiftHandover = class ShiftHandover {
    id;
    workspaceId;
    projectId;
    taskId;
    senderId;
    receiverId;
    title;
    summary;
    completedWork;
    remainingWork;
    blockers;
    nextSteps;
    referenceLinks;
    dueAt;
    status;
    changeRequest;
    rejectionReason;
    submittedAt;
    acknowledgedAt;
    rejectedAt;
    workspace;
    project;
    task;
    sender;
    receiver;
    createdAt;
    updatedAt;
    deletedAt;
};
exports.ShiftHandover = ShiftHandover;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], ShiftHandover.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Index)(),
    (0, typeorm_1.Column)({ name: 'workspace_id', type: 'varchar', length: 36 }),
    __metadata("design:type", String)
], ShiftHandover.prototype, "workspaceId", void 0);
__decorate([
    (0, typeorm_1.Index)(),
    (0, typeorm_1.Column)({ name: 'project_id', type: 'varchar', length: 36 }),
    __metadata("design:type", String)
], ShiftHandover.prototype, "projectId", void 0);
__decorate([
    (0, typeorm_1.Index)(),
    (0, typeorm_1.Column)({ name: 'task_id', type: 'varchar', length: 36, nullable: true }),
    __metadata("design:type", Object)
], ShiftHandover.prototype, "taskId", void 0);
__decorate([
    (0, typeorm_1.Index)(),
    (0, typeorm_1.Column)({ name: 'sender_id', type: 'varchar', length: 36 }),
    __metadata("design:type", String)
], ShiftHandover.prototype, "senderId", void 0);
__decorate([
    (0, typeorm_1.Index)(),
    (0, typeorm_1.Column)({ name: 'receiver_id', type: 'varchar', length: 36 }),
    __metadata("design:type", String)
], ShiftHandover.prototype, "receiverId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 200 }),
    __metadata("design:type", String)
], ShiftHandover.prototype, "title", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", Object)
], ShiftHandover.prototype, "summary", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'completed_work', type: 'text', nullable: true }),
    __metadata("design:type", Object)
], ShiftHandover.prototype, "completedWork", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'remaining_work', type: 'text', nullable: true }),
    __metadata("design:type", Object)
], ShiftHandover.prototype, "remainingWork", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", Object)
], ShiftHandover.prototype, "blockers", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'next_steps', type: 'text', nullable: true }),
    __metadata("design:type", Object)
], ShiftHandover.prototype, "nextSteps", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'reference_links', type: 'text', nullable: true }),
    __metadata("design:type", Object)
], ShiftHandover.prototype, "referenceLinks", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'due_at', type: 'datetime', nullable: true }),
    __metadata("design:type", Object)
], ShiftHandover.prototype, "dueAt", void 0);
__decorate([
    (0, typeorm_1.Index)(),
    (0, typeorm_1.Column)({ type: 'enum', enum: handover_status_enum_1.HandoverStatus, default: handover_status_enum_1.HandoverStatus.Draft }),
    __metadata("design:type", String)
], ShiftHandover.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'change_request', type: 'varchar', length: 1000, nullable: true }),
    __metadata("design:type", Object)
], ShiftHandover.prototype, "changeRequest", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'rejection_reason', type: 'varchar', length: 1000, nullable: true }),
    __metadata("design:type", Object)
], ShiftHandover.prototype, "rejectionReason", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'submitted_at', type: 'datetime', nullable: true }),
    __metadata("design:type", Object)
], ShiftHandover.prototype, "submittedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'acknowledged_at', type: 'datetime', nullable: true }),
    __metadata("design:type", Object)
], ShiftHandover.prototype, "acknowledgedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'rejected_at', type: 'datetime', nullable: true }),
    __metadata("design:type", Object)
], ShiftHandover.prototype, "rejectedAt", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => workspace_entity_1.Workspace, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'workspace_id' }),
    __metadata("design:type", workspace_entity_1.Workspace)
], ShiftHandover.prototype, "workspace", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => project_entity_1.Project, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'project_id' }),
    __metadata("design:type", project_entity_1.Project)
], ShiftHandover.prototype, "project", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => task_entity_1.Task, { nullable: true, onDelete: 'SET NULL' }),
    (0, typeorm_1.JoinColumn)({ name: 'task_id' }),
    __metadata("design:type", Object)
], ShiftHandover.prototype, "task", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'sender_id' }),
    __metadata("design:type", user_entity_1.User)
], ShiftHandover.prototype, "sender", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'receiver_id' }),
    __metadata("design:type", user_entity_1.User)
], ShiftHandover.prototype, "receiver", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], ShiftHandover.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], ShiftHandover.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.DeleteDateColumn)({ name: 'deleted_at', nullable: true }),
    __metadata("design:type", Object)
], ShiftHandover.prototype, "deletedAt", void 0);
exports.ShiftHandover = ShiftHandover = __decorate([
    (0, typeorm_1.Entity)('shift_handovers')
], ShiftHandover);
//# sourceMappingURL=shift-handover.entity.js.map