import { EntityManager, Repository } from 'typeorm';
import { MeetingParticipantRole } from '../../../common/enums/meeting-participant-role.enum';
import { MeetingParticipant } from '../entities/meeting-participant.entity';
export declare class MeetingParticipantsRepository {
    private readonly repository;
    constructor(repository: Repository<MeetingParticipant>);
    createMany(data: {
        attended?: boolean;
        meetingId: string;
        role: MeetingParticipantRole;
        userId: string;
    }[], manager?: EntityManager): Promise<MeetingParticipant[]>;
    findByMeeting(meetingId: string): Promise<MeetingParticipant[]>;
    findByIdAndMeeting(participantId: string, meetingId: string): Promise<MeetingParticipant | null>;
    findByMeetingAndUser(meetingId: string, userId: string): Promise<MeetingParticipant | null>;
    findByMeetingAndUsers(meetingId: string, userIds: string[]): Promise<MeetingParticipant[]>;
    update(participant: MeetingParticipant, data: Partial<MeetingParticipant>): Promise<MeetingParticipant>;
    private getRepository;
}
