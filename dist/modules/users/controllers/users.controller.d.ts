import type { AuthUser } from '../../auth/types/auth-user.type';
import { ChangePasswordDto } from '../dto/change-password.dto';
import { UpdateProfileDto } from '../dto/update-profile.dto';
import { UsersService } from '../services/users.service';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
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
