import {
  Body,
  Controller,
  Get,
  Param,
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
import { WorkspaceMemberGuard } from '../../../common/guards/workspace-member.guard';
import { WorkspaceRolesGuard } from '../../../common/guards/workspace-roles.guard';
import { AccessTokenGuard } from '../../auth/guards/access-token.guard';
import type { AuthUser } from '../../auth/types/auth-user.type';
import { GeneratePersonalReportDto } from '../dto/generate-personal-report.dto';
import { GetAiReportsQueryDto } from '../dto/get-ai-reports-query.dto';
import { AiDailyReportSchedulerService } from '../schedulers/ai-daily-report-scheduler.service';
import { AiPersonalReportService } from '../services/ai-personal-report.service';

const managerRoles = [
  WorkspaceRole.Owner,
  WorkspaceRole.ScrumMaster,
  WorkspaceRole.ProjectManager,
];

@Controller('workspaces/:workspaceId/projects/:projectId/ai')
@ApiTags('AI Personal Reports')
@ApiBearerAuth()
@UseGuards(AccessTokenGuard)
export class AiPersonalReportController {
  constructor(
    private readonly aiPersonalReportService: AiPersonalReportService,
    private readonly schedulerService: AiDailyReportSchedulerService,
  ) {}

  @Get('daily-report-automation')
  @UseGuards(WorkspaceMemberGuard)
  @ApiOperation({
    summary: 'Get AI daily report automation status',
    description:
      'Cho biet lich tu dong tao bao cao giao ban co dang bat, chay vao luc nao va ket qua lan chay gan nhat.',
  })
  @ApiParam({ name: 'workspaceId', example: 'workspace-uuid' })
  @ApiParam({ name: 'projectId', example: 'project-uuid' })
  async getDailyReportAutomation() {
    return {
      success: true,
      message: 'Success',
      data: await this.schedulerService.getAutomationStatus(),
    };
  }

  @Post('personal-daily-report')
  @UseGuards(WorkspaceMemberGuard)
  @ApiOperation({
    summary: 'Generate my personal daily report',
    description:
      'OWNER, SCRUM_MASTER, PROJECT_MANAGER va MEMBER duoc tao report cho chinh minh. VIEWER bi chan trong service.',
  })
  @ApiParam({ name: 'workspaceId', example: 'workspace-uuid' })
  @ApiParam({ name: 'projectId', example: 'project-uuid' })
  @ApiResponse({
    status: 201,
    description: 'Generate personal daily report successfully.',
  })
  generateMyPersonalDailyReport(
    @CurrentUser() user: AuthUser,
    @Param('workspaceId') workspaceId: string,
    @Param('projectId') projectId: string,
    @Body() dto: GeneratePersonalReportDto,
  ) {
    return this.aiPersonalReportService.generateMyPersonalDailyReport(
      user.id,
      workspaceId,
      projectId,
      dto,
    );
  }

  @Post('personal-daily-report/member/:memberId')
  @WorkspaceRoles(...managerRoles)
  @UseGuards(WorkspaceRolesGuard)
  @ApiOperation({
    summary: 'Generate personal daily report for member',
    description:
      'Chi OWNER, SCRUM_MASTER va PROJECT_MANAGER duoc tao report cho member.',
  })
  @ApiParam({ name: 'workspaceId', example: 'workspace-uuid' })
  @ApiParam({ name: 'projectId', example: 'project-uuid' })
  @ApiParam({ name: 'memberId', example: 'member-user-uuid' })
  generateMemberPersonalDailyReport(
    @CurrentUser() user: AuthUser,
    @Param('workspaceId') workspaceId: string,
    @Param('projectId') projectId: string,
    @Param('memberId') memberId: string,
    @Body() dto: GeneratePersonalReportDto,
  ) {
    return this.aiPersonalReportService.generateMemberPersonalDailyReport(
      user.id,
      workspaceId,
      projectId,
      memberId,
      dto,
    );
  }

  @Get('personal-daily-reports/me')
  @UseGuards(WorkspaceMemberGuard)
  @ApiOperation({ summary: 'Get my personal daily reports' })
  @ApiParam({ name: 'workspaceId', example: 'workspace-uuid' })
  @ApiParam({ name: 'projectId', example: 'project-uuid' })
  getMyPersonalDailyReports(
    @CurrentUser() user: AuthUser,
    @Param('workspaceId') workspaceId: string,
    @Param('projectId') projectId: string,
    @Query() query: GetAiReportsQueryDto,
  ) {
    return this.aiPersonalReportService.getMyPersonalDailyReports(
      user.id,
      workspaceId,
      projectId,
      query,
    );
  }

  @Get('personal-daily-reports/member/:memberId')
  @WorkspaceRoles(...managerRoles)
  @UseGuards(WorkspaceRolesGuard)
  @ApiOperation({ summary: 'Get member personal daily reports' })
  @ApiParam({ name: 'workspaceId', example: 'workspace-uuid' })
  @ApiParam({ name: 'projectId', example: 'project-uuid' })
  @ApiParam({ name: 'memberId', example: 'member-user-uuid' })
  getMemberPersonalDailyReports(
    @CurrentUser() user: AuthUser,
    @Param('workspaceId') workspaceId: string,
    @Param('projectId') projectId: string,
    @Param('memberId') memberId: string,
    @Query() query: GetAiReportsQueryDto,
  ) {
    return this.aiPersonalReportService.getMemberPersonalDailyReports(
      user.id,
      workspaceId,
      projectId,
      memberId,
      query,
    );
  }

  @Get('personal-daily-reports/:reportId')
  @UseGuards(WorkspaceMemberGuard)
  @ApiOperation({ summary: 'Get personal daily report detail' })
  @ApiParam({ name: 'workspaceId', example: 'workspace-uuid' })
  @ApiParam({ name: 'projectId', example: 'project-uuid' })
  @ApiParam({ name: 'reportId', example: 'mongo-report-id' })
  getPersonalDailyReportDetail(
    @CurrentUser() user: AuthUser,
    @Param('workspaceId') workspaceId: string,
    @Param('projectId') projectId: string,
    @Param('reportId') reportId: string,
  ) {
    return this.aiPersonalReportService.getPersonalDailyReportDetail(
      user.id,
      workspaceId,
      projectId,
      reportId,
    );
  }
}
