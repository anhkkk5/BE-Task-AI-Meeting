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
exports.MeetingsRepository = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const meeting_status_enum_1 = require("../../../common/enums/meeting-status.enum");
const meeting_entity_1 = require("../entities/meeting.entity");
let MeetingsRepository = class MeetingsRepository {
    repository;
    constructor(repository) {
        this.repository = repository;
    }
    async create(data, manager) {
        const repository = this.getRepository(manager);
        const meeting = repository.create({
            ...data,
            status: meeting_status_enum_1.MeetingStatus.Scheduled,
            mongoTranscriptId: null,
            mongoSummaryId: null,
        });
        const savedMeeting = await repository.save(meeting);
        return ((await this.findByIdAndProject(savedMeeting.id, data.projectId, manager)) ?? savedMeeting);
    }
    findByIdAndProject(meetingId, projectId, manager) {
        return this.getRepository(manager).findOne({
            where: {
                id: meetingId,
                projectId,
            },
            relations: {
                creator: true,
                participants: {
                    user: true,
                },
                sprint: true,
            },
        });
    }
    async findByProject(projectId, query) {
        const page = query.page ?? 1;
        const limit = query.limit ?? 20;
        const builder = this.repository
            .createQueryBuilder('meeting')
            .leftJoinAndSelect('meeting.creator', 'creator')
            .leftJoinAndSelect('meeting.sprint', 'sprint')
            .where('meeting.projectId = :projectId', { projectId })
            .andWhere('meeting.deletedAt IS NULL');
        if (query.status) {
            builder.andWhere('meeting.status = :status', { status: query.status });
        }
        if (query.meetingType) {
            builder.andWhere('meeting.meetingType = :meetingType', {
                meetingType: query.meetingType,
            });
        }
        if (query.sprintId) {
            builder.andWhere('meeting.sprintId = :sprintId', {
                sprintId: query.sprintId,
            });
        }
        if (query.fromDate) {
            builder.andWhere('meeting.meetingDate >= :fromDate', {
                fromDate: this.normalizeDate(query.fromDate),
            });
        }
        if (query.toDate) {
            builder.andWhere('meeting.meetingDate <= :toDate', {
                toDate: this.normalizeDate(query.toDate),
            });
        }
        if (query.keyword?.trim()) {
            const keyword = `%${query.keyword.trim()}%`;
            builder.andWhere('(meeting.title LIKE :keyword OR meeting.description LIKE :keyword)', { keyword });
        }
        const [items, total] = await builder
            .orderBy('meeting.meetingDate', 'DESC')
            .addOrderBy('meeting.startTime', 'DESC')
            .addOrderBy('meeting.createdAt', 'DESC')
            .skip((page - 1) * limit)
            .take(limit)
            .getManyAndCount();
        return { items, total, page, limit };
    }
    async update(meeting, data) {
        Object.assign(meeting, data);
        const savedMeeting = await this.repository.save(meeting);
        return ((await this.findByIdAndProject(savedMeeting.id, meeting.projectId)) ??
            savedMeeting);
    }
    updateTranscriptId(meeting, mongoTranscriptId) {
        meeting.mongoTranscriptId = mongoTranscriptId;
        return this.repository.save(meeting);
    }
    getRepository(manager) {
        return manager ? manager.getRepository(meeting_entity_1.Meeting) : this.repository;
    }
    normalizeDate(value) {
        return value.slice(0, 10);
    }
};
exports.MeetingsRepository = MeetingsRepository;
exports.MeetingsRepository = MeetingsRepository = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(meeting_entity_1.Meeting)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], MeetingsRepository);
//# sourceMappingURL=meetings.repository.js.map