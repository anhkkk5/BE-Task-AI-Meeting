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
import { MeetingStatus } from '../../../common/enums/meeting-status.enum';
import { MeetingType } from '../../../common/enums/meeting-type.enum';
import { Project } from '../../projects/entities/project.entity';
import { Sprint } from '../../sprints/entities/sprint.entity';
import { User } from '../../users/entities/user.entity';
import { Workspace } from '../../workspaces/entities/workspace.entity';
import { MeetingParticipant } from './meeting-participant.entity';

@Entity('meetings')
export class Meeting {
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

  @Column({ type: 'varchar', length: 200 })
  title: string;

  @Column({ type: 'varchar', length: 1000, nullable: true })
  description: string | null;

  @Index()
  @Column({
    name: 'meeting_type',
    type: 'enum',
    enum: MeetingType,
    default: MeetingType.General,
  })
  meetingType: MeetingType;

  @Index()
  @Column({ name: 'meeting_date', type: 'date' })
  meetingDate: string;

  @Column({ name: 'start_time', type: 'datetime', nullable: true })
  startTime: Date | null;

  @Column({ name: 'end_time', type: 'datetime', nullable: true })
  endTime: Date | null;

  @Index()
  @Column({
    type: 'enum',
    enum: MeetingStatus,
    default: MeetingStatus.Scheduled,
  })
  status: MeetingStatus;

  @Index()
  @Column({ name: 'created_by', type: 'varchar', length: 36 })
  createdBy: string;

  @Column({
    name: 'mongo_transcript_id',
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  mongoTranscriptId: string | null;

  @Column({
    name: 'mongo_summary_id',
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  mongoSummaryId: string | null;

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
  @JoinColumn({ name: 'created_by' })
  creator: User;

  @OneToMany(() => MeetingParticipant, (participant) => participant.meeting)
  participants: MeetingParticipant[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at', nullable: true })
  deletedAt: Date | null;
}
