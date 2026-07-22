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
exports.MeetingActionItemReview = void 0;
const typeorm_1 = require("typeorm");
const meeting_action_item_review_status_enum_1 = require("../../../common/enums/meeting-action-item-review-status.enum");
let MeetingActionItemReview = class MeetingActionItemReview {
    id;
    workspaceId;
    projectId;
    meetingId;
    summaryId;
    actionItemIndex;
    actionItemText;
    suggestedAssigneeName;
    suggestedDueDate;
    status;
    reviewedBy;
    reviewedAt;
    createdTaskId;
    rejectionReason;
    createdAt;
    updatedAt;
};
exports.MeetingActionItemReview = MeetingActionItemReview;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], MeetingActionItemReview.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Index)(),
    (0, typeorm_1.Column)({ name: 'workspace_id', type: 'varchar', length: 36 }),
    __metadata("design:type", String)
], MeetingActionItemReview.prototype, "workspaceId", void 0);
__decorate([
    (0, typeorm_1.Index)(),
    (0, typeorm_1.Column)({ name: 'project_id', type: 'varchar', length: 36 }),
    __metadata("design:type", String)
], MeetingActionItemReview.prototype, "projectId", void 0);
__decorate([
    (0, typeorm_1.Index)(),
    (0, typeorm_1.Column)({ name: 'meeting_id', type: 'varchar', length: 36 }),
    __metadata("design:type", String)
], MeetingActionItemReview.prototype, "meetingId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'summary_id', type: 'varchar', length: 36 }),
    __metadata("design:type", String)
], MeetingActionItemReview.prototype, "summaryId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'action_item_index', type: 'int' }),
    __metadata("design:type", Number)
], MeetingActionItemReview.prototype, "actionItemIndex", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'action_item_text', type: 'text' }),
    __metadata("design:type", String)
], MeetingActionItemReview.prototype, "actionItemText", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'suggested_assignee_name',
        type: 'varchar',
        length: 200,
        nullable: true,
    }),
    __metadata("design:type", Object)
], MeetingActionItemReview.prototype, "suggestedAssigneeName", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'suggested_due_date', type: 'date', nullable: true }),
    __metadata("design:type", Object)
], MeetingActionItemReview.prototype, "suggestedDueDate", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: meeting_action_item_review_status_enum_1.MeetingActionItemReviewStatus,
        default: meeting_action_item_review_status_enum_1.MeetingActionItemReviewStatus.Pending,
    }),
    __metadata("design:type", String)
], MeetingActionItemReview.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'reviewed_by', type: 'varchar', length: 36, nullable: true }),
    __metadata("design:type", Object)
], MeetingActionItemReview.prototype, "reviewedBy", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'reviewed_at', type: 'datetime', nullable: true }),
    __metadata("design:type", Object)
], MeetingActionItemReview.prototype, "reviewedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'created_task_id',
        type: 'varchar',
        length: 36,
        nullable: true,
    }),
    __metadata("design:type", Object)
], MeetingActionItemReview.prototype, "createdTaskId", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'rejection_reason',
        type: 'varchar',
        length: 500,
        nullable: true,
    }),
    __metadata("design:type", Object)
], MeetingActionItemReview.prototype, "rejectionReason", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], MeetingActionItemReview.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], MeetingActionItemReview.prototype, "updatedAt", void 0);
exports.MeetingActionItemReview = MeetingActionItemReview = __decorate([
    (0, typeorm_1.Entity)('meeting_action_item_reviews'),
    (0, typeorm_1.Index)(['summaryId', 'actionItemIndex'], { unique: true })
], MeetingActionItemReview);
//# sourceMappingURL=meeting-action-item-review.entity.js.map