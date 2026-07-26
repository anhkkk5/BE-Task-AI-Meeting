import { Inject, Injectable, Logger } from '@nestjs/common';
import { randomInt } from 'crypto';
import Redis from 'ioredis';
import * as bcrypt from 'bcrypt';
import { REDIS_CLIENT } from '../../../database/redis/redis.constants';

/** Thong tin dang ky duoc giu tam trong Redis, chua ghi vao MySQL. */
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

export type VerifyOtpResult =
  | { status: 'OK'; registration: PendingRegistration }
  | { status: 'NOT_FOUND' }
  | { status: 'TOO_MANY_ATTEMPTS' }
  | { status: 'INVALID'; remainingAttempts: number };

export const OTP_TTL_SECONDS = 600;
export const OTP_RESEND_COOLDOWN_SECONDS = 60;
export const OTP_MAX_ATTEMPTS = 5;

const OTP_SALT_ROUNDS = 10;

/**
 * Quan ly OTP dang ky tren Redis.
 *
 * Cac quyet dinh bao mat:
 * - OTP sinh bang randomInt cua crypto, khong dung Math.random vi khong an toan.
 * - Chi luu hash cua OTP, de neu Redis bi doc trai phep thi khong lay duoc ma.
 * - Gioi han so lan nhap sai va co thoi gian cho giua 2 lan xin ma lai.
 * - Tai khoan chi duoc tao trong MySQL sau khi OTP dung, tranh rac du lieu va
 *   tranh viec email chua xac thuc chiem cho email that cua nguoi khac.
 */
@Injectable()
export class OtpService {
  private readonly logger = new Logger(OtpService.name);

  constructor(@Inject(REDIS_CLIENT) private readonly redis: Redis) {}

  generateOtp() {
    return String(randomInt(0, 1_000_000)).padStart(6, '0');
  }

  /**
   * Luu thong tin dang ky kem OTP da hash.
   * Ghi de ban ghi cu neu nguoi dung dang ky lai cung email.
   */
  async savePendingRegistration(
    registration: PendingRegistration,
    otp: string,
  ): Promise<void> {
    const otpHash = await bcrypt.hash(otp, OTP_SALT_ROUNDS);
    const payload: StoredRegistration = {
      ...registration,
      otpHash,
      attempts: 0,
      createdAt: Date.now(),
    };

    await this.redis.set(
      this.registrationKey(registration.email),
      JSON.stringify(payload),
      'EX',
      OTP_TTL_SECONDS,
    );
    await this.redis.set(
      this.cooldownKey(registration.email),
      '1',
      'EX',
      OTP_RESEND_COOLDOWN_SECONDS,
    );
  }

  async getPendingRegistration(email: string) {
    const raw = await this.redis.get(this.registrationKey(email));

    if (!raw) {
      return null;
    }

    try {
      return JSON.parse(raw) as StoredRegistration;
    } catch {
      // Du lieu loi dinh dang thi coi nhu khong ton tai, buoc dang ky lai.
      await this.redis.del(this.registrationKey(email));
      return null;
    }
  }

  /** Tra ve so giay con phai cho truoc khi duoc xin ma moi, 0 la duoc gui ngay. */
  async getResendCooldownSeconds(email: string) {
    const ttl = await this.redis.ttl(this.cooldownKey(email));

    return ttl > 0 ? ttl : 0;
  }

  async verifyOtp(email: string, otp: string): Promise<VerifyOtpResult> {
    const stored = await this.getPendingRegistration(email);

    if (!stored) {
      return { status: 'NOT_FOUND' };
    }

    if (stored.attempts >= OTP_MAX_ATTEMPTS) {
      await this.clearPendingRegistration(email);
      return { status: 'TOO_MANY_ATTEMPTS' };
    }

    const isValid = await bcrypt.compare(otp, stored.otpHash);

    if (isValid) {
      return {
        status: 'OK',
        registration: {
          email: stored.email,
          fullName: stored.fullName,
          passwordHash: stored.passwordHash,
        },
      };
    }

    const attempts = stored.attempts + 1;

    if (attempts >= OTP_MAX_ATTEMPTS) {
      await this.clearPendingRegistration(email);
      return { status: 'TOO_MANY_ATTEMPTS' };
    }

    // Giu nguyen TTL con lai de nhap sai khong keo dai thoi gian song cua OTP.
    const remainingTtl = await this.redis.ttl(this.registrationKey(email));
    await this.redis.set(
      this.registrationKey(email),
      JSON.stringify({ ...stored, attempts }),
      'EX',
      remainingTtl > 0 ? remainingTtl : OTP_TTL_SECONDS,
    );

    return {
      status: 'INVALID',
      remainingAttempts: OTP_MAX_ATTEMPTS - attempts,
    };
  }

  /** Cap OTP moi cho ban ghi dang cho, reset so lan nhap sai. */
  async refreshOtp(email: string, otp: string) {
    const stored = await this.getPendingRegistration(email);

    if (!stored) {
      return false;
    }

    await this.savePendingRegistration(
      {
        email: stored.email,
        fullName: stored.fullName,
        passwordHash: stored.passwordHash,
      },
      otp,
    );

    return true;
  }

  async clearPendingRegistration(email: string) {
    await this.redis.del(this.registrationKey(email));
  }

  private registrationKey(email: string) {
    return `auth:register:otp:${email.toLowerCase()}`;
  }

  private cooldownKey(email: string) {
    return `auth:register:otp-cooldown:${email.toLowerCase()}`;
  }
}
