import { DailyMood } from '../../../common/enums/daily-mood.enum';
export declare class CreateDailyUpdateDto {
    sprintId?: string | null;
    updateDate: string;
    yesterdayWork: string;
    todayPlan: string;
    blockers?: string;
    needHelpFromId?: string | null;
    notes?: string;
    mood?: DailyMood;
}
