import { UserStatus } from '../enums/user-status.enum';
export declare class User {
    id: string;
    email: string;
    fullName: string;
    avatarUrl: string | null;
    phoneNumber: string | null;
    jobTitle: string | null;
    passwordHash: string;
    status: UserStatus;
    isSystemAdmin: boolean;
    emailVerifiedAt: Date | null;
    refreshTokenHash: string | null;
    mfaEnabled: boolean;
    createdAt: Date;
    updatedAt: Date;
}
