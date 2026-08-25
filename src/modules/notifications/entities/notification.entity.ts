import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

export enum NotificationType {
  TaskAssigned = 'TASK_ASSIGNED',
  TaskMentioned = 'TASK_MENTIONED',
  TaskDueSoon = 'TASK_DUE_SOON',
  TaskOverdue = 'TASK_OVERDUE',
  TaskBlockerResolved = 'TASK_BLOCKER_RESOLVED',
  HandoverSubmitted = 'HANDOVER_SUBMITTED',
  HandoverAccepted = 'HANDOVER_ACCEPTED',
  HandoverRejected = 'HANDOVER_REJECTED',
  HandoverChangesRequested = 'HANDOVER_CHANGES_REQUESTED',
  MeetingInvited = 'MEETING_INVITED',
  MeetingUpdated = 'MEETING_UPDATED',
  MeetingCancelled = 'MEETING_CANCELLED',
  DailyUpdateDraftReady = 'DAILY_UPDATE_DRAFT_READY',
}

@Entity('notifications')
@Index(['recipientId', 'readAt', 'createdAt'])
export class Notification {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ name: 'recipient_id', type: 'varchar', length: 36 })
  recipientId: string;
  @Column({ type: 'varchar', length: 50 }) type: NotificationType;
  @Column({ type: 'varchar', length: 200 }) title: string;
  @Column({ type: 'varchar', length: 1000 }) body: string;
  @Column({ type: 'varchar', length: 500 }) link: string;
  @Column({ type: 'json', nullable: true }) metadata: Record<
    string,
    unknown
  > | null;
  @Column({
    name: 'idempotency_key',
    type: 'varchar',
    length: 200,
    nullable: true,
    unique: true,
  })
  idempotencyKey: string | null;
  @Column({ name: 'read_at', type: 'datetime', precision: 6, nullable: true })
  readAt: Date | null;
  @Column({
    name: 'archived_at',
    type: 'datetime',
    precision: 6,
    nullable: true,
  })
  archivedAt: Date | null;
  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'recipient_id' })
  recipient: User;
  @CreateDateColumn({ name: 'created_at', precision: 6 }) createdAt: Date;
}
