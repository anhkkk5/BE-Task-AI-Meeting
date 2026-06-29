import { EntityManager, Repository } from 'typeorm';
import { GetMeetingsQueryDto } from '../dto/get-meetings-query.dto';
import { Meeting } from '../entities/meeting.entity';
export declare class MeetingsRepository {
    private readonly repository;
    constructor(repository: Repository<Meeting>);
    create(data: Pick<Meeting, 'createdBy' | 'description' | 'endTime' | 'meetingDate' | 'meetingType' | 'projectId' | 'sprintId' | 'startTime' | 'title' | 'workspaceId'>, manager?: EntityManager): Promise<Meeting>;
    findByIdAndProject(meetingId: string, projectId: string, manager?: EntityManager): Promise<Meeting | null>;
    findByProject(projectId: string, query: GetMeetingsQueryDto): Promise<{
        items: Meeting[];
        total: number;
        page: number;
        limit: number;
    }>;
    update(meeting: Meeting, data: Partial<Meeting>): Promise<Meeting>;
    updateTranscriptId(meeting: Meeting, mongoTranscriptId: string): Promise<Meeting>;
    updateSummaryId(meeting: Meeting, mongoSummaryId: string): Promise<Meeting>;
    private getRepository;
    private normalizeDate;
}
