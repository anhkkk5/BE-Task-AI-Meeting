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
import { User } from '../../users/entities/user.entity';
import { Task } from './task.entity';

@Entity('task_comments')
@Index(['taskId', 'createdAt'])
export class TaskComment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'task_id', type: 'varchar', length: 36 })
  taskId: string;

  @Column({ name: 'author_id', type: 'varchar', length: 36 })
  authorId: string;

  @Column({ type: 'text' })
  content: string;

  @Column({ name: 'mentioned_user_ids', type: 'json', nullable: true })
  mentionedUserIds: string[] | null;

  @ManyToOne(() => Task, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'task_id' })
  task: Task;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'author_id' })
  author: User;

  @CreateDateColumn({ name: 'created_at', precision: 6 })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', precision: 6 })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at', nullable: true })
  deletedAt: Date | null;
}
