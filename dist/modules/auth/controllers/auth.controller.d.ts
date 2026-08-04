import type { Request, Response } from 'express';
import { LoginDto } from '../dto/login.dto';
import { RegisterDto } from '../dto/register.dto';
import { ResendOtpDto } from '../dto/resend-otp.dto';
import { VerifyOtpDto } from '../dto/verify-otp.dto';
import { AuthService } from '../services/auth.service';
import type { AuthUser } from '../types/auth-user.type';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    register(dto: RegisterDto): Promise<{
        success: boolean;
        message: string;
        data: {
            email: string;
            otpExpiresInSeconds: number;
            resendAfterSeconds: number;
        };
    }>;
    verifyOtp(dto: VerifyOtpDto, response: Response): Promise<{
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
                status: import("../../users/enums/user-status.enum").UserStatus;
                isSystemAdmin: boolean;
                createdAt: Date;
                updatedAt: Date;
            };
            tokens: {
                accessToken: string;
            };
        };
    }>;
    resendOtp(dto: ResendOtpDto): Promise<{
        success: boolean;
        message: string;
        data: {
            email: string;
            otpExpiresInSeconds: number;
            resendAfterSeconds: number;
        };
    }>;
    login(dto: LoginDto, response: Response): Promise<{
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
                status: import("../../users/enums/user-status.enum").UserStatus;
                isSystemAdmin: boolean;
                createdAt: Date;
                updatedAt: Date;
            };
            tokens: {
                accessToken: string;
            };
        };
    }>;
    refresh(user: AuthUser, request: Request, response: Response): Promise<{
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
                status: import("../../users/enums/user-status.enum").UserStatus;
                isSystemAdmin: boolean;
                createdAt: Date;
                updatedAt: Date;
            };
            tokens: {
                accessToken: string;
            };
        };
    }>;
    logout(user: AuthUser, response: Response): Promise<{
        success: boolean;
        message: string;
        data: null;
    }>;
    me(user: AuthUser): Promise<{
        success: boolean;
        message: string;
        data: {
            id: string;
            email: string;
            fullName: string;
            avatarUrl: string | null;
            phoneNumber: string | null;
            jobTitle: string | null;
            status: import("../../users/enums/user-status.enum").UserStatus;
            isSystemAdmin: boolean;
            createdAt: Date;
            updatedAt: Date;
        };
    }>;
    private setRefreshTokenCookie;
    private clearRefreshTokenCookie;
    private getRefreshTokenFromCookie;
    private getRefreshTokenCookieOptions;
    private getRefreshTokenCookieBaseOptions;
    private getRefreshTokenCookieMaxAge;
}
