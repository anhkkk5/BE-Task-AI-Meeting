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
exports.Meeting = void 0;
const typeorm_1 = require("typeorm");
const meeting_status_enum_1 = require("../../../common/enums/meeting-status.enum");
const meeting_type_enum_1 = require("../../../common/enums/meeting-type.enum");
const project_entity_1 = require("../../projects/entities/project.entity");
const sprint_entity_1 = require("../../sprints/entities/sprint.entity");
const user_entity_1 = require("../../users/entities/user.entity");
const workspace_entity_1 = require("../../workspaces/entities/workspace.entity");
const meeting_participant_entity_1 = require("./meeting-participant.entity");
let Meeting = class Meeting {
    id;
    workspaceId;
    projectId;
    sprintId;
    title;
    description;
    meetingType;
    meetingDate;
    startTime;
    endTime;
    status;
    createdBy;
    mongoTranscriptId;
    mongoSummaryId;
    workspace;
    project;
    sprint;
    creator;
    participants;
    createdAt;
    updatedAt;
    deletedAt;
};
exports.Meeting = Meeting;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Meeting.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Index)(),
    (0, typeorm_1.Column)({ name: 'workspace_id', type: 'varchar', length: 36 }),
    __metadata("design:type", String)
], Meeting.prototype, "workspaceId", void 0);
__decorate([
    (0, typeorm_1.Index)(),
    (0, typeorm_1.Column)({ name: 'project_id', type: 'varchar', length: 36 }),
    __metadata("design:type", String)
], Meeting.prototype, "projectId", void 0);
__decorate([
    (0, typeorm_1.Index)(),
    (0, typeorm_1.Column)({ name: 'sprint_id', type: 'varchar', length: 36, nullable: true }),
    __metadata("design:type", Object)
], Meeting.prototype, "sprintId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 200 }),
    __metadata("design:type", String)
], Meeting.prototype, "title", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 1000, nullable: true }),
    __metadata("design:type", Object)
], Meeting.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Index)(),
    (0, typeorm_1.Column)({
        name: 'meeting_type',
        type: 'enum',
        enum: meeting_type_enum_1.MeetingType,
        default: meeting_type_enum_1.MeetingType.General,
    }),
    __metadata("design:type", String)
], Meeting.prototype, "meetingType", void 0);
__decorate([
    (0, typeorm_1.Index)(),
    (0, typeorm_1.Column)({ name: 'meeting_date', type: 'date' }),
    __metadata("design:type", String)
], Meeting.prototype, "meetingDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'start_time', type: 'datetime', nullable: true }),
    __metadata("design:type", Object)
], Meeting.prototype, "startTime", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'end_time', type: 'datetime', nullable: true }),
    __metadata("design:type", Object)
], Meeting.prototype, "endTime", void 0);
__decorate([
    (0, typeorm_1.Index)(),
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: meeting_status_enum_1.MeetingStatus,
        default: meeting_status_enum_1.MeetingStatus.Scheduled,
    }),
    __metadata("design:type", String)
], Meeting.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Index)(),
    (0, typeorm_1.Column)({ name: 'created_by', type: 'varchar', length: 36 }),
    __metadata("design:type", String)
], Meeting.prototype, "createdBy", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'mongo_transcript_id',
        type: 'varchar',
        length: 100,
        nullable: true,
    }),
    __metadata("design:type", Object)
], Meeting.prototype, "mongoTranscriptId", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'mongo_summary_id',
        type: 'varchar',
        length: 100,
        nullable: true,
    }),
    __metadata("design:type", Object)
], Meeting.prototype, "mongoSummaryId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => workspace_entity_1.Workspace, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'workspace_id' }),
    __metadata("design:type", workspace_entity_1.Workspace)
], Meeting.prototype, "workspace", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => project_entity_1.Project, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'project_id' }),
    __metadata("design:type", project_entity_1.Project)
], Meeting.prototype, "project", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => sprint_entity_1.Sprint, { nullable: true, onDelete: 'SET NULL' }),
    (0, typeorm_1.JoinColumn)({ name: 'sprint_id' }),
    __metadata("design:type", Object)
], Meeting.prototype, "sprint", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'created_by' }),
    __metadata("design:type", user_entity_1.User)
], Meeting.prototype, "creator", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => meeting_participant_entity_1.MeetingParticipant, (participant) => participant.meeting),
    __metadata("design:type", Array)
], Meeting.prototype, "participants", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], Meeting.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], Meeting.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.DeleteDateColumn)({ name: 'deleted_at', nullable: true }),
    __metadata("design:type", Object)
], Meeting.prototype, "deletedAt", void 0);
exports.Meeting = Meeting = __decorate([
    (0, typeorm_1.Entity)('meetings')
], Meeting);
//# sourceMappingURL=meeting.entity.js.map