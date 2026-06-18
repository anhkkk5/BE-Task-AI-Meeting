import { EntityManager, Repository } from 'typeorm';
import { WorkspaceRole } from '../../../common/enums/workspace-role.enum';
import { WorkspaceMember } from '../entities/workspace-member.entity';
export declare class WorkspaceMembersRepository {
    private readonly repository;
    constructor(repository: Repository<WorkspaceMember>);
    createOwnerMember(data: {
        workspaceId: string;
        userId: string;
    }, manager?: EntityManager): Promise<WorkspaceMember>;
    createMember(data: {
        workspaceId: string;
        userId: string;
        role: WorkspaceRole;
    }, manager?: EntityManager): Promise<WorkspaceMember>;
    findActiveByWorkspaceAndUser(workspaceId: string, userId: string): Promise<WorkspaceMember | null>;
    findByIdAndWorkspace(memberId: string, workspaceId: string): Promise<WorkspaceMember | null>;
    findByWorkspaceAndUser(workspaceId: string, userId: string): Promise<WorkspaceMember | null>;
    findActiveByWorkspace(workspaceId: string): Promise<WorkspaceMember[]>;
    findActiveByUser(userId: string, status?: string): Promise<WorkspaceMember[]>;
    countActiveOwners(workspaceId: string): Promise<number>;
    updateMember(member: WorkspaceMember, data: Partial<WorkspaceMember>): Promise<WorkspaceMember>;
    private getRepository;
}
