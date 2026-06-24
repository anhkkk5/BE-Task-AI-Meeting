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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MeetingParticipantsRepository = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const meeting_participant_entity_1 = require("../entities/meeting-participant.entity");
let MeetingParticipantsRepository = class MeetingParticipantsRepository {
    repository;
    constructor(repository) {
        this.repository = repository;
    }
    async createMany(data, manager) {
        const repository = this.getRepository(manager);
        const participants = data.map((item) => repository.create({
            attended: item.attended ?? false,
            meetingId: item.meetingId,
            role: item.role,
            userId: item.userId,
        }));
        return repository.save(participants);
    }
    findByMeeting(meetingId) {
        return this.repository.find({
            where: {
                meetingId,
            },
            relations: {
                user: true,
            },
            order: {
                createdAt: 'ASC',
            },
        });
    }
    findByIdAndMeeting(participantId, meetingId) {
        return this.repository.findOne({
            where: {
                id: participantId,
                meetingId,
            },
            relations: {
                user: true,
            },
        });
    }
    findByMeetingAndUser(meetingId, userId) {
        return this.repository.findOne({
            where: {
                meetingId,
                userId,
            },
            relations: {
                user: true,
            },
        });
    }
    findByMeetingAndUsers(meetingId, userIds) {
        return this.repository.find({
            where: {
                meetingId,
                userId: (0, typeorm_2.In)(userIds),
            },
        });
    }
    async update(participant, data) {
        Object.assign(participant, data);
        return this.repository.save(participant);
    }
    getRepository(manager) {
        return manager
            ? manager.getRepository(meeting_participant_entity_1.MeetingParticipant)
            : this.repository;
    }
};
exports.MeetingParticipantsRepository = MeetingParticipantsRepository;
exports.MeetingParticipantsRepository = MeetingParticipantsRepository = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(meeting_participant_entity_1.MeetingParticipant)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], MeetingParticipantsRepository);
//# sourceMappingURL=meeting-participants.repository.js.map