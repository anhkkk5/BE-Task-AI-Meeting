import { JwtService } from '@nestjs/jwt';
import { MailService } from '../../mail/services/mail.service';
import { UserStatus } from '../../users/enums/user-status.enum';
import { UsersService } from '../../users/services/users.service';
import { LoginDto } from '../dto/login.dto';
import { RegisterDto } from '../dto/register.dto';
import { ResendOtpDto } from '../dto/resend-otp.dto';
import { VerifyOtpDto } from '../dto/verify-otp.dto';
import { OtpService } from './otp.service';
import { AuthUser } from '../types/auth-user.type';
export declare class AuthService {
    private readonly usersService;
    private readonly jwtService;
    private readonly otpService;
    private readonly mailService;
    private readonly saltRounds;
    constructor(usersService: UsersService, jwtService: JwtService, otpService: OtpService, mailService: MailService);
    register(dto: RegisterDto): Promise<{
        success: boolean;
        message: string;
        data: {
            email: string;
            otpExpiresInSeconds: number;
            resendAfterSeconds: number;
        };
    }>;
    verifyRegistrationOtp(dto: VerifyOtpDto): Promise<{
        body: {
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
                };
            };
        };
        refreshToken: string;
    }>;
    resendRegistrationOtp(dto: ResendOtpDto): Promise<{
        success: boolean;
        message: string;
        data: {
            email: string;
            otpExpiresInSeconds: number;
            resendAfterSeconds: number;
        };
    }>;
    private sendOtpMail;
    login(dto: LoginDto): Promise<{
        body: {
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
                };
            };
        };
        refreshToken: string;
    }>;
    refreshTokens(authUser: AuthUser, refreshToken: string): Promise<{
        body: {
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
                };
            };
        };
        refreshToken: string;
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
