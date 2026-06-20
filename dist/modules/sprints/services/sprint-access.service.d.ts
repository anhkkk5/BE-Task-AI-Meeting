import { SprintsRepository } from '../repositories/sprints.repository';
export declare class SprintAccessService {
    private readonly sprintsRepository;
    constructor(sprintsRepository: SprintsRepository);
    getSprintInProject(sprintId: string, projectId: string): Promise<import("../entities/sprint.entity").Sprint | null>;
    assertSprintInProject(sprintId: string, projectId: string): Promise<import("../entities/sprint.entity").Sprint>;
    assertSprintPlanned(sprintId: string, projectId: string): Promise<import("../entities/sprint.entity").Sprint>;
    assertSprintActive(sprintId: string, projectId: string): Promise<import("../entities/sprint.entity").Sprint>;
    assertProjectHasNoActiveSprint(projectId: string, sprintId?: string): Promise<void>;
}
