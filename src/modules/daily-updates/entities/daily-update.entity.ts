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
import { DailyUpdateSubmissionStatus } from '../../../common/enums/daily-update-submission-status.enum';
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

  /**
   * Nguoi ma thanh vien can ho tro trong ngay (noi dung thu 4 cua bao cao
   * giao ban). Nullable vi khong phai ngay nao cung can ho tro.
   */
  @Index()
  @Column({
    name: 'need_help_from_id',
    type: 'varchar',
    length: 36,
    nullable: true,
  })
  needHelpFromId: string | null;

  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @Index()
  @Column({
    name: 'submission_status',
    type: 'enum',
    enum: DailyUpdateSubmissionStatus,
    default: DailyUpdateSubmissionStatus.Submitted,
  })
  submissionStatus: DailyUpdateSubmissionStatus;

  @Column({ name: 'generated_by_ai', type: 'boolean', default: false })
  generatedByAi: boolean;

  @Column({ name: 'submitted_at', type: 'datetime', nullable: true })
  submittedAt: Date | null;

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

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'need_help_from_id' })
  needHelpFrom: User | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at', nullable: true })
  deletedAt: Date | null;
}
