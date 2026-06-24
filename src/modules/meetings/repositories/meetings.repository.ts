import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { MeetingStatus } from '../../../common/enums/meeting-status.enum';
import { GetMeetingsQueryDto } from '../dto/get-meetings-query.dto';
import { Meeting } from '../entities/meeting.entity';

@Injectable()
export class MeetingsRepository {
  constructor(
    @InjectRepository(Meeting)
    private readonly repository: Repository<Meeting>,
  ) {}

  async create(
    data: Pick<
      Meeting,
      | 'createdBy'
      | 'description'
      | 'endTime'
      | 'meetingDate'
      | 'meetingType'
      | 'projectId'
      | 'sprintId'
      | 'startTime'
      | 'title'
      | 'workspaceId'
    >,
    manager?: EntityManager,
  ) {
    const repository = this.getRepository(manager);
    const meeting = repository.create({
      ...data,
      status: MeetingStatus.Scheduled,
      mongoTranscriptId: null,
      mongoSummaryId: null,
    });
    const savedMeeting = await repository.save(meeting);

    return (
      (await this.findByIdAndProject(
        savedMeeting.id,
        data.projectId,
        manager,
      )) ?? savedMeeting
    );
  }

  findByIdAndProject(
    meetingId: string,
    projectId: string,
    manager?: EntityManager,
  ) {
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

  async findByProject(projectId: string, query: GetMeetingsQueryDto) {
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
      builder.andWhere(
        '(meeting.title LIKE :keyword OR meeting.description LIKE :keyword)',
        { keyword },
      );
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

  async update(meeting: Meeting, data: Partial<Meeting>) {
    Object.assign(meeting, data);
    const savedMeeting = await this.repository.save(meeting);

    return (
      (await this.findByIdAndProject(savedMeeting.id, meeting.projectId)) ??
      savedMeeting
    );
  }

  updateTranscriptId(meeting: Meeting, mongoTranscriptId: string) {
    meeting.mongoTranscriptId = mongoTranscriptId;
    return this.repository.save(meeting);
  }

  private getRepository(manager?: EntityManager) {
    return manager ? manager.getRepository(Meeting) : this.repository;
  }

  private normalizeDate(value: string) {
    return value.slice(0, 10);
  }
}
