import { DailyMood } from '../../../common/enums/daily-mood.enum';
export declare class CreateDailyUpdateDto {
    sprintId?: string | null;
    updateDate: string;
    yesterdayWork: string;
    todayPlan: string;
    blockers?: string;
    notes?: string;
    mood?: DailyMood;
}
