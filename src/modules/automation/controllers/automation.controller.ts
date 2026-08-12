import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { WorkspaceRole } from '../../../common/enums/workspace-role.enum';
import { WorkspaceRoles } from '../../../common/decorators/workspace-roles.decorator';
import { WorkspaceRolesGuard } from '../../../common/guards/workspace-roles.guard';
import { AccessTokenGuard } from '../../auth/guards/access-token.guard';
import type { AuthUser } from '../../auth/types/auth-user.type';
import { SaveAutomationRuleDto } from '../dto/save-automation-rule.dto';
import { AutomationService } from '../services/automation.service';
const roles = [WorkspaceRole.Owner, WorkspaceRole.ProjectManager, WorkspaceRole.ScrumMaster];
@Controller('workspaces/:workspaceId/projects/:projectId/automations')
@UseGuards(AccessTokenGuard, WorkspaceRolesGuard)
@WorkspaceRoles(...roles)
export class AutomationController {
  constructor(private service: AutomationService) {}
  @Get() list(@CurrentUser() u: AuthUser, @Param('workspaceId') w: string, @Param('projectId') p: string) { return this.service.list(u.id, w, p); }
  @Post() create(@CurrentUser() u: AuthUser, @Param('workspaceId') w: string, @Param('projectId') p: string, @Body() dto: SaveAutomationRuleDto) { return this.service.save(u.id, w, p, dto); }
  @Patch(':id') update(@CurrentUser() u: AuthUser, @Param('workspaceId') w: string, @Param('projectId') p: string, @Param('id') id: string, @Body() dto: SaveAutomationRuleDto) { return this.service.save(u.id, w, p, dto, id); }
  @Delete(':id') remove(@CurrentUser() u: AuthUser, @Param('workspaceId') w: string, @Param('projectId') p: string, @Param('id') id: string) { return this.service.remove(u.id, w, p, id); }
  @Post(':id/dry-run') preview(@CurrentUser() u: AuthUser, @Param('workspaceId') w: string, @Param('projectId') p: string, @Param('id') id: string) { return this.service.preview(u.id, w, p, id); }
  @Get(':id/runs') history(@CurrentUser() u: AuthUser, @Param('workspaceId') w: string, @Param('projectId') p: string, @Param('id') id: string) { return this.service.history(u.id, w, p, id); }
  @Post('runs/:runId/retry') retry(@CurrentUser() u: AuthUser, @Param('workspaceId') w: string, @Param('projectId') p: string, @Param('runId') id: string) { return this.service.retry(u.id, w, p, id); }
}
