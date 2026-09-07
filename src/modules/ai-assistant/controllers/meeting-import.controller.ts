import { Controller, Get, Param, Post, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { WorkspaceRoles } from '../../../common/decorators/workspace-roles.decorator';
import { WorkspaceRole } from '../../../common/enums/workspace-role.enum';
import { WorkspaceRolesGuard } from '../../../common/guards/workspace-roles.guard';
import { AccessTokenGuard } from '../../auth/guards/access-token.guard';
import type { AuthUser } from '../../auth/types/auth-user.type';
import { MeetingImportService } from '../services/meeting-import.service';

const managerRoles = [WorkspaceRole.Owner, WorkspaceRole.ScrumMaster, WorkspaceRole.ProjectManager];

@Controller('workspaces/:workspaceId/projects/:projectId/ai/content-analysis')
@ApiTags('AI Meeting Imports')
@ApiBearerAuth()
@UseGuards(AccessTokenGuard, WorkspaceRolesGuard)
@WorkspaceRoles(...managerRoles)
export class MeetingImportController {
  constructor(private readonly service: MeetingImportService) {}

  @Post()
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: 200 * 1024 * 1024 } }))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload tài liệu, audio hoặc video và tạo tóm tắt cuộc họp' })
  create(@CurrentUser() user: AuthUser, @Param('workspaceId') workspaceId: string, @Param('projectId') projectId: string, @UploadedFile() file: Express.Multer.File) {
    return this.service.createJob(user.id, workspaceId, projectId, file);
  }

  @Get('latest')
  latest(@CurrentUser() user: AuthUser, @Param('workspaceId') workspaceId: string, @Param('projectId') projectId: string) {
    return this.service.getLatestJob(user.id, workspaceId, projectId);
  }

  @Get()
  list(@CurrentUser() user: AuthUser, @Param('workspaceId') workspaceId: string, @Param('projectId') projectId: string) {
    return this.service.listJobs(user.id, workspaceId, projectId);
  }

  @Get(':jobId')
  get(@CurrentUser() user: AuthUser, @Param('workspaceId') workspaceId: string, @Param('projectId') projectId: string, @Param('jobId') jobId: string) {
    return this.service.getJob(user.id, workspaceId, projectId, jobId);
  }
}
