import { Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { TaskDependencyType } from '../../../common/enums/task-dependency-type.enum';
import { User } from '../../users/entities/user.entity';
import { Task } from './task.entity';

@Entity('task_dependencies')
@Index(['sourceTaskId', 'targetTaskId', 'type'], { unique: true })
export class TaskDependency {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ name: 'source_task_id', type: 'varchar', length: 36 }) sourceTaskId: string;
  @Column({ name: 'target_task_id', type: 'varchar', length: 36 }) targetTaskId: string;
  @Column({ type: 'enum', enum: TaskDependencyType }) type: TaskDependencyType;
  @Column({ name: 'created_by', type: 'varchar', length: 36 }) createdBy: string;
  @ManyToOne(() => Task, { onDelete: 'CASCADE' }) @JoinColumn({ name: 'source_task_id' }) sourceTask: Task;
  @ManyToOne(() => Task, { onDelete: 'CASCADE' }) @JoinColumn({ name: 'target_task_id' }) targetTask: Task;
  @ManyToOne(() => User, { onDelete: 'CASCADE' }) @JoinColumn({ name: 'created_by' }) creator: User;
  @CreateDateColumn({ name: 'created_at', precision: 6 }) createdAt: Date;
}
