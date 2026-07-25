import { Controller, Get, Param, UseGuards } from '@nestjs/common';
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
import { StatsService } from '../services/stats.service';

// Dat duoi prefix 'stats' rieng, khong long vao 'workspaces'.
// Neu de /workspaces/stats thi @Get(':workspaceId') cua WorkspacesController
// se bat mat route nay va coi 'stats' la mot workspaceId.
@Controller('stats')
@ApiTags('Stats')
@ApiBearerAuth()
@UseGuards(AccessTokenGuard)
export class StatsController {
  constructor(private readonly statsService: StatsService) {}

  @Get('workspaces')
  @ApiOperation({
    summary: 'Get workspaces overview stats',
    description:
      'Tong hop so project, member, meeting, task cua tat ca workspace ma user tham gia.',
  })
  @ApiResponse({ status: 200, description: 'Get overview stats successfully.' })
  getWorkspacesOverview(@CurrentUser() user: AuthUser) {
    return this.statsService.getWorkspacesOverview(user.id);
  }

  @Get('workspaces/:workspaceId/dashboard')
  @UseGuards(WorkspaceMemberGuard)
  @ApiOperation({
    summary: 'Get workspace dashboard stats',
    description:
      'So lieu chi tiet cho dashboard: project, task theo status, sprint dang chay, deadline sap toi.',
  })
  @ApiParam({ name: 'workspaceId', example: 'workspace-uuid' })
  @ApiResponse({
    status: 200,
    description: 'Get dashboard stats successfully.',
  })
  getWorkspaceDashboard(
    @CurrentUser() user: AuthUser,
    @Param('workspaceId') workspaceId: string,
  ) {
    return this.statsService.getWorkspaceDashboard(user.id, workspaceId);
  }
}
