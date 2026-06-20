import { SprintStatus } from '../../../common/enums/sprint-status.enum';
import { Project } from '../../projects/entities/project.entity';
import { User } from '../../users/entities/user.entity';
export declare class Sprint {
    id: string;
    projectId: string;
    name: string;
    goal: string | null;
    status: SprintStatus;
    startDate: string;
    endDate: string;
    startedAt: Date | null;
    completedAt: Date | null;
    createdBy: string;
    project: Project;
    creator: User;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date | null;
}
