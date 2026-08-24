import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
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
import { AskProjectAssistantDto } from '../dto/ask-project-assistant.dto';
import { AiProjectAssistantService } from '../services/ai-project-assistant.service';

@Controller('workspaces/:workspaceId/projects/:projectId/ai/assistant')
@ApiTags('AI Project Assistant')
@ApiBearerAuth()
@UseGuards(AccessTokenGuard, WorkspaceMemberGuard)
export class AiProjectAssistantController {
  constructor(
    private readonly aiProjectAssistantService: AiProjectAssistantService,
  ) {}

  @Post('ask')
  @ApiOperation({
    summary: 'Hỏi trợ lý dự án',
    description:
      'Trả lời dựa trên Sprint, task và cập nhật hằng ngày mà thành viên được phép xem.',
  })
  @ApiParam({ name: 'workspaceId', example: 'workspace-uuid' })
  @ApiParam({ name: 'projectId', example: 'project-uuid' })
  @ApiResponse({ status: 201, description: 'Trả lời câu hỏi thành công.' })
  ask(
    @CurrentUser() user: AuthUser,
    @Param('workspaceId') workspaceId: string,
    @Param('projectId') projectId: string,
    @Body() dto: AskProjectAssistantDto,
  ) {
    return this.aiProjectAssistantService.ask(
      user.id,
      workspaceId,
      projectId,
      dto,
    );
  }

  @Get('history')
  getHistory(
    @CurrentUser() user: AuthUser,
    @Param('workspaceId') workspaceId: string,
    @Param('projectId') projectId: string,
  ) {
    return this.aiProjectAssistantService.getHistory(
      user.id,
      workspaceId,
      projectId,
    );
  }

  @Delete('history')
  clearHistory(
    @CurrentUser() user: AuthUser,
    @Param('workspaceId') workspaceId: string,
    @Param('projectId') projectId: string,
  ) {
    return this.aiProjectAssistantService.clearHistory(
      user.id,
      workspaceId,
      projectId,
    );
  }

  @Get('sprints/:sprintId/risk')
  @ApiOperation({
    summary: 'Dự báo rủi ro Sprint',
    description:
      'Chấm điểm rủi ro có giải thích từ tiến độ, quá hạn, blocker, task chưa giao và task đứng lâu.',
  })
  @ApiParam({ name: 'workspaceId', example: 'workspace-uuid' })
  @ApiParam({ name: 'projectId', example: 'project-uuid' })
  @ApiParam({ name: 'sprintId', example: 'sprint-uuid' })
  @ApiResponse({ status: 200, description: 'Lấy dự báo rủi ro thành công.' })
  getSprintRisk(
    @CurrentUser() user: AuthUser,
    @Param('workspaceId') workspaceId: string,
    @Param('projectId') projectId: string,
    @Param('sprintId') sprintId: string,
  ) {
    return this.aiProjectAssistantService.getSprintRisk(
      user.id,
      workspaceId,
      projectId,
      sprintId,
    );
  }
}
