import { JwtService } from '@nestjs/jwt';
import { UserStatus } from '../../users/enums/user-status.enum';
import { UsersService } from '../../users/services/users.service';
import { LoginDto } from '../dto/login.dto';
import { RegisterDto } from '../dto/register.dto';
import { AuthUser } from '../types/auth-user.type';
export declare class AuthService {
    private readonly usersService;
    private readonly jwtService;
    private readonly saltRounds;
    constructor(usersService: UsersService, jwtService: JwtService);
    register(dto: RegisterDto): Promise<{
        success: boolean;
        message: string;
        data: {
            user: {
                id: string;
                email: string;
                fullName: string;
                avatarUrl: string | null;
                phoneNumber: string | null;
                jobTitle: string | null;
                status: UserStatus;
                createdAt: Date;
                updatedAt: Date;
            };
            tokens: {
                accessToken: string;
                refreshToken: string;
            };
        };
    }>;
    login(dto: LoginDto): Promise<{
        success: boolean;
        message: string;
        data: {
            user: {
                id: string;
                email: string;
                fullName: string;
                avatarUrl: string | null;
                phoneNumber: string | null;
                jobTitle: string | null;
                status: UserStatus;
                createdAt: Date;
                updatedAt: Date;
            };
            tokens: {
                accessToken: string;
                refreshToken: string;
            };
        };
    }>;
    refreshTokens(authUser: AuthUser, refreshToken: string): Promise<{
        success: boolean;
        message: string;
        data: {
            user: {
                id: string;
                email: string;
                fullName: string;
                avatarUrl: string | null;
                phoneNumber: string | null;
                jobTitle: string | null;
                status: UserStatus;
                createdAt: Date;
                updatedAt: Date;
            };
            tokens: {
                accessToken: string;
                refreshToken: string;
            };
        };
    }>;
    logout(authUser: AuthUser): Promise<{
        success: boolean;
        message: string;
        data: null;
    }>;
    getMe(authUser: AuthUser): Promise<{
        success: boolean;
        message: string;
        data: {
            id: string;
            email: string;
            fullName: string;
            avatarUrl: string | null;
            phoneNumber: string | null;
            jobTitle: string | null;
            status: UserStatus;
            createdAt: Date;
            updatedAt: Date;
        };
    }>;
    private issueTokens;
    private storeRefreshTokenHash;
    private authResponse;
    private toPublicUser;
}
