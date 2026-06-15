import { ChangePasswordDto } from '../dto/change-password.dto';
import { UpdateProfileDto } from '../dto/update-profile.dto';
import { User } from '../entities/user.entity';
import { UsersRepository } from '../repositories/users.repository';
export declare class UsersService {
    private readonly usersRepository;
    private readonly saltRounds;
    constructor(usersRepository: UsersRepository);
    create(data: Partial<User>): Promise<User>;
    findById(id: string): Promise<User | null>;
    findByEmail(email: string): Promise<User | null>;
    updateRefreshTokenHash(id: string, refreshTokenHash: string | null): Promise<void>;
    getProfile(id: string): Promise<{
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
    updateProfile(id: string, dto: UpdateProfileDto): Promise<{
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
    changePassword(id: string, dto: ChangePasswordDto): Promise<{
        success: boolean;
        message: string;
        data: null;
    }>;
    toPublicUser(user: User): {
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
    private findExistingUser;
}
