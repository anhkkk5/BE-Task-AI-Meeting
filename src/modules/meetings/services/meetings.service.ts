import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { MeetingParticipantRole } from '../../../common/enums/meeting-participant-role.enum';
import { MeetingStatus } from '../../../common/enums/meeting-status.enum';
import { MeetingType } from '../../../common/enums/meeting-type.enum';
import { ProjectAccessService } from '../../projects/services/project-access.service';
import { SprintAccessService } from '../../sprints/services/sprint-access.service';
import { WorkspaceAccessService } from '../../workspaces/services/workspace-access.service';
import { CreateMeetingDto } from '../dto/create-meeting.dto';
import { GetMeetingsQueryDto } from '../dto/get-meetings-query.dto';
import { UpdateMeetingDto } from '../dto/update-meeting.dto';
import { MeetingParticipant } from '../entities/meeting-participant.entity';
import { Meeting } from '../entities/meeting.entity';
import { MeetingParticipantsRepository } from '../repositories/meeting-participants.repository';
import { MeetingsRepository } from '../repositories/meetings.repository';
import { MeetingAccessService } from './meeting-access.service';

@Injectable()
export class MeetingsService {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
    private readonly meetingsRepository: MeetingsRepository,
    private readonly meetingParticipantsRepository: MeetingParticipantsRepository,
    private readonly meetingAccessService: MeetingAccessService,
    private readonly workspaceAccessService: WorkspaceAccessService,
    private readonly projectAccessService: ProjectAccessService,
    private readonly sprintAccessService: SprintAccessService,
  ) {}

  async createMeeting(
    currentUserId: string,
    workspaceId: string,
    projectId: string,
    dto: CreateMeetingDto,
  ) {
    await this.workspaceAccessService.assertWorkspaceActive(workspaceId);
    await this.meetingAccessService.assertUserCanManageMeeting(
      currentUserId,
      workspaceId,
    );
    await this.projectAccessService.assertProjectActive(projectId, workspaceId);
    await this.assertSprintFilter(projectId, dto.sprintId ?? undefined);
    this.assertTimeRange(dto.startTime, dto.endTime);

    const participantIds = this.uniqueUserIds([
      currentUserId,
      ...(dto.participantIds ?? []),
    ]);
    await this.assertParticipantsInWorkspace(participantIds, workspaceId);

    const meeting = await this.dataSource.transaction(async (manager) => {
      const createdMeeting = await this.meetingsRepository.create(
        {
          workspaceId,
          projectId,
          sprintId: dto.sprintId ?? null,
          title: dto.title.trim(),
          description: this.optionalText(dto.description),
          meetingType: dto.meetingType ?? MeetingType.General,
          meetingDate: this.normalizeDate(dto.meetingDate),
          startTime: this.toDateOrNull(dto.startTime),
          endTime: this.toDateOrNull(dto.endTime),
          createdBy: currentUserId,
        },
        manager,
      );

      await this.meetingParticipantsRepository.createMany(
        participantIds.map((userId) => ({
          attended: userId === currentUserId,
          meetingId: createdMeeting.id,
          role:
            userId === currentUserId
              ? MeetingParticipantRole.Host
              : MeetingParticipantRole.Participant,
          userId,
        })),
        manager,
      );

      return createdMeeting;
    });

    const meetingWithParticipants =
      await this.meetingsRepository.findByIdAndProject(meeting.id, projectId);

    return {
      success: true,
      message: 'Create meeting successfully',
      data: {
        meeting: this.toMeetingResponse(meetingWithParticipants ?? meeting),
      },
    };
  }

  async getMeetings(
    currentUserId: string,
    workspaceId: string,
    projectId: string,
    query: GetMeetingsQueryDto,
  ) {
    await this.meetingAccessService.assertUserCanViewMeeting(
      currentUserId,
      workspaceId,
    );
    await this.projectAccessService.assertProjectInWorkspace(
      projectId,
      workspaceId,
    );
    await this.assertValidMeetingFilters(projectId, query);

    const result = await this.meetingsRepository.findByProject(
      projectId,
      query,
    );

    return {
      success: true,
      message: 'Get meetings successfully',
      data: {
        items: result.items.map((meeting) => this.toMeetingResponse(meeting)),
        meta: {
          total: result.total,
          page: result.page,
          limit: result.limit,
        },
      },
    };
  }

  async getMeetingDetail(
    currentUserId: string,
    workspaceId: string,
    projectId: string,
    meetingId: string,
  ) {
    await this.meetingAccessService.assertUserCanViewMeeting(
      currentUserId,
      workspaceId,
    );
    await this.projectAccessService.assertProjectInWorkspace(
      projectId,
      workspaceId,
    );
    const meeting = await this.meetingAccessService.assertMeetingInProject(
      meetingId,
      projectId,
    );

    return {
      success: true,
      message: 'Get meeting detail successfully',
      data: {
        meeting: this.toMeetingResponse(meeting),
      },
    };
  }

  async updateMeeting(
    currentUserId: string,
    workspaceId: string,
    projectId: string,
    meetingId: string,
    dto: UpdateMeetingDto,
  ) {
    await this.workspaceAccessService.assertWorkspaceActive(workspaceId);
    await this.meetingAccessService.assertUserCanManageMeeting(
      currentUserId,
      workspaceId,
    );
    await this.projectAccessService.assertProjectActive(projectId, workspaceId);
    const meeting = await this.meetingAccessService.assertMeetingInProject(
      meetingId,
      projectId,
    );
    this.meetingAccessService.assertMeetingEditable(meeting);
    await this.assertSprintFilter(projectId, dto.sprintId ?? undefined);
    this.assertTimeRange(
      dto.startTime === undefined
        ? meeting.startTime?.toISOString()
        : dto.startTime,
      dto.endTime === undefined ? meeting.endTime?.toISOString() : dto.endTime,
    );

    const updatedMeeting = await this.meetingsRepository.update(meeting, {
      sprintId: dto.sprintId === undefined ? meeting.sprintId : dto.sprintId,
      title: dto.title === undefined ? meeting.title : dto.title.trim(),
      description:
        dto.description === undefined
          ? meeting.description
          : this.optionalText(dto.description),
      meetingType: dto.meetingType ?? meeting.meetingType,
      meetingDate:
        dto.meetingDate === undefined
          ? meeting.meetingDate
          : this.normalizeDate(dto.meetingDate),
      startTime:
        dto.startTime === undefined
          ? meeting.startTime
          : this.toDateOrNull(dto.startTime),
      endTime:
        dto.endTime === undefined
          ? meeting.endTime
          : this.toDateOrNull(dto.endTime),
    });

    return {
      success: true,
      message: 'Update meeting successfully',
      data: {
        meeting: this.toMeetingResponse(updatedMeeting),
      },
    };
  }

  async cancelMeeting(
    currentUserId: string,
    workspaceId: string,
    projectId: string,
    meetingId: string,
  ) {
    await this.changeMeetingStatus(
      currentUserId,
      workspaceId,
      projectId,
      meetingId,
      MeetingStatus.Cancelled,
    );

    return {
      success: true,
      message: 'Cancel meeting successfully',
      data: null,
    };
  }

  async completeMeeting(
    currentUserId: string,
    workspaceId: string,
    projectId: string,
    meetingId: string,
  ) {
    await this.changeMeetingStatus(
      currentUserId,
      workspaceId,
      projectId,
      meetingId,
      MeetingStatus.Completed,
    );

    return {
      success: true,
      message: 'Complete meeting successfully',
      data: null,
    };
  }

  async deleteMeeting(
    currentUserId: string,
    workspaceId: string,
    projectId: string,
    meetingId: string,
  ) {
    await this.workspaceAccessService.assertWorkspaceActive(workspaceId);
    await this.projectAccessService.assertProjectInWorkspace(
      projectId,
      workspaceId,
    );
    await this.meetingAccessService.assertUserCanViewMeeting(
      currentUserId,
      workspaceId,
    );

    const meeting = await this.meetingAccessService.assertMeetingInProject(
      meetingId,
      projectId,
    );
    const isManager = await this.meetingAccessService.isMeetingManager(
      currentUserId,
      workspaceId,
    );

    if (!isManager && meeting.createdBy !== currentUserId) {
      throw new ForbiddenException('You can not delete this meeting');
    }

    await this.meetingsRepository.softDelete(meeting);

    return {
      success: true,
      message: 'Delete meeting successfully',
      data: null,
    };
  }

  private async changeMeetingStatus(
    currentUserId: string,
    workspaceId: string,
    projectId: string,
    meetingId: string,
    status: MeetingStatus,
  ) {
    await this.workspaceAccessService.assertWorkspaceActive(workspaceId);
    await this.meetingAccessService.assertUserCanManageMeeting(
      currentUserId,
      workspaceId,
    );
    await this.projectAccessService.assertProjectInWorkspace(
      projectId,
      workspaceId,
    );
    const meeting = await this.meetingAccessService.assertMeetingInProject(
      meetingId,
      projectId,
    );
    this.meetingAccessService.assertMeetingEditable(meeting);

    await this.meetingsRepository.update(meeting, { status });
  }

  private async assertValidMeetingFilters(
    projectId: string,
    query: GetMeetingsQueryDto,
  ) {
    if (query.fromDate && query.toDate) {
      const fromDate = this.normalizeDate(query.fromDate);
      const toDate = this.normalizeDate(query.toDate);

      if (fromDate > toDate) {
        throw new BadRequestException(
          'fromDate must be before or equal to toDate',
        );
      }
    }

    await this.assertSprintFilter(projectId, query.sprintId);
  }

  private async assertSprintFilter(
    projectId: string,
    sprintId?: string | null,
  ) {
    if (sprintId) {
      await this.sprintAccessService.assertSprintInProject(sprintId, projectId);
    }
  }

  private async assertParticipantsInWorkspace(
    userIds: string[],
    workspaceId: string,
  ) {
    for (const userId of userIds) {
      try {
        await this.workspaceAccessService.assertWorkspaceMember(
          userId,
          workspaceId,
        );
      } catch {
        throw new BadRequestException(
          'Participant is not an active member of this workspace',
        );
      }
    }
  }

  private assertTimeRange(startTime?: string | null, endTime?: string | null) {
    if (!startTime || !endTime) {
      return;
    }

    if (new Date(endTime).getTime() <= new Date(startTime).getTime()) {
      throw new BadRequestException('endTime must be after startTime');
    }
  }

  private uniqueUserIds(userIds: string[]) {
    return [...new Set(userIds)];
  }

  private normalizeDate(value: string) {
    return value.slice(0, 10);
  }

  private optionalText(value: string | null | undefined) {
    if (value === null || value === undefined) {
      return null;
    }

    const trimmedValue = value.trim();
    return trimmedValue.length ? trimmedValue : null;
  }

  private toDateOrNull(value: string | null | undefined) {
    return value ? new Date(value) : null;
  }

  private toParticipantResponse(participant: MeetingParticipant) {
    return {
      participantId: participant.id,
      userId: participant.userId,
      fullName: participant.user?.fullName ?? null,
      email: participant.user?.email ?? null,
      avatarUrl: participant.user?.avatarUrl ?? null,
      role: participant.role,
      attended: participant.attended,
    };
  }

  private toMeetingResponse(meeting: Meeting) {
    return {
      id: meeting.id,
      workspaceId: meeting.workspaceId,
      projectId: meeting.projectId,
      sprintId: meeting.sprintId,
      title: meeting.title,
      description: meeting.description,
      meetingType: meeting.meetingType,
      meetingDate: meeting.meetingDate,
      startTime: meeting.startTime,
      endTime: meeting.endTime,
      status: meeting.status,
      createdBy: meeting.createdBy,
      creator: meeting.creator
        ? {
            id: meeting.creator.id,
            fullName: meeting.creator.fullName,
            email: meeting.creator.email,
          }
        : null,
      sprint: meeting.sprint
        ? {
            id: meeting.sprint.id,
            name: meeting.sprint.name,
            status: meeting.sprint.status,
          }
        : null,
      participants: meeting.participants?.map((participant) =>
        this.toParticipantResponse(participant),
      ),
      mongoTranscriptId: meeting.mongoTranscriptId,
      mongoSummaryId: meeting.mongoSummaryId,
      createdAt: meeting.createdAt,
      updatedAt: meeting.updatedAt,
    };
  }
}
