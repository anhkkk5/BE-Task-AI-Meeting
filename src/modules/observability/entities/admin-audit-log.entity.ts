import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity('admin_audit_logs')
export class AdminAuditLog {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Index() @Column({ name: 'actor_id', type: 'char', length: 36 }) actorId: string;
  @Index() @Column({ length: 60 }) action: string;
  @Column({ name: 'target_type', length: 40 }) targetType: string;
  @Index() @Column({ name: 'target_id', type: 'char', length: 36 }) targetId: string;
  @Column({ type: 'json', nullable: true }) before: Record<string, unknown> | null;
  @Column({ type: 'json', nullable: true }) after: Record<string, unknown> | null;
  @Column({ type: 'json', nullable: true }) metadata: Record<string, unknown> | null;
  @CreateDateColumn({ name: 'created_at' }) createdAt: Date;
}
