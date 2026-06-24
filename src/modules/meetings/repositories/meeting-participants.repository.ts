import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, In, Repository } from 'typeorm';
import { MeetingParticipantRole } from '../../../common/enums/meeting-participant-role.enum';
import { MeetingParticipant } from '../entities/meeting-participant.entity';

@Injectable()
export class MeetingParticipantsRepository {
  constructor(
    @InjectRepository(MeetingParticipant)
    private readonly repository: Repository<MeetingParticipant>,
  ) {}

  async createMany(
    data: {
      attended?: boolean;
      meetingId: string;
      role: MeetingParticipantRole;
      userId: string;
    }[],
    manager?: EntityManager,
  ) {
    const repository = this.getRepository(manager);
    const participants = data.map((item) =>
      repository.create({
        attended: item.attended ?? false,
        meetingId: item.meetingId,
        role: item.role,
        userId: item.userId,
      }),
    );

    return repository.save(participants);
  }

  findByMeeting(meetingId: string) {
    return this.repository.find({
      where: {
        meetingId,
      },
      relations: {
        user: true,
      },
      order: {
        createdAt: 'ASC',
      },
    });
  }

  findByIdAndMeeting(participantId: string, meetingId: string) {
    return this.repository.findOne({
      where: {
        id: participantId,
        meetingId,
      },
      relations: {
        user: true,
      },
    });
  }

  findByMeetingAndUser(meetingId: string, userId: string) {
    return this.repository.findOne({
      where: {
        meetingId,
        userId,
      },
      relations: {
        user: true,
      },
    });
  }

  findByMeetingAndUsers(meetingId: string, userIds: string[]) {
    return this.repository.find({
      where: {
        meetingId,
        userId: In(userIds),
      },
    });
  }

  async update(
    participant: MeetingParticipant,
    data: Partial<MeetingParticipant>,
  ) {
    Object.assign(participant, data);
    return this.repository.save(participant);
  }

  private getRepository(manager?: EntityManager) {
    return manager
      ? manager.getRepository(MeetingParticipant)
      : this.repository;
  }
}
