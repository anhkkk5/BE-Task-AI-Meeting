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
    refreshTokenHash: string | null;
    createdAt: Date;
    updatedAt: Date;
}
