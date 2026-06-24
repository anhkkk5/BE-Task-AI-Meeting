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
import { MeetingParticipantRole } from '../../../common/enums/meeting-participant-role.enum';
import { User } from '../../users/entities/user.entity';
import { Meeting } from './meeting.entity';

@Entity('meeting_participants')
@Index(['meetingId', 'userId'], { unique: true })
export class MeetingParticipant {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ name: 'meeting_id', type: 'varchar', length: 36 })
  meetingId: string;

  @Index()
  @Column({ name: 'user_id', type: 'varchar', length: 36 })
  userId: string;

  @Column({
    type: 'enum',
    enum: MeetingParticipantRole,
    default: MeetingParticipantRole.Participant,
  })
  role: MeetingParticipantRole;

  @Column({ default: false })
  attended: boolean;

  @ManyToOne(() => Meeting, (meeting) => meeting.participants, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'meeting_id' })
  meeting: Meeting;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
