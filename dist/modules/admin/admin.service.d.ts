import { DataSource, Repository } from 'typeorm';
import { UserStatus } from '../users/enums/user-status.enum';
import { User } from '../users/entities/user.entity';
import { Workspace } from '../workspaces/entities/workspace.entity';
import { WorkspaceStatus } from '../../common/enums/workspace-status.enum';
export declare class AdminService {
    private readonly userRepo;
    private readonly workspaceRepo;
    private readonly dataSource;
    constructor(userRepo: Repository<User>, workspaceRepo: Repository<Workspace>, dataSource: DataSource);
    getSystemStats(): Promise<{
        success: boolean;
        message: string;
        data: {
            users: {
                total: number;
                active: number;
                inactive: number;
                admins: number;
                newLast30Days: number;
            };
            workspaces: {
                total: number;
                active: number;
                archived: number;
                newLast30Days: number;
            };
            projects: {
                total: number;
            };
            tasks: {
                total: number;
            };
            meetings: {
                total: number;
            };
        };
    }>;
    getAllUsers(query: {
        page?: number;
        limit?: number;
        search?: string;
        status?: string;
    }): Promise<{
        success: boolean;
        message: string;
        data: {
            items: {
                id: string;
                email: string;
                fullName: string;
                avatarUrl: string | null;
                jobTitle: string | null;
                status: UserStatus;
                isSystemAdmin: boolean;
                createdAt: Date;
                updatedAt: Date;
            }[];
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    toggleUserStatus(adminId: string, targetUserId: string): Promise<{
        success: boolean;
        message: string;
        data: {
            id: string;
            email: string;
            fullName: string;
            avatarUrl: string | null;
            jobTitle: string | null;
            status: UserStatus;
            isSystemAdmin: boolean;
            createdAt: Date;
            updatedAt: Date;
        };
    }>;
    toggleAdminRole(adminId: string, targetUserId: string): Promise<{
        success: boolean;
        message: string;
        data: {
            id: string;
            email: string;
            fullName: string;
            avatarUrl: string | null;
            jobTitle: string | null;
            status: UserStatus;
            isSystemAdmin: boolean;
            createdAt: Date;
            updatedAt: Date;
        };
    }>;
    getAllWorkspaces(query: {
        page?: number;
        limit?: number;
        search?: string;
        status?: string;
    }): Promise<{
        success: boolean;
        message: string;
        data: {
            items: {
                id: string;
                name: string;
                slug: string;
                description: string | null;
                plan: import("../../common/enums/workspace-plan.enum").WorkspacePlan;
                status: WorkspaceStatus;
                ownerId: string;
                memberCount: number;
                createdAt: Date;
                updatedAt: Date;
            }[];
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    toggleWorkspaceStatus(workspaceId: string): Promise<{
        success: boolean;
        message: string;
        data: {
            id: string;
            status: WorkspaceStatus;
        };
    }>;
    private toUserResponse;
}
