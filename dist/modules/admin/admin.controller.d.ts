import type { AuthUser } from '../auth/types/auth-user.type';
import { AdminService } from './admin.service';
export declare class AdminController {
    private readonly adminService;
    constructor(adminService: AdminService);
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
    getAllUsers(page?: string, limit?: string, search?: string, status?: string): Promise<{
        success: boolean;
        message: string;
        data: {
            items: {
                id: string;
                email: string;
                fullName: string;
                avatarUrl: string | null;
                jobTitle: string | null;
                status: import("../users/enums/user-status.enum").UserStatus;
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
    toggleUserStatus(admin: AuthUser, userId: string): Promise<{
        success: boolean;
        message: string;
        data: {
            id: string;
            email: string;
            fullName: string;
            avatarUrl: string | null;
            jobTitle: string | null;
            status: import("../users/enums/user-status.enum").UserStatus;
            isSystemAdmin: boolean;
            createdAt: Date;
            updatedAt: Date;
        };
    }>;
    toggleAdminRole(admin: AuthUser, userId: string): Promise<{
        success: boolean;
        message: string;
        data: {
            id: string;
            email: string;
            fullName: string;
            avatarUrl: string | null;
            jobTitle: string | null;
            status: import("../users/enums/user-status.enum").UserStatus;
            isSystemAdmin: boolean;
            createdAt: Date;
            updatedAt: Date;
        };
    }>;
    getAllWorkspaces(page?: string, limit?: string, search?: string, status?: string): Promise<{
        success: boolean;
        message: string;
        data: {
            items: {
                id: string;
                name: string;
                slug: string;
                description: string | null;
                plan: import("../../common/enums/workspace-plan.enum").WorkspacePlan;
                status: import("../../common/enums/workspace-status.enum").WorkspaceStatus;
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
            status: import("../../common/enums/workspace-status.enum").WorkspaceStatus;
        };
    }>;
}
