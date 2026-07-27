import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
} from 'class-validator';
import { TeamReportActionItemSource } from '../../../common/enums/team-report-action-item-status.enum';

/**
 * De nghi nguoi dang giu task ban giao lai cong viec.
 *
 * Xac dinh muc bang `source` + `itemIndex` giong DTO tao task de noi dung luon
 * doc lai tu bao cao, khong nhan tu client.
 */
export class RequestTeamReportHandoverDto {
  @ApiProperty({
    enum: TeamReportActionItemSource,
    description: 'Muc den tu danh sach vuong mac hay de xuat.',
  })
  @IsEnum(TeamReportActionItemSource)
  source: TeamReportActionItemSource;

  @ApiProperty({ example: 0, description: 'Vi tri muc trong danh sach.' })
  @IsInt()
  @Min(0)
  itemIndex: number;

  @ApiProperty({
    description: 'Task can duoc ban giao, lay tu vuong mac trong bao cao.',
    example: '2f7b08fd-82f8-4bee-8c5f-8fb9fc796463',
  })
  @IsUUID()
  taskId: string;

  @ApiProperty({
    description:
      'Nguoi duoc de xuat nhan ban giao. Bat buoc de he thong kiem tra ho con hoat dong.',
  })
  @IsUUID()
  suggestedReceiverId: string;

  @ApiPropertyOptional({
    description: 'Ly do de nghi ban giao, hien cho nguoi giu task doc.',
    maxLength: 500,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  note?: string;
}
