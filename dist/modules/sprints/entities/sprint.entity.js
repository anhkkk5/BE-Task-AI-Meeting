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
exports.Sprint = void 0;
const typeorm_1 = require("typeorm");
const sprint_status_enum_1 = require("../../../common/enums/sprint-status.enum");
const project_entity_1 = require("../../projects/entities/project.entity");
const user_entity_1 = require("../../users/entities/user.entity");
let Sprint = class Sprint {
    id;
    projectId;
    name;
    goal;
    status;
    startDate;
    endDate;
    startedAt;
    completedAt;
    createdBy;
    project;
    creator;
    createdAt;
    updatedAt;
    deletedAt;
};
exports.Sprint = Sprint;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Sprint.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Index)(),
    (0, typeorm_1.Column)({ name: 'project_id', type: 'varchar', length: 36 }),
    __metadata("design:type", String)
], Sprint.prototype, "projectId", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 150 }),
    __metadata("design:type", String)
], Sprint.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 1000, nullable: true }),
    __metadata("design:type", Object)
], Sprint.prototype, "goal", void 0);
__decorate([
    (0, typeorm_1.Index)(),
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: sprint_status_enum_1.SprintStatus,
        default: sprint_status_enum_1.SprintStatus.Planned,
    }),
    __metadata("design:type", String)
], Sprint.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'start_date', type: 'date' }),
    __metadata("design:type", String)
], Sprint.prototype, "startDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'end_date', type: 'date' }),
    __metadata("design:type", String)
], Sprint.prototype, "endDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'started_at', type: 'datetime', nullable: true }),
    __metadata("design:type", Object)
], Sprint.prototype, "startedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'completed_at', type: 'datetime', nullable: true }),
    __metadata("design:type", Object)
], Sprint.prototype, "completedAt", void 0);
__decorate([
    (0, typeorm_1.Index)(),
    (0, typeorm_1.Column)({ name: 'created_by', type: 'varchar', length: 36 }),
    __metadata("design:type", String)
], Sprint.prototype, "createdBy", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => project_entity_1.Project, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'project_id' }),
    __metadata("design:type", project_entity_1.Project)
], Sprint.prototype, "project", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'created_by' }),
    __metadata("design:type", user_entity_1.User)
], Sprint.prototype, "creator", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], Sprint.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], Sprint.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.DeleteDateColumn)({ name: 'deleted_at', nullable: true }),
    __metadata("design:type", Object)
], Sprint.prototype, "deletedAt", void 0);
exports.Sprint = Sprint = __decorate([
    (0, typeorm_1.Entity)('sprints')
], Sprint);
//# sourceMappingURL=sprint.entity.js.map