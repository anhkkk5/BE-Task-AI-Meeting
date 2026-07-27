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
exports.DailyUpdate = void 0;
const typeorm_1 = require("typeorm");
const daily_mood_enum_1 = require("../../../common/enums/daily-mood.enum");
const project_entity_1 = require("../../projects/entities/project.entity");
const sprint_entity_1 = require("../../sprints/entities/sprint.entity");
const user_entity_1 = require("../../users/entities/user.entity");
const workspace_entity_1 = require("../../workspaces/entities/workspace.entity");
let DailyUpdate = class DailyUpdate {
    id;
    workspaceId;
    projectId;
    sprintId;
    userId;
    updateDate;
    yesterdayWork;
    todayPlan;
    blockers;
    needHelpFromId;
    notes;
    mood;
    workspace;
    project;
    sprint;
    user;
    needHelpFrom;
    createdAt;
    updatedAt;
    deletedAt;
};
exports.DailyUpdate = DailyUpdate;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], DailyUpdate.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Index)(),
    (0, typeorm_1.Column)({ name: 'workspace_id', type: 'varchar', length: 36 }),
    __metadata("design:type", String)
], DailyUpdate.prototype, "workspaceId", void 0);
__decorate([
    (0, typeorm_1.Index)(),
    (0, typeorm_1.Column)({ name: 'project_id', type: 'varchar', length: 36 }),
    __metadata("design:type", String)
], DailyUpdate.prototype, "projectId", void 0);
__decorate([
    (0, typeorm_1.Index)(),
    (0, typeorm_1.Column)({ name: 'sprint_id', type: 'varchar', length: 36, nullable: true }),
    __metadata("design:type", Object)
], DailyUpdate.prototype, "sprintId", void 0);
__decorate([
    (0, typeorm_1.Index)(),
    (0, typeorm_1.Column)({ name: 'user_id', type: 'varchar', length: 36 }),
    __metadata("design:type", String)
], DailyUpdate.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.Index)(),
    (0, typeorm_1.Column)({ name: 'update_date', type: 'date' }),
    __metadata("design:type", String)
], DailyUpdate.prototype, "updateDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'yesterday_work', type: 'text' }),
    __metadata("design:type", String)
], DailyUpdate.prototype, "yesterdayWork", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'today_plan', type: 'text' }),
    __metadata("design:type", String)
], DailyUpdate.prototype, "todayPlan", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", Object)
], DailyUpdate.prototype, "blockers", void 0);
__decorate([
    (0, typeorm_1.Index)(),
    (0, typeorm_1.Column)({ name: 'need_help_from_id', type: 'varchar', length: 36, nullable: true }),
    __metadata("design:type", Object)
], DailyUpdate.prototype, "needHelpFromId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", Object)
], DailyUpdate.prototype, "notes", void 0);
__decorate([
    (0, typeorm_1.Index)(),
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: daily_mood_enum_1.DailyMood,
        nullable: true,
    }),
    __metadata("design:type", Object)
], DailyUpdate.prototype, "mood", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => workspace_entity_1.Workspace, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'workspace_id' }),
    __metadata("design:type", workspace_entity_1.Workspace)
], DailyUpdate.prototype, "workspace", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => project_entity_1.Project, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'project_id' }),
    __metadata("design:type", project_entity_1.Project)
], DailyUpdate.prototype, "project", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => sprint_entity_1.Sprint, { nullable: true, onDelete: 'SET NULL' }),
    (0, typeorm_1.JoinColumn)({ name: 'sprint_id' }),
    __metadata("design:type", Object)
], DailyUpdate.prototype, "sprint", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'user_id' }),
    __metadata("design:type", user_entity_1.User)
], DailyUpdate.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, { nullable: true, onDelete: 'SET NULL' }),
    (0, typeorm_1.JoinColumn)({ name: 'need_help_from_id' }),
    __metadata("design:type", Object)
], DailyUpdate.prototype, "needHelpFrom", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], DailyUpdate.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], DailyUpdate.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.DeleteDateColumn)({ name: 'deleted_at', nullable: true }),
    __metadata("design:type", Object)
], DailyUpdate.prototype, "deletedAt", void 0);
exports.DailyUpdate = DailyUpdate = __decorate([
    (0, typeorm_1.Entity)('daily_updates'),
    (0, typeorm_1.Index)(['workspaceId', 'projectId', 'userId', 'updateDate'], { unique: true })
], DailyUpdate);
//# sourceMappingURL=daily-update.entity.js.map