import { Body, Controller, Post, Param, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { WorkspaceMemberGuard } from '../../../common/guards/workspace-member.guard';
import { AccessTokenGuard } from '../../auth/guards/access-token.guard';
import type { AuthUser } from '../../auth/types/auth-user.type';
import { DraftDailyUpdateDto } from '../dto/draft-daily-update.dto';
import { DraftHandoverDto } from '../dto/draft-handover.dto';
import { AiDraftService } from '../services/ai-draft.service';

/**
 * Cac endpoint sinh ban nhap cho form.
 *
 * Tach khoi controller bao cao vi ban chat khac nhau: o day AI khong tao ban ghi
 * nao, chi tra ve noi dung goi y de nguoi dung tu quyet dinh gui hay khong.
 */
@Controller('workspaces/:workspaceId/projects/:projectId/ai')
@ApiTags('AI Drafts')
@ApiBearerAuth()
@UseGuards(AccessTokenGuard)
export class AiDraftController {
  constructor(private readonly aiDraftService: AiDraftService) {}

  @Post('daily-update-draft')
  @UseGuards(WorkspaceMemberGuard)
  @ApiOperation({
    summary: 'Draft my daily update',
    description:
      'Sinh nhap 4 o cua form bao cao ca nhan tu task va ban giao trong ngay. Khong ghi vao DB, nguoi dung tu sua roi gui.',
  })
  @ApiParam({ name: 'workspaceId', example: 'workspace-uuid' })
  @ApiParam({ name: 'projectId', example: 'project-uuid' })
  @ApiResponse({ status: 201, description: 'Soan nhap thanh cong.' })
  @ApiResponse({ status: 503, description: 'AI provider that bai.' })
  draftMyDailyUpdate(
    @CurrentUser() user: AuthUser,
    @Param('workspaceId') workspaceId: string,
    @Param('projectId') projectId: string,
    @Body() dto: DraftDailyUpdateDto,
  ) {
    return this.aiDraftService.draftMyDailyUpdate(
      user.id,
      workspaceId,
      projectId,
      dto,
    );
  }

  @Post('handover-draft')
  @UseGuards(WorkspaceMemberGuard)
  @ApiOperation({
    summary: 'Draft handover content',
    description:
      'Sinh nhap noi dung ban giao cho task dang duoc gan cho nguoi goi. Khong ghi vao DB.',
  })
  @ApiParam({ name: 'workspaceId', example: 'workspace-uuid' })
  @ApiParam({ name: 'projectId', example: 'project-uuid' })
  @ApiResponse({ status: 201, description: 'Soan nhap thanh cong.' })
  @ApiResponse({
    status: 403,
    description: 'Task khong duoc gan cho nguoi goi.',
  })
  draftHandover(
    @CurrentUser() user: AuthUser,
    @Param('workspaceId') workspaceId: string,
    @Param('projectId') projectId: string,
    @Body() dto: DraftHandoverDto,
  ) {
    return this.aiDraftService.draftHandover(
      user.id,
      workspaceId,
      projectId,
      dto,
    );
  }
}
