import { DailyMood } from '../../../common/enums/daily-mood.enum';
export declare class UpdateDailyUpdateDto {
    sprintId?: string | null;
    yesterdayWork?: string;
    todayPlan?: string;
    blockers?: string | null;
    notes?: string | null;
    mood?: DailyMood | null;
}
