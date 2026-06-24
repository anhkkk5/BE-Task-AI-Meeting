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
import { DailyMood } from '../../../common/enums/daily-mood.enum';
import { Project } from '../../projects/entities/project.entity';
import { Sprint } from '../../sprints/entities/sprint.entity';
import { User } from '../../users/entities/user.entity';
import { Workspace } from '../../workspaces/entities/workspace.entity';

@Entity('daily_updates')
@Index(['workspaceId', 'projectId', 'userId', 'updateDate'], { unique: true })
export class DailyUpdate {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ name: 'workspace_id', type: 'varchar', length: 36 })
  workspaceId: string;

  @Index()
  @Column({ name: 'project_id', type: 'varchar', length: 36 })
  projectId: string;

  @Index()
  @Column({ name: 'sprint_id', type: 'varchar', length: 36, nullable: true })
  sprintId: string | null;

  @Index()
  @Column({ name: 'user_id', type: 'varchar', length: 36 })
  userId: string;

  @Index()
  @Column({ name: 'update_date', type: 'date' })
  updateDate: string;

  @Column({ name: 'yesterday_work', type: 'text' })
  yesterdayWork: string;

  @Column({ name: 'today_plan', type: 'text' })
  todayPlan: string;

  @Column({ type: 'text', nullable: true })
  blockers: string | null;

  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @Index()
  @Column({
    type: 'enum',
    enum: DailyMood,
    nullable: true,
  })
  mood: DailyMood | null;

  @ManyToOne(() => Workspace, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'workspace_id' })
  workspace: Workspace;

  @ManyToOne(() => Project, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'project_id' })
  project: Project;

  @ManyToOne(() => Sprint, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'sprint_id' })
  sprint: Sprint | null;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at', nullable: true })
  deletedAt: Date | null;
}
