import { TaskStatus } from '../../../common/enums/task-status.enum';
export declare class TaskImportItemDto {
    rowNumber?: number;
    title: string;
    description?: string | null;
    sprintId?: string | null;
    sprintName?: string | null;
    status?: TaskStatus;
    assigneeId?: string | null;
    assigneeEmail?: string | null;
    dueDate?: string | null;
    estimatedHours?: number | null;
    storyPoints?: number | null;
}
export declare class CommitTaskImportDto {
    items: TaskImportItemDto[];
}
