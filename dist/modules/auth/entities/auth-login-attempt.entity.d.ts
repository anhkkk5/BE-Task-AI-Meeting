export declare class AuthLoginAttempt {
    id: string;
    userId: string | null;
    email: string;
    success: boolean;
    reason: string;
    ipAddress: string | null;
    userAgent: string | null;
    createdAt: Date;
}
