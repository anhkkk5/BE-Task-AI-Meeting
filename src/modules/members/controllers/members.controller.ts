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
import { WorkspaceMemberGuard } from '../../../common/guards/workspace-member.guard';
import { WorkspaceRolesGuard } from '../../../common/guards/workspace-roles.guard';
import { AccessTokenGuard } from '../../auth/guards/access-token.guard';
import type { AuthUser } from '../../auth/types/auth-user.type';
import { AddMemberDto } from '../dto/add-member.dto';
import { ChangeMemberRoleDto } from '../dto/change-member-role.dto';
import { LookupMemberQueryDto } from '../dto/lookup-member-query.dto';
import { MembersService } from '../services/members.service';
import { UpdateMemberCapacityDto } from '../dto/update-member-capacity.dto';

@Controller('workspaces/:workspaceId/members')
@ApiTags('Members')
@ApiBearerAuth()
@UseGuards(AccessTokenGuard)
export class MembersController {
  constructor(private readonly membersService: MembersService) {}

  @Get()
  @UseGuards(WorkspaceMemberGuard)
  @ApiOperation({
    summary: 'Get workspace members',
    description:
      'Workspace member ACTIVE nao cung xem duoc danh sach thanh vien.',
  })
  @ApiParam({ name: 'workspaceId', example: 'workspace-uuid' })
  @ApiResponse({
    status: 200,
    description: 'Get workspace members successfully.',
  })
  getMembers(
    @CurrentUser() user: AuthUser,
    @Param('workspaceId') workspaceId: string,
  ) {
    return this.membersService.getMembers(user.id, workspaceId);
  }

  @Get('lookup')
  @WorkspaceRoles(WorkspaceRole.Owner)
  @UseGuards(WorkspaceRolesGuard)
  @ApiOperation({
    summary: 'Lookup user before adding workspace member',
    description:
      'OWNER nhap email de xem user da dang ky va trang thai trong workspace truoc khi them.',
  })
  @ApiParam({ name: 'workspaceId', example: 'workspace-uuid' })
  lookupMember(
    @CurrentUser() user: AuthUser,
    @Param('workspaceId') workspaceId: string,
    @Query() query: LookupMemberQueryDto,
  ) {
    return this.membersService.lookupMember(user.id, workspaceId, query.email);
  }

  @Get('me')
  @UseGuards(WorkspaceMemberGuard)
  @ApiOperation({
    summary: 'Get my role in workspace',
    description: 'Lay role cua user hien tai trong workspace.',
  })
  @ApiParam({ name: 'workspaceId', example: 'workspace-uuid' })
  getMyRole(
    @CurrentUser() user: AuthUser,
    @Param('workspaceId') workspaceId: string,
  ) {
    return this.membersService.getMyRole(user.id, workspaceId);
  }

  @Post()
  @WorkspaceRoles(WorkspaceRole.Owner)
  @UseGuards(WorkspaceRolesGuard)
  @ApiOperation({
    summary: 'Add workspace member',
    description: 'Chi OWNER duoc them user da dang ky vao workspace.',
  })
  @ApiParam({ name: 'workspaceId', example: 'workspace-uuid' })
  addMember(
    @CurrentUser() user: AuthUser,
    @Param('workspaceId') workspaceId: string,
    @Body() dto: AddMemberDto,
  ) {
    return this.membersService.addMember(user.id, workspaceId, dto);
  }

  @Patch(':memberId/role')
  @WorkspaceRoles(WorkspaceRole.Owner)
  @UseGuards(WorkspaceRolesGuard)
  @ApiOperation({
    summary: 'Change member role',
    description: 'Chi OWNER duoc doi role. Khong cho doi sang OWNER.',
  })
  @ApiParam({ name: 'workspaceId', example: 'workspace-uuid' })
  @ApiParam({ name: 'memberId', example: 'member-uuid' })
  changeMemberRole(
    @CurrentUser() user: AuthUser,
    @Param('workspaceId') workspaceId: string,
    @Param('memberId') memberId: string,
    @Body() dto: ChangeMemberRoleDto,
  ) {
    return this.membersService.changeMemberRole(
      user.id,
      workspaceId,
      memberId,
      dto,
    );
  }

  @Patch(':memberId/remove')
  @WorkspaceRoles(WorkspaceRole.Owner)
  @UseGuards(WorkspaceRolesGuard)
  @ApiOperation({
    summary: 'Remove workspace member',
    description: 'Chi OWNER duoc remove. He thong set status = REMOVED.',
  })
  @ApiParam({ name: 'workspaceId', example: 'workspace-uuid' })
  @ApiParam({ name: 'memberId', example: 'member-uuid' })
  removeMember(
    @CurrentUser() user: AuthUser,
    @Param('workspaceId') workspaceId: string,
    @Param('memberId') memberId: string,
  ) {
    return this.membersService.removeMember(user.id, workspaceId, memberId);
  }

  @Patch(':memberId/capacity')
  @UseGuards(WorkspaceMemberGuard)
  updateCapacity(
    @CurrentUser() user: AuthUser,
    @Param('workspaceId') workspaceId: string,
    @Param('memberId') memberId: string,
    @Body() dto: UpdateMemberCapacityDto,
  ) {
    return this.membersService.updateCapacity(
      user.id,
      workspaceId,
      memberId,
      dto,
    );
  }
}
