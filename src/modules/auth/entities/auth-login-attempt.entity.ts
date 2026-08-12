import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';
@Entity('auth_login_attempts')
export class AuthLoginAttempt {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Index() @Column({ name: 'user_id', type: 'char', length: 36, nullable: true }) userId: string | null;
  @Index() @Column({ length: 255 }) email: string;
  @Column({ type: 'tinyint', width: 1 }) success: boolean;
  @Column({ length: 60 }) reason: string;
  @Column({ name: 'ip_address', type: 'varchar', length: 64, nullable: true }) ipAddress: string | null;
  @Column({ name: 'user_agent', type: 'varchar', length: 500, nullable: true }) userAgent: string | null;
  @CreateDateColumn({ name: 'created_at' }) createdAt: Date;
}
