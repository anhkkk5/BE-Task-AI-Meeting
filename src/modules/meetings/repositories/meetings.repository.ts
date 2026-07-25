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

  /**
   * Chuyen cuoc hop sang IN_PROGRESS khi nguoi dau tien vao phong.
   * Dung UPDATE co dieu kien de hai nguoi vao cung luc khong ghi de nhau:
   * chi request nao thay doi duoc dong (affected === 1) moi la nguoi dau tien.
   */
  async markInProgress(meetingId: string, projectId: string) {
    const result = await this.repository
      .createQueryBuilder()
      .update(Meeting)
      .set({ status: MeetingStatus.InProgress, actualStartTime: new Date() })
      .where('id = :meetingId', { meetingId })
      .andWhere('project_id = :projectId', { projectId })
      .andWhere('status = :status', { status: MeetingStatus.Scheduled })
      .andWhere('deleted_at IS NULL')
      .execute();

    return result.affected === 1;
  }

  /**
   * Lay cac cuoc hop da qua gio ket thuc nhung chua duoc chot.
   * Thoi diem ket thuc uu tien end_time, neu null thi lay het ngay hop,
   * dung dung logic voi isMeetingJoinable trong gateway.
   */
  findDueForAutoComplete(cutoff: Date, limit = 200) {
    return this.repository
      .createQueryBuilder('meeting')
      .where('meeting.status IN (:...statuses)', {
        statuses: [MeetingStatus.Scheduled, MeetingStatus.InProgress],
      })
      .andWhere('meeting.deletedAt IS NULL')
      .andWhere(
        `COALESCE(meeting.end_time, TIMESTAMP(meeting.meeting_date, '23:59:59')) <= :cutoff`,
        { cutoff },
      )
      .orderBy('meeting.meetingDate', 'ASC')
      .take(limit)
      .getMany();
  }

  async update(meeting: Meeting, data: Partial<Meeting>) {
    Object.assign(meeting, data);
    const savedMeeting = await this.repository.save(meeting);

    return (
      (await this.findByIdAndProject(savedMeeting.id, meeting.projectId)) ??
      savedMeeting
    );
  }

  async softDelete(meeting: Meeting) {
    await this.repository.softRemove(meeting);
  }

  updateTranscriptId(meeting: Meeting, mongoTranscriptId: string) {
    meeting.mongoTranscriptId = mongoTranscriptId;
    return this.repository.save(meeting);
  }

  updateSummaryId(meeting: Meeting, mongoSummaryId: string) {
    meeting.mongoSummaryId = mongoSummaryId;
    return this.repository.save(meeting);
  }

  private getRepository(manager?: EntityManager) {
    return manager ? manager.getRepository(Meeting) : this.repository;
  }

  private normalizeDate(value: string) {
    return value.slice(0, 10);
  }
}
