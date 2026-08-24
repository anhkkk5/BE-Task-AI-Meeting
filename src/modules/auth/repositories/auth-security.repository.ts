import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { AuthSession } from '../entities/auth-session.entity';
import { AuthLoginAttempt } from '../entities/auth-login-attempt.entity';
@Injectable()
export class AuthSecurityRepository {
  constructor(
    @InjectRepository(AuthSession)
    private readonly sessions: Repository<AuthSession>,
    @InjectRepository(AuthLoginAttempt)
    private readonly attempts: Repository<AuthLoginAttempt>,
  ) {}
  createSession(data: Partial<AuthSession>) {
    return this.sessions.save(this.sessions.create(data));
  }
  findSession(id: string, userId: string) {
    return this.sessions.findOne({
      where: { id, userId, revokedAt: IsNull() },
    });
  }
  listSessions(userId: string) {
    return this.sessions.find({
      where: { userId },
      order: { lastUsedAt: 'DESC' },
    });
  }
  updateSession(id: string, data: Partial<AuthSession>) {
    return this.sessions.update(id, data);
  }
  revokeSession(id: string, userId: string) {
    return this.sessions.update(
      { id, userId, revokedAt: IsNull() },
      { revokedAt: new Date(), refreshTokenHash: '' },
    );
  }
  revokeOtherSessions(userId: string, currentId?: string) {
    return this.sessions
      .createQueryBuilder()
      .update()
      .set({ revokedAt: new Date(), refreshTokenHash: '' })
      .where('user_id = :userId AND revoked_at IS NULL', { userId })
      .andWhere(currentId ? 'id <> :currentId' : '1=1', { currentId })
      .execute();
  }
  recordAttempt(data: Partial<AuthLoginAttempt>) {
    return this.attempts.save(this.attempts.create(data));
  }
}
