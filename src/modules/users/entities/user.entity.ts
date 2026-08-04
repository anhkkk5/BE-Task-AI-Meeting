import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { UserStatus } from '../enums/user-status.enum';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index({ unique: true })
  @Column({ length: 255 })
  email: string;

  @Column({ name: 'full_name', length: 120 })
  fullName: string;

  @Column({ name: 'avatar_url', type: 'varchar', length: 500, nullable: true })
  avatarUrl: string | null;

  @Column({ name: 'phone_number', type: 'varchar', length: 30, nullable: true })
  phoneNumber: string | null;

  @Column({ name: 'job_title', type: 'varchar', length: 120, nullable: true })
  jobTitle: string | null;

  @Column({ name: 'password_hash', length: 255 })
  passwordHash: string;

  @Column({
    type: 'enum',
    enum: UserStatus,
    default: UserStatus.Active,
  })
  status: UserStatus;

  @Column({ name: 'is_system_admin', type: 'tinyint', width: 1, default: 0 })
  isSystemAdmin: boolean;

  /**
   * Thoi diem email duoc xac thuc bang OTP.
   *
   * null nghia la chua xac thuc. Tai khoan tao truoc khi co tinh nang OTP da
   * duoc migration danh dau la da xac thuc.
   */
  @Column({
    name: 'email_verified_at',
    type: 'datetime',
    precision: 6,
    nullable: true,
  })
  emailVerifiedAt: Date | null;

  @Column({
    name: 'refresh_token_hash',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  refreshTokenHash: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
