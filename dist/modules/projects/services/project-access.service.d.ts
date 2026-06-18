import { ProjectsRepository } from '../repositories/projects.repository';
export declare class ProjectAccessService {
    private readonly projectsRepository;
    constructor(projectsRepository: ProjectsRepository);
    getProjectInWorkspace(projectId: string, workspaceId: string): Promise<import("../entities/project.entity").Project | null>;
    assertProjectInWorkspace(projectId: string, workspaceId: string): Promise<import("../entities/project.entity").Project>;
    assertProjectActive(projectId: string, workspaceId: string): Promise<import("../entities/project.entity").Project>;
}
