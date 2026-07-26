import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
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
import { WorkspaceRoles } from '../../../common/decorators/workspace-roles.decorator';
import { WorkspaceRole } from '../../../common/enums/workspace-role.enum';
import { WorkspaceRolesGuard } from '../../../common/guards/workspace-roles.guard';
import { AccessTokenGuard } from '../../auth/guards/access-token.guard';
import type { AuthUser } from '../../auth/types/auth-user.type';
import { GenerateTeamReportDto } from '../dto/generate-team-report.dto';
import { GetAiTeamReportsQueryDto } from '../dto/get-ai-team-reports-query.dto';
import { UpdateTeamReportDto } from '../dto/update-team-report.dto';
import { AiTeamReportService } from '../services/ai-team-report.service';

const managerRoles = [
  WorkspaceRole.Owner,
  WorkspaceRole.ScrumMaster,
  WorkspaceRole.ProjectManager,
];

@Controller('workspaces/:workspaceId/projects/:projectId/ai')
@ApiTags('AI Team Reports')
@ApiBearerAuth()
@UseGuards(AccessTokenGuard)
export class AiTeamReportController {
  constructor(private readonly aiTeamReportService: AiTeamReportService) {}

  @Post('team-daily-report')
  @WorkspaceRoles(...managerRoles)
  @UseGuards(WorkspaceRolesGuard)
  @ApiOperation({
    summary: 'Generate AI team daily report',
    description:
      'Chi OWNER, SCRUM_MASTER va PROJECT_MANAGER duoc tao AI team daily report.',
  })
  @ApiParam({ name: 'workspaceId', example: 'workspace-uuid' })
  @ApiParam({ name: 'projectId', example: 'project-uuid' })
  @ApiResponse({
    status: 201,
    description: 'Generate team daily report successfully.',
  })
  generateTeamDailyReport(
    @CurrentUser() user: AuthUser,
    @Param('workspaceId') workspaceId: string,
    @Param('projectId') projectId: string,
    @Body() dto: GenerateTeamReportDto,
  ) {
    return this.aiTeamReportService.generateTeamDailyReport(
      user.id,
      workspaceId,
      projectId,
      dto,
    );
  }

  @Get('team-daily-reports')
  @WorkspaceRoles(...managerRoles)
  @UseGuards(WorkspaceRolesGuard)
  @ApiOperation({ summary: 'Get AI team daily reports' })
  @ApiParam({ name: 'workspaceId', example: 'workspace-uuid' })
  @ApiParam({ name: 'projectId', example: 'project-uuid' })
  getTeamDailyReports(
    @CurrentUser() user: AuthUser,
    @Param('workspaceId') workspaceId: string,
    @Param('projectId') projectId: string,
    @Query() query: GetAiTeamReportsQueryDto,
  ) {
    return this.aiTeamReportService.getTeamDailyReports(
      user.id,
      workspaceId,
      projectId,
      query,
    );
  }

  @Get('team-daily-reports/latest')
  @WorkspaceRoles(...managerRoles)
  @UseGuards(WorkspaceRolesGuard)
  @ApiOperation({ summary: 'Get latest AI team daily report' })
  @ApiParam({ name: 'workspaceId', example: 'workspace-uuid' })
  @ApiParam({ name: 'projectId', example: 'project-uuid' })
  getLatestTeamDailyReport(
    @CurrentUser() user: AuthUser,
    @Param('workspaceId') workspaceId: string,
    @Param('projectId') projectId: string,
    @Query() query: GetAiTeamReportsQueryDto,
  ) {
    return this.aiTeamReportService.getLatestTeamDailyReport(
      user.id,
      workspaceId,
      projectId,
      query,
    );
  }

  @Get('team-daily-reports/:reportId')
  @WorkspaceRoles(...managerRoles)
  @UseGuards(WorkspaceRolesGuard)
  @ApiOperation({ summary: 'Get AI team daily report detail' })
  @ApiParam({ name: 'workspaceId', example: 'workspace-uuid' })
  @ApiParam({ name: 'projectId', example: 'project-uuid' })
  @ApiParam({ name: 'reportId', example: 'mongo-report-id' })
  getTeamDailyReportDetail(
    @CurrentUser() user: AuthUser,
    @Param('workspaceId') workspaceId: string,
    @Param('projectId') projectId: string,
    @Param('reportId') reportId: string,
  ) {
    return this.aiTeamReportService.getTeamDailyReportDetail(
      user.id,
      workspaceId,
      projectId,
      reportId,
    );
  }

  @Patch('team-daily-reports/:reportId')
  @WorkspaceRoles(...managerRoles)
  @UseGuards(WorkspaceRolesGuard)
  @ApiOperation({
    summary: 'Update AI team daily report',
    description:
      'Sua noi dung ban nhap do AI sinh. Bao cao da duyet thi khong sua duoc.',
  })
  @ApiParam({ name: 'workspaceId', example: 'workspace-uuid' })
  @ApiParam({ name: 'projectId', example: 'project-uuid' })
  @ApiParam({ name: 'reportId', example: 'mongo-report-id' })
  @ApiResponse({ status: 409, description: 'Bao cao da duoc duyet.' })
  updateTeamDailyReport(
    @CurrentUser() user: AuthUser,
    @Param('workspaceId') workspaceId: string,
    @Param('projectId') projectId: string,
    @Param('reportId') reportId: string,
    @Body() dto: UpdateTeamReportDto,
  ) {
    return this.aiTeamReportService.updateTeamDailyReport(
      user.id,
      workspaceId,
      projectId,
      reportId,
      dto,
    );
  }

  @Post('team-daily-reports/:reportId/approve')
  @WorkspaceRoles(...managerRoles)
  @UseGuards(WorkspaceRolesGuard)
  @ApiOperation({
    summary: 'Approve AI team daily report',
    description:
      'Duyet ban nhap thanh bao cao giao ban chinh thuc va gui mail cho ca nhom.',
  })
  @ApiParam({ name: 'workspaceId', example: 'workspace-uuid' })
  @ApiParam({ name: 'projectId', example: 'project-uuid' })
  @ApiParam({ name: 'reportId', example: 'mongo-report-id' })
  @ApiResponse({ status: 409, description: 'Bao cao da duoc duyet truoc do.' })
  approveTeamDailyReport(
    @CurrentUser() user: AuthUser,
    @Param('workspaceId') workspaceId: string,
    @Param('projectId') projectId: string,
    @Param('reportId') reportId: string,
  ) {
    return this.aiTeamReportService.approveTeamDailyReport(
      user.id,
      workspaceId,
      projectId,
      reportId,
    );
  }
}
