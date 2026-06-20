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
import { SprintStatus } from '../../../common/enums/sprint-status.enum';
import { Project } from '../../projects/entities/project.entity';
import { User } from '../../users/entities/user.entity';

@Entity('sprints')
export class Sprint {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ name: 'project_id', type: 'varchar', length: 36 })
  projectId: string;

  @Column({ length: 150 })
  name: string;

  @Column({ type: 'varchar', length: 1000, nullable: true })
  goal: string | null;

  @Index()
  @Column({
    type: 'enum',
    enum: SprintStatus,
    default: SprintStatus.Planned,
  })
  status: SprintStatus;

  @Column({ name: 'start_date', type: 'date' })
  startDate: string;

  @Column({ name: 'end_date', type: 'date' })
  endDate: string;

  @Column({ name: 'started_at', type: 'datetime', nullable: true })
  startedAt: Date | null;

  @Column({ name: 'completed_at', type: 'datetime', nullable: true })
  completedAt: Date | null;

  @Index()
  @Column({ name: 'created_by', type: 'varchar', length: 36 })
  createdBy: string;

  @ManyToOne(() => Project, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'project_id' })
  project: Project;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'created_by' })
  creator: User;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at', nullable: true })
  deletedAt: Date | null;
}
