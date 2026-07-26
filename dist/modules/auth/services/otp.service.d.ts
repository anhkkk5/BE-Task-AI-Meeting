import Redis from 'ioredis';
export type PendingRegistration = {
    email: string;
    fullName: string;
    passwordHash: string;
};
type StoredRegistration = PendingRegistration & {
    otpHash: string;
    attempts: number;
    createdAt: number;
};
export type VerifyOtpResult = {
    status: 'OK';
    registration: PendingRegistration;
} | {
    status: 'NOT_FOUND';
} | {
    status: 'TOO_MANY_ATTEMPTS';
} | {
    status: 'INVALID';
    remainingAttempts: number;
};
export declare const OTP_TTL_SECONDS = 600;
export declare const OTP_RESEND_COOLDOWN_SECONDS = 60;
export declare const OTP_MAX_ATTEMPTS = 5;
export declare class OtpService {
    private readonly redis;
    private readonly logger;
    constructor(redis: Redis);
    generateOtp(): string;
    savePendingRegistration(registration: PendingRegistration, otp: string): Promise<void>;
    getPendingRegistration(email: string): Promise<StoredRegistration | null>;
    getResendCooldownSeconds(email: string): Promise<number>;
    verifyOtp(email: string, otp: string): Promise<VerifyOtpResult>;
    refreshOtp(email: string, otp: string): Promise<boolean>;
    clearPendingRegistration(email: string): Promise<void>;
    private registrationKey;
    private cooldownKey;
}
export {};
