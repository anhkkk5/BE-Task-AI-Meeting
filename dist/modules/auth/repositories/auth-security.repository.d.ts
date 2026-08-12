import { Repository } from 'typeorm';
import { AuthSession } from '../entities/auth-session.entity';
import { AuthLoginAttempt } from '../entities/auth-login-attempt.entity';
export declare class AuthSecurityRepository {
    private readonly sessions;
    private readonly attempts;
    constructor(sessions: Repository<AuthSession>, attempts: Repository<AuthLoginAttempt>);
    createSession(data: Partial<AuthSession>): Promise<AuthSession>;
    findSession(id: string, userId: string): Promise<AuthSession | null>;
    listSessions(userId: string): Promise<AuthSession[]>;
    updateSession(id: string, data: Partial<AuthSession>): Promise<import("typeorm").UpdateResult>;
    revokeSession(id: string, userId: string): Promise<import("typeorm").UpdateResult>;
    revokeOtherSessions(userId: string, currentId?: string): Promise<import("typeorm").UpdateResult>;
    recordAttempt(data: Partial<AuthLoginAttempt>): Promise<AuthLoginAttempt>;
}
