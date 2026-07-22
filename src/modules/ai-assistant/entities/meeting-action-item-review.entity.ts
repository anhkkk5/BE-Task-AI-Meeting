import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { MeetingActionItemReviewStatus } from '../../../common/enums/meeting-action-item-review-status.enum';

@Entity('meeting_action_item_reviews')
@Index(['summaryId', 'actionItemIndex'], { unique: true })
export class MeetingActionItemReview {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ name: 'workspace_id', type: 'varchar', length: 36 })
  workspaceId: string;

  @Index()
  @Column({ name: 'project_id', type: 'varchar', length: 36 })
  projectId: string;

  @Index()
  @Column({ name: 'meeting_id', type: 'varchar', length: 36 })
  meetingId: string;

  @Column({ name: 'summary_id', type: 'varchar', length: 36 })
  summaryId: string;

  @Column({ name: 'action_item_index', type: 'int' })
  actionItemIndex: number;

  @Column({ name: 'action_item_text', type: 'text' })
  actionItemText: string;

  @Column({
    name: 'suggested_assignee_name',
    type: 'varchar',
    length: 200,
    nullable: true,
  })
  suggestedAssigneeName: string | null;

  @Column({ name: 'suggested_due_date', type: 'date', nullable: true })
  suggestedDueDate: string | null;

  @Column({
    type: 'enum',
    enum: MeetingActionItemReviewStatus,
    default: MeetingActionItemReviewStatus.Pending,
  })
  status: MeetingActionItemReviewStatus;

  @Column({ name: 'reviewed_by', type: 'varchar', length: 36, nullable: true })
  reviewedBy: string | null;

  @Column({ name: 'reviewed_at', type: 'datetime', nullable: true })
  reviewedAt: Date | null;

  @Column({
    name: 'created_task_id',
    type: 'varchar',
    length: 36,
    nullable: true,
  })
  createdTaskId: string | null;

  @Column({
    name: 'rejection_reason',
    type: 'varchar',
    length: 500,
    nullable: true,
  })
  rejectionReason: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
