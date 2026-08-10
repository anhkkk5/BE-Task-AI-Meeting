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
import { Task } from './task.entity';

export enum TaskActivityAction {
  Created = 'CREATED',
  Updated = 'UPDATED',
  StatusChanged = 'STATUS_CHANGED',
  Assigned = 'ASSIGNED',
  SprintMoved = 'SPRINT_MOVED',
  Cancelled = 'CANCELLED',
  Deleted = 'DELETED',
  Commented = 'COMMENTED',
  CommentUpdated = 'COMMENT_UPDATED',
  CommentDeleted = 'COMMENT_DELETED',
}

@Entity('task_activity_logs')
@Index(['taskId', 'createdAt'])
export class TaskActivityLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'task_id', type: 'varchar', length: 36 })
  taskId: string;

  @Column({ name: 'project_id', type: 'varchar', length: 36 })
  projectId: string;

  @Column({ name: 'actor_id', type: 'varchar', length: 36 })
  actorId: string;

  @Column({ type: 'varchar', length: 40 })
  action: TaskActivityAction;

  @Column({ type: 'json', nullable: true })
  changes: Record<string, { from: unknown; to: unknown }> | null;

  @ManyToOne(() => Task, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'task_id' })
  task: Task;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'actor_id' })
  actor: User;

  @CreateDateColumn({ name: 'created_at', precision: 6 })
  createdAt: Date;
}
