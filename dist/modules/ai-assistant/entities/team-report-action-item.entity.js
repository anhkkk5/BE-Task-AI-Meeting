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
exports.TeamReportActionItem = void 0;
const typeorm_1 = require("typeorm");
const team_report_action_item_status_enum_1 = require("../../../common/enums/team-report-action-item-status.enum");
let TeamReportActionItem = class TeamReportActionItem {
    id;
    workspaceId;
    projectId;
    reportId;
    source;
    itemIndex;
    itemText;
    status;
    createdTaskId;
    targetTaskId;
    suggestedReceiverId;
    handoverId;
    note;
    handledBy;
    handledAt;
    createdAt;
    updatedAt;
};
exports.TeamReportActionItem = TeamReportActionItem;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], TeamReportActionItem.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Index)(),
    (0, typeorm_1.Column)({ name: 'workspace_id', type: 'varchar', length: 36 }),
    __metadata("design:type", String)
], TeamReportActionItem.prototype, "workspaceId", void 0);
__decorate([
    (0, typeorm_1.Index)(),
    (0, typeorm_1.Column)({ name: 'project_id', type: 'varchar', length: 36 }),
    __metadata("design:type", String)
], TeamReportActionItem.prototype, "projectId", void 0);
__decorate([
    (0, typeorm_1.Index)(),
    (0, typeorm_1.Column)({ name: 'report_id', type: 'varchar', length: 64 }),
    __metadata("design:type", String)
], TeamReportActionItem.prototype, "reportId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: team_report_action_item_status_enum_1.TeamReportActionItemSource }),
    __metadata("design:type", String)
], TeamReportActionItem.prototype, "source", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'item_index', type: 'int' }),
    __metadata("design:type", Number)
], TeamReportActionItem.prototype, "itemIndex", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'item_text', type: 'text' }),
    __metadata("design:type", String)
], TeamReportActionItem.prototype, "itemText", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: team_report_action_item_status_enum_1.TeamReportActionItemStatus,
        default: team_report_action_item_status_enum_1.TeamReportActionItemStatus.Pending,
    }),
    __metadata("design:type", String)
], TeamReportActionItem.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'created_task_id',
        type: 'varchar',
        length: 36,
        nullable: true,
    }),
    __metadata("design:type", Object)
], TeamReportActionItem.prototype, "createdTaskId", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'target_task_id',
        type: 'varchar',
        length: 36,
        nullable: true,
    }),
    __metadata("design:type", Object)
], TeamReportActionItem.prototype, "targetTaskId", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'suggested_receiver_id',
        type: 'varchar',
        length: 36,
        nullable: true,
    }),
    __metadata("design:type", Object)
], TeamReportActionItem.prototype, "suggestedReceiverId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'handover_id', type: 'varchar', length: 36, nullable: true }),
    __metadata("design:type", Object)
], TeamReportActionItem.prototype, "handoverId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'note', type: 'varchar', length: 500, nullable: true }),
    __metadata("design:type", Object)
], TeamReportActionItem.prototype, "note", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'handled_by', type: 'varchar', length: 36, nullable: true }),
    __metadata("design:type", Object)
], TeamReportActionItem.prototype, "handledBy", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'handled_at', type: 'datetime', nullable: true }),
    __metadata("design:type", Object)
], TeamReportActionItem.prototype, "handledAt", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], TeamReportActionItem.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], TeamReportActionItem.prototype, "updatedAt", void 0);
exports.TeamReportActionItem = TeamReportActionItem = __decorate([
    (0, typeorm_1.Entity)('team_report_action_items'),
    (0, typeorm_1.Index)(['reportId', 'source', 'itemIndex'], { unique: true })
], TeamReportActionItem);
//# sourceMappingURL=team-report-action-item.entity.js.map