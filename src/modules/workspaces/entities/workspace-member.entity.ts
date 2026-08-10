import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { WorkspaceMemberStatus } from '../../../common/enums/workspace-member-status.enum';
import { WorkspaceRole } from '../../../common/enums/workspace-role.enum';
import { User } from '../../users/entities/user.entity';
import { Workspace } from './workspace.entity';

@Entity('workspace_members')
@Index(['workspaceId', 'userId'], { unique: true })
export class WorkspaceMember {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ name: 'workspace_id', type: 'varchar', length: 36 })
  workspaceId: string;

  @Index()
  @Column({ name: 'user_id', type: 'varchar', length: 36 })
  userId: string;

  @Column({
    type: 'enum',
    enum: WorkspaceRole,
  })
  role: WorkspaceRole;

  @Column({
    type: 'enum',
    enum: WorkspaceMemberStatus,
    default: WorkspaceMemberStatus.Active,
  })
  status: WorkspaceMemberStatus;

  @Column({ name: 'joined_at', type: 'datetime', nullable: true })
  joinedAt: Date | null;

  @Column({ name: 'daily_capacity_hours', type: 'float', default: 8 })
  dailyCapacityHours: number;

  @Column({ name: 'unavailable_dates', type: 'json', nullable: true })
  unavailableDates: string[] | null;

  @ManyToOne(() => Workspace, (workspace) => workspace.members, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'workspace_id' })
  workspace: Workspace;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
