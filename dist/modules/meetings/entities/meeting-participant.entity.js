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
exports.MeetingParticipant = void 0;
const typeorm_1 = require("typeorm");
const meeting_participant_role_enum_1 = require("../../../common/enums/meeting-participant-role.enum");
const user_entity_1 = require("../../users/entities/user.entity");
const meeting_entity_1 = require("./meeting.entity");
let MeetingParticipant = class MeetingParticipant {
    id;
    meetingId;
    userId;
    role;
    attended;
    meeting;
    user;
    createdAt;
    updatedAt;
};
exports.MeetingParticipant = MeetingParticipant;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], MeetingParticipant.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Index)(),
    (0, typeorm_1.Column)({ name: 'meeting_id', type: 'varchar', length: 36 }),
    __metadata("design:type", String)
], MeetingParticipant.prototype, "meetingId", void 0);
__decorate([
    (0, typeorm_1.Index)(),
    (0, typeorm_1.Column)({ name: 'user_id', type: 'varchar', length: 36 }),
    __metadata("design:type", String)
], MeetingParticipant.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: meeting_participant_role_enum_1.MeetingParticipantRole,
        default: meeting_participant_role_enum_1.MeetingParticipantRole.Participant,
    }),
    __metadata("design:type", String)
], MeetingParticipant.prototype, "role", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], MeetingParticipant.prototype, "attended", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => meeting_entity_1.Meeting, (meeting) => meeting.participants, {
        onDelete: 'CASCADE',
    }),
    (0, typeorm_1.JoinColumn)({ name: 'meeting_id' }),
    __metadata("design:type", meeting_entity_1.Meeting)
], MeetingParticipant.prototype, "meeting", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'user_id' }),
    __metadata("design:type", user_entity_1.User)
], MeetingParticipant.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], MeetingParticipant.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], MeetingParticipant.prototype, "updatedAt", void 0);
exports.MeetingParticipant = MeetingParticipant = __decorate([
    (0, typeorm_1.Entity)('meeting_participants'),
    (0, typeorm_1.Index)(['meetingId', 'userId'], { unique: true })
], MeetingParticipant);
//# sourceMappingURL=meeting-participant.entity.js.map