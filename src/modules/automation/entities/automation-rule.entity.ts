import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
@Entity('automation_rules')
export class AutomationRule {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Index()
  @Column({ name: 'workspace_id', type: 'char', length: 36 })
  workspaceId: string;
  @Index()
  @Column({ name: 'project_id', type: 'char', length: 36 })
  projectId: string;
  @Column({ length: 160 }) name: string;
  @Column({ type: 'tinyint', width: 1, default: 0 }) enabled: boolean;
  @Column({ type: 'json' }) trigger: { type: 'DUE_DATE'; daysBefore?: number };
  @Column({ type: 'json' }) conditions: Array<{
    field: string;
    operator: string;
    value?: unknown;
  }>;
  @Column({ type: 'json' }) actions: Array<{
    type: 'NOTIFY_ASSIGNEE' | 'CHANGE_STATUS' | 'ASSIGN_USER';
    value?: string;
    message?: string;
  }>;
  @Column({ name: 'dry_run_at', type: 'datetime', nullable: true })
  dryRunAt: Date | null;
  @Column({ name: 'created_by', type: 'char', length: 36 }) createdBy: string;
  @CreateDateColumn({ name: 'created_at' }) createdAt: Date;
  @UpdateDateColumn({ name: 'updated_at' }) updatedAt: Date;
}
