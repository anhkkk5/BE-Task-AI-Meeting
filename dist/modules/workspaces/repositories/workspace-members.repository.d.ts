import { EntityManager, Repository } from 'typeorm';
import { WorkspaceMember } from '../entities/workspace-member.entity';
export declare class WorkspaceMembersRepository {
    private readonly repository;
    constructor(repository: Repository<WorkspaceMember>);
    createOwnerMember(data: {
        workspaceId: string;
        userId: string;
    }, manager?: EntityManager): Promise<WorkspaceMember>;
    findActiveByWorkspaceAndUser(workspaceId: string, userId: string): Promise<WorkspaceMember | null>;
    findActiveByUser(userId: string, status?: string): Promise<WorkspaceMember[]>;
    private getRepository;
}
