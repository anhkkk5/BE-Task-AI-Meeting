import { Repository } from 'typeorm';
import { GetSprintsQueryDto } from '../dto/get-sprints-query.dto';
import { Sprint } from '../entities/sprint.entity';
export declare class SprintsRepository {
    private readonly repository;
    constructor(repository: Repository<Sprint>);
    create(data: Pick<Sprint, 'createdBy' | 'endDate' | 'goal' | 'name' | 'projectId' | 'startDate'>): Promise<Sprint>;
    findByIdAndProject(sprintId: string, projectId: string): Promise<Sprint | null>;
    findActiveByProject(projectId: string): Promise<Sprint | null>;
    findByProject(projectId: string, query: GetSprintsQueryDto): Promise<{
        items: Sprint[];
        total: number;
        page: number;
        limit: number;
    }>;
    update(sprint: Sprint, data: Partial<Sprint>): Promise<Sprint>;
}
