import { Repository } from 'typeorm';
import { GetDailyUpdatesQueryDto } from '../dto/get-daily-updates-query.dto';
import { DailyUpdate } from '../entities/daily-update.entity';
export declare class DailyUpdatesRepository {
    private readonly repository;
    constructor(repository: Repository<DailyUpdate>);
    create(data: Pick<DailyUpdate, 'blockers' | 'mood' | 'needHelpFromId' | 'notes' | 'projectId' | 'sprintId' | 'todayPlan' | 'updateDate' | 'userId' | 'workspaceId' | 'yesterdayWork' | 'submissionStatus' | 'generatedByAi' | 'submittedAt'>): Promise<DailyUpdate>;
    findDuplicate(workspaceId: string, projectId: string, userId: string, updateDate: string): Promise<DailyUpdate | null>;
    findByIdAndProject(dailyUpdateId: string, projectId: string): Promise<DailyUpdate | null>;
    findMy(projectId: string, userId: string, query: GetDailyUpdatesQueryDto): Promise<{
        items: DailyUpdate[];
        total: number;
        page: number;
        limit: number;
    }>;
    findTeam(projectId: string, query: GetDailyUpdatesQueryDto): Promise<{
        items: DailyUpdate[];
        total: number;
        page: number;
        limit: number;
    }>;
    findReviewDraft(projectId: string, userId: string, updateDate: string): Promise<DailyUpdate | null>;
    findPendingReviewDrafts(updateDate: string): Promise<DailyUpdate[]>;
    markPendingAsMissed(beforeDate: string): Promise<import("typeorm").UpdateResult>;
    update(dailyUpdate: DailyUpdate, data: Partial<DailyUpdate>): Promise<DailyUpdate>;
    archive(dailyUpdate: DailyUpdate): Promise<void>;
    private findByProject;
    private normalizeDate;
}
