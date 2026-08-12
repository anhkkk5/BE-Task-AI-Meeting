export declare class AuthSession {
    id: string;
    userId: string;
    refreshTokenHash: string;
    userAgent: string | null;
    ipAddress: string | null;
    lastUsedAt: Date;
    expiresAt: Date;
    revokedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
}
