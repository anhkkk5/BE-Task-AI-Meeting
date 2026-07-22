import { Repository } from 'typeorm';
import { Project } from '../entities/project.entity';
import { GetProjectsQueryDto } from '../dto/get-projects-query.dto';
export declare class ProjectsRepository {
    private readonly repository;
    constructor(repository: Repository<Project>);
    create(data: Pick<Project, 'createdBy' | 'description' | 'endDate' | 'keyCode' | 'name' | 'startDate' | 'workspaceId'>): Promise<Project>;
    findByWorkspaceAndKeyCode(workspaceId: string, keyCode: string): Promise<Project | null>;
    findByIdAndWorkspace(projectId: string, workspaceId: string): Promise<Project | null>;
    findByWorkspace(workspaceId: string, query: GetProjectsQueryDto): Promise<{
        items: Project[];
        total: number;
        page: number;
        limit: number;
    }>;
    findActiveForAutomaticReports(reportDate: string): Promise<Project[]>;
    update(project: Project, data: Partial<Project>): Promise<Project>;
    archive(project: Project): Promise<void>;
    complete(project: Project): Promise<void>;
}
