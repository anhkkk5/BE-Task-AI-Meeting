import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsEnum,
  IsOptional,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { MeetingParticipantRole } from '../../../common/enums/meeting-participant-role.enum';

export class AddMeetingParticipantItemDto {
  @ApiProperty({
    example: '5f12e7a0-c3db-4d4a-b8e9-a6b1fdc87001',
    description: 'User UUID cua workspace member ACTIVE.',
  })
  @IsUUID()
  userId: string;

  @ApiPropertyOptional({
    enum: MeetingParticipantRole,
    example: MeetingParticipantRole.Participant,
  })
  @IsOptional()
  @IsEnum(MeetingParticipantRole)
  role?: MeetingParticipantRole;
}

export class AddMeetingParticipantsDto {
  @ApiProperty({
    type: [AddMeetingParticipantItemDto],
    description: 'Danh sach participant can them vao meeting.',
  })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => AddMeetingParticipantItemDto)
  participants: AddMeetingParticipantItemDto[];
}
