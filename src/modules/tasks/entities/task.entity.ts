import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { TaskStatus } from '../../../common/enums/task-status.enum';
import { TaskType } from '../../../common/enums/task-type.enum';
import { TaskPriority } from '../../../common/enums/task-priority.enum';
import { Project } from '../../projects/entities/project.entity';
import { Sprint } from '../../sprints/entities/sprint.entity';
import { User } from '../../users/entities/user.entity';

@Entity('tasks')
@Index(['projectId', 'taskCode'], { unique: true })
export class Task {
  isBlocked?: boolean;
  isBlocking?: boolean;
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ name: 'project_id', type: 'varchar', length: 36 })
  projectId: string;

  @Index()
  @Column({ name: 'sprint_id', type: 'varchar', length: 36, nullable: true })
  sprintId: string | null;

  @Column({ name: 'task_code', type: 'varchar', length: 40 })
  taskCode: string;

  @Column({ type: 'varchar', length: 200 })
  title: string;

  @Column({ type: 'varchar', length: 2000, nullable: true })
  description: string | null;

  @Column({ type: 'json', nullable: true })
  labels: string[] | null;

  @Column({ name: 'acceptance_criteria', type: 'text', nullable: true })
  acceptanceCriteria: string | null;

  @Index()
  @Column({
    type: 'enum',
    enum: TaskStatus,
    default: TaskStatus.Backlog,
  })
  status: TaskStatus;

  @Index()
  @Column({ name: 'task_type', type: 'enum', enum: TaskType, default: TaskType.Task })
  taskType: TaskType;

  @Index()
  @Column({ type: 'enum', enum: TaskPriority, default: TaskPriority.Medium })
  priority: TaskPriority;

  @Index()
  @Column({ name: 'parent_id', type: 'varchar', length: 36, nullable: true })
  parentId: string | null;

  @Index()
  @Column({ name: 'assignee_id', type: 'varchar', length: 36, nullable: true })
  assigneeId: string | null;

  @Index()
  @Column({ name: 'reporter_id', type: 'varchar', length: 36, nullable: true })
  reporterId: string | null;

  @Index()
  @Column({ name: 'created_by', type: 'varchar', length: 36 })
  createdBy: string;

  @Column({ name: 'due_date', type: 'date', nullable: true })
  dueDate: string | null;

  @Column({ name: 'estimated_hours', type: 'float', nullable: true })
  estimatedHours: number | null;

  @Column({ name: 'story_points', type: 'int', nullable: true })
  storyPoints: number | null;

  @Column({ name: 'completed_at', type: 'datetime', nullable: true })
  completedAt: Date | null;

  @Column({ name: 'started_at', type: 'datetime', nullable: true })
  startedAt: Date | null;

  @ManyToOne(() => Project, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'project_id' })
  project: Project;

  @ManyToOne(() => Sprint, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'sprint_id' })
  sprint: Sprint | null;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'assignee_id' })
  assignee: User | null;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'reporter_id' })
  reporter: User | null;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'created_by' })
  creator: User;

  @ManyToOne(() => Task, (task) => task.children, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'parent_id' })
  parent: Task | null;

  @OneToMany(() => Task, (task) => task.parent)
  children: Task[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at', nullable: true })
  deletedAt: Date | null;
}
