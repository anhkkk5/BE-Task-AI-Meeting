import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';
@Entity('automation_runs')
export class AutomationRun {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Index()
  @Column({ name: 'rule_id', type: 'char', length: 36 })
  ruleId: string;
  @Column({ name: 'task_id', type: 'char', length: 36, nullable: true })
  taskId: string | null;
  @Index({ unique: true })
  @Column({ name: 'execution_key', length: 220 })
  executionKey: string;
  @Column({ length: 20 }) status: 'SUCCESS' | 'FAILED' | 'DRY_RUN' | 'SKIPPED';
  @Column({ type: 'json', nullable: true }) result: Record<
    string,
    unknown
  > | null;
  @Column({ type: 'text', nullable: true }) error: string | null;
  @Column({ name: 'retry_count', type: 'int', default: 0 }) retryCount: number;
  @CreateDateColumn({ name: 'created_at' }) createdAt: Date;
}
