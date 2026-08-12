import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
@Entity('auth_sessions')
export class AuthSession {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Index() @Column({ name: 'user_id', type: 'char', length: 36 }) userId: string;
  @Column({ name: 'refresh_token_hash', length: 255 }) refreshTokenHash: string;
  @Column({ name: 'user_agent', type: 'varchar', length: 500, nullable: true }) userAgent: string | null;
  @Column({ name: 'ip_address', type: 'varchar', length: 64, nullable: true }) ipAddress: string | null;
  @Column({ name: 'last_used_at', type: 'datetime', precision: 6 }) lastUsedAt: Date;
  @Column({ name: 'expires_at', type: 'datetime', precision: 6 }) expiresAt: Date;
  @Column({ name: 'revoked_at', type: 'datetime', precision: 6, nullable: true }) revokedAt: Date | null;
  @CreateDateColumn({ name: 'created_at' }) createdAt: Date;
  @UpdateDateColumn({ name: 'updated_at' }) updatedAt: Date;
}
