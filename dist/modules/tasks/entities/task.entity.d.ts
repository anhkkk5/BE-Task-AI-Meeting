import { TaskStatus } from '../../../common/enums/task-status.enum';
import { Project } from '../../projects/entities/project.entity';
import { Sprint } from '../../sprints/entities/sprint.entity';
import { User } from '../../users/entities/user.entity';
export declare class Task {
    isBlocked?: boolean;
    isBlocking?: boolean;
    id: string;
    projectId: string;
    sprintId: string | null;
    taskCode: string;
    title: string;
    description: string | null;
    status: TaskStatus;
    assigneeId: string | null;
    createdBy: string;
    dueDate: string | null;
    estimatedHours: number | null;
    storyPoints: number | null;
    project: Project;
    sprint: Sprint | null;
    assignee: User | null;
    creator: User;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date | null;
}
