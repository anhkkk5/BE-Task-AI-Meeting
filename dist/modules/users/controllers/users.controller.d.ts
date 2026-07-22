import type { AuthUser } from '../../auth/types/auth-user.type';
import { ChangePasswordDto } from '../dto/change-password.dto';
import { UpdateAiUserPreferencesDto } from '../dto/update-ai-user-preferences.dto';
import { UpdateProfileDto } from '../dto/update-profile.dto';
import { AiUserPreferencesService } from '../services/ai-user-preferences.service';
import { UsersService } from '../services/users.service';
export declare class UsersController {
    private readonly usersService;
    private readonly aiUserPreferencesService;
    constructor(usersService: UsersService, aiUserPreferencesService: AiUserPreferencesService);
    getAiPreferences(user: AuthUser): Promise<{
        success: boolean;
        message: string;
        data: import("../types/ai-user-preferences.type").ResolvedAiUserPreferences;
    }>;
    updateAiPreferences(user: AuthUser, dto: UpdateAiUserPreferencesDto): Promise<{
        success: boolean;
        message: string;
        data: import("../types/ai-user-preferences.type").ResolvedAiUserPreferences;
    }>;
    resetAiPreferences(user: AuthUser): Promise<{
        success: boolean;
        message: string;
        data: import("../types/ai-user-preferences.type").ResolvedAiUserPreferences;
    }>;
    getProfile(user: AuthUser): Promise<{
        success: boolean;
        message: string;
        data: {
            id: string;
            email: string;
            fullName: string;
            avatarUrl: string | null;
            phoneNumber: string | null;
            jobTitle: string | null;
            status: import("../enums/user-status.enum").UserStatus;
            createdAt: Date;
            updatedAt: Date;
        };
    }>;
    updateProfile(user: AuthUser, dto: UpdateProfileDto): Promise<{
        success: boolean;
        message: string;
        data: {
            id: string;
            email: string;
            fullName: string;
            avatarUrl: string | null;
            phoneNumber: string | null;
            jobTitle: string | null;
            status: import("../enums/user-status.enum").UserStatus;
            createdAt: Date;
            updatedAt: Date;
        };
    }>;
    changePassword(user: AuthUser, dto: ChangePasswordDto): Promise<{
        success: boolean;
        message: string;
        data: null;
    }>;
}
