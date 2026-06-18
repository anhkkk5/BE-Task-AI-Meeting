import { EntityManager, Repository } from 'typeorm';
import { Workspace } from '../entities/workspace.entity';
export declare class WorkspacesRepository {
    private readonly repository;
    constructor(repository: Repository<Workspace>);
    create(data: Pick<Workspace, 'name' | 'slug' | 'description' | 'ownerId'>, manager?: EntityManager): Promise<Workspace>;
    findById(id: string): Promise<Workspace | null>;
    findBySlug(slug: string): Promise<Workspace | null>;
    update(id: string, data: Partial<Workspace>): Promise<Workspace | null>;
    archive(id: string): Promise<void>;
    private getRepository;
}
