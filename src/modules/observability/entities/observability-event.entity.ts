import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

export type ObservabilityKind = 'API' | 'SCHEDULER' | 'EMAIL' | 'MONGODB' | 'AI';
@Entity('observability_events')
export class ObservabilityEvent {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Index() @Column({ length: 20 }) kind: ObservabilityKind;
  @Index() @Column({ length: 30 }) status: 'SUCCESS' | 'FAILED' | 'SLOW' | 'WARNING';
  @Index() @Column({ length: 160 }) operation: string;
  @Column({ name: 'duration_ms', type: 'int', nullable: true }) durationMs: number | null;
  @Column({ name: 'input_tokens', type: 'int', nullable: true }) inputTokens: number | null;
  @Column({ name: 'output_tokens', type: 'int', nullable: true }) outputTokens: number | null;
  @Column({ name: 'estimated_cost_usd', type: 'decimal', precision: 12, scale: 6, nullable: true }) estimatedCostUsd: number | null;
  @Column({ type: 'text', nullable: true }) error: string | null;
  @Column({ type: 'json', nullable: true }) metadata: Record<string, unknown> | null;
  @CreateDateColumn({ name: 'created_at' }) createdAt: Date;
}
