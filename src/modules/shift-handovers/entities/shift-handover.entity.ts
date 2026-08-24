import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { HandoverStatus } from '../../../common/enums/handover-status.enum';
import { Project } from '../../projects/entities/project.entity';
import { Task } from '../../tasks/entities/task.entity';
import { User } from '../../users/entities/user.entity';
import { Workspace } from '../../workspaces/entities/workspace.entity';

@Entity('shift_handovers')
export class ShiftHandover {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ name: 'workspace_id', type: 'varchar', length: 36 })
  workspaceId: string;

  @Index()
  @Column({ name: 'project_id', type: 'varchar', length: 36 })
  projectId: string;

  @Index()
  @Column({ name: 'task_id', type: 'varchar', length: 36, nullable: true })
  taskId: string | null;

  @Index()
  @Column({ name: 'sender_id', type: 'varchar', length: 36 })
  senderId: string;

  @Index()
  @Column({ name: 'receiver_id', type: 'varchar', length: 36 })
  receiverId: string;

  @Column({ type: 'varchar', length: 200 })
  title: string;

  @Column({ type: 'text', nullable: true })
  summary: string | null;

  @Column({ name: 'completed_work', type: 'text', nullable: true })
  completedWork: string | null;

  @Column({ name: 'remaining_work', type: 'text', nullable: true })
  remainingWork: string | null;

  @Column({ type: 'text', nullable: true })
  blockers: string | null;

  @Column({ name: 'next_steps', type: 'text', nullable: true })
  nextSteps: string | null;

  @Column({ name: 'reference_links', type: 'text', nullable: true })
  referenceLinks: string | null;

  @Column({ name: 'due_at', type: 'datetime', nullable: true })
  dueAt: Date | null;

  @Index()
  @Column({ type: 'enum', enum: HandoverStatus, default: HandoverStatus.Draft })
  status: HandoverStatus;

  @Column({
    name: 'change_request',
    type: 'varchar',
    length: 1000,
    nullable: true,
  })
  changeRequest: string | null;

  @Column({
    name: 'rejection_reason',
    type: 'varchar',
    length: 1000,
    nullable: true,
  })
  rejectionReason: string | null;

  @Column({ name: 'submitted_at', type: 'datetime', nullable: true })
  submittedAt: Date | null;

  @Column({ name: 'acknowledged_at', type: 'datetime', nullable: true })
  acknowledgedAt: Date | null;

  @Column({ name: 'rejected_at', type: 'datetime', nullable: true })
  rejectedAt: Date | null;

  @ManyToOne(() => Workspace, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'workspace_id' })
  workspace: Workspace;

  @ManyToOne(() => Project, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'project_id' })
  project: Project;

  @ManyToOne(() => Task, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'task_id' })
  task: Task | null;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'sender_id' })
  sender: User;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'receiver_id' })
  receiver: User;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at', nullable: true })
  deletedAt: Date | null;
}
