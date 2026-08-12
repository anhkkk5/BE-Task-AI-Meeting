import { JwtService } from '@nestjs/jwt';
import { MailService } from '../../mail/services/mail.service';
import { UserStatus } from '../../users/enums/user-status.enum';
import { UsersService } from '../../users/services/users.service';
import { LoginDto } from '../dto/login.dto';
import { RegisterDto } from '../dto/register.dto';
import { ResendOtpDto } from '../dto/resend-otp.dto';
import { VerifyOtpDto } from '../dto/verify-otp.dto';
import { ForgotPasswordDto } from '../dto/forgot-password.dto';
import { ResetPasswordDto } from '../dto/reset-password.dto';
import { VerifyMfaDto } from '../dto/verify-mfa.dto';
import { OtpService } from './otp.service';
import { AuthUser } from '../types/auth-user.type';
import { AuthSecurityRepository } from '../repositories/auth-security.repository';
type LoginContext = {
    ipAddress?: string | null;
    userAgent?: string | null;
};
export declare class AuthService {
    private readonly usersService;
    private readonly jwtService;
    private readonly otpService;
    private readonly mailService;
    private readonly authSecurityRepository?;
    private readonly saltRounds;
    constructor(usersService: UsersService, jwtService: JwtService, otpService: OtpService, mailService: MailService, authSecurityRepository?: AuthSecurityRepository | undefined);
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
                    isSystemAdmin: boolean;
                    mfaEnabled: boolean;
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
    login(dto: LoginDto, context?: LoginContext): Promise<{
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
                    isSystemAdmin: boolean;
                    mfaEnabled: boolean;
                    createdAt: Date;
                    updatedAt: Date;
                };
                tokens: {
                    accessToken: string;
                };
            };
        };
        refreshToken: string;
    } | {
        mfaRequired: true;
        body: {
            success: boolean;
            message: string;
            data: {
                mfaRequired: boolean;
                email: string;
                otpExpiresInSeconds: number;
            };
        };
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
                    isSystemAdmin: boolean;
                    mfaEnabled: boolean;
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
    forgotPassword(dto: ForgotPasswordDto): Promise<{
        success: boolean;
        message: string;
        data: {
            email: string;
            otpExpiresInSeconds: number;
        };
    }>;
    resetPassword(dto: ResetPasswordDto): Promise<{
        success: boolean;
        message: string;
        data: null;
    }>;
    setMfa(authUser: AuthUser, enabled: boolean): Promise<{
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
            isSystemAdmin: boolean;
            mfaEnabled: boolean;
            createdAt: Date;
            updatedAt: Date;
        } | null;
    }>;
    verifyMfa(dto: VerifyMfaDto): Promise<{
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
                    isSystemAdmin: boolean;
                    mfaEnabled: boolean;
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
    private sendSecurityOtp;
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
            isSystemAdmin: boolean;
            mfaEnabled: boolean;
            createdAt: Date;
            updatedAt: Date;
        };
    }>;
    getSessions(authUser: AuthUser): Promise<{
        success: boolean;
        message: string;
        data: {
            items: {
                id: string;
                current: boolean;
                userAgent: string | null;
                ipAddress: string | null;
                lastUsedAt: Date;
                createdAt: Date;
                expiresAt: Date;
                revokedAt: Date | null;
            }[];
        };
    }>;
    revokeSession(authUser: AuthUser, sessionId: string): Promise<{
        success: boolean;
        message: string;
        data: null;
    }>;
    revokeOtherSessions(authUser: AuthUser): Promise<{
        success: boolean;
        message: string;
        data: null;
    }>;
    private issueTokens;
    private issueSessionTokens;
    private recordLoginAttempt;
    private storeRefreshTokenHash;
    private authResponse;
    private toPublicUser;
}
export {};
