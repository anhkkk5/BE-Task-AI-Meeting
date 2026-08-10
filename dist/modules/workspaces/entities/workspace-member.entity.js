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
exports.WorkspaceMember = void 0;
const typeorm_1 = require("typeorm");
const workspace_member_status_enum_1 = require("../../../common/enums/workspace-member-status.enum");
const workspace_role_enum_1 = require("../../../common/enums/workspace-role.enum");
const user_entity_1 = require("../../users/entities/user.entity");
const workspace_entity_1 = require("./workspace.entity");
let WorkspaceMember = class WorkspaceMember {
    id;
    workspaceId;
    userId;
    role;
    status;
    joinedAt;
    dailyCapacityHours;
    unavailableDates;
    workspace;
    user;
    createdAt;
    updatedAt;
};
exports.WorkspaceMember = WorkspaceMember;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], WorkspaceMember.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Index)(),
    (0, typeorm_1.Column)({ name: 'workspace_id', type: 'varchar', length: 36 }),
    __metadata("design:type", String)
], WorkspaceMember.prototype, "workspaceId", void 0);
__decorate([
    (0, typeorm_1.Index)(),
    (0, typeorm_1.Column)({ name: 'user_id', type: 'varchar', length: 36 }),
    __metadata("design:type", String)
], WorkspaceMember.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: workspace_role_enum_1.WorkspaceRole,
    }),
    __metadata("design:type", String)
], WorkspaceMember.prototype, "role", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: workspace_member_status_enum_1.WorkspaceMemberStatus,
        default: workspace_member_status_enum_1.WorkspaceMemberStatus.Active,
    }),
    __metadata("design:type", String)
], WorkspaceMember.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'joined_at', type: 'datetime', nullable: true }),
    __metadata("design:type", Object)
], WorkspaceMember.prototype, "joinedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'daily_capacity_hours', type: 'float', default: 8 }),
    __metadata("design:type", Number)
], WorkspaceMember.prototype, "dailyCapacityHours", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'unavailable_dates', type: 'json', nullable: true }),
    __metadata("design:type", Object)
], WorkspaceMember.prototype, "unavailableDates", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => workspace_entity_1.Workspace, (workspace) => workspace.members, {
        onDelete: 'CASCADE',
    }),
    (0, typeorm_1.JoinColumn)({ name: 'workspace_id' }),
    __metadata("design:type", workspace_entity_1.Workspace)
], WorkspaceMember.prototype, "workspace", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'user_id' }),
    __metadata("design:type", user_entity_1.User)
], WorkspaceMember.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], WorkspaceMember.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], WorkspaceMember.prototype, "updatedAt", void 0);
exports.WorkspaceMember = WorkspaceMember = __decorate([
    (0, typeorm_1.Entity)('workspace_members'),
    (0, typeorm_1.Index)(['workspaceId', 'userId'], { unique: true })
], WorkspaceMember);
//# sourceMappingURL=workspace-member.entity.js.map