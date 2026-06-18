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
import { AccessTokenGuard } from '../../auth/guards/access-token.guard';
import type { AuthUser } from '../../auth/types/auth-user.type';
import { CreateWorkspaceDto } from '../dto/create-workspace.dto';
import { GetWorkspacesQueryDto } from '../dto/get-workspaces-query.dto';
import { UpdateWorkspaceDto } from '../dto/update-workspace.dto';
import { WorkspacesService } from '../services/workspaces.service';

@Controller('workspaces')
@ApiTags('Workspaces')
@ApiBearerAuth()
@UseGuards(AccessTokenGuard)
export class WorkspacesController {
  constructor(private readonly workspacesService: WorkspacesService) {}

  @Post()
  @ApiOperation({
    summary: 'Create workspace',
    description: 'Tao workspace moi. User hien tai se tu dong tro thanh OWNER.',
  })
  @ApiResponse({ status: 201, description: 'Create workspace successfully.' })
  createWorkspace(
    @CurrentUser() user: AuthUser,
    @Body() dto: CreateWorkspaceDto,
  ) {
    return this.workspacesService.createWorkspace(user.id, dto);
  }

  @Get()
  @ApiOperation({
    summary: 'Get my workspaces',
    description: 'Lay danh sach workspace ma user hien tai dang tham gia.',
  })
  @ApiResponse({ status: 200, description: 'Get workspaces successfully.' })
  getMyWorkspaces(
    @CurrentUser() user: AuthUser,
    @Query() query: GetWorkspacesQueryDto,
  ) {
    return this.workspacesService.getMyWorkspaces(user.id, query);
  }

  @Get(':workspaceId')
  @ApiOperation({
    summary: 'Get workspace detail',
    description: 'Chi member cua workspace moi xem duoc chi tiet.',
  })
  @ApiParam({ name: 'workspaceId', example: 'workspace-uuid' })
  @ApiResponse({
    status: 200,
    description: 'Get workspace detail successfully.',
  })
  @ApiResponse({ status: 403, description: 'User khong thuoc workspace.' })
  getWorkspaceDetail(
    @CurrentUser() user: AuthUser,
    @Param('workspaceId') workspaceId: string,
  ) {
    return this.workspacesService.getWorkspaceDetail(user.id, workspaceId);
  }

  @Patch(':workspaceId')
  @ApiOperation({
    summary: 'Update workspace',
    description: 'Chi OWNER duoc cap nhat name/description cua workspace.',
  })
  @ApiParam({ name: 'workspaceId', example: 'workspace-uuid' })
  @ApiResponse({ status: 200, description: 'Update workspace successfully.' })
  @ApiResponse({ status: 403, description: 'User khong phai OWNER.' })
  updateWorkspace(
    @CurrentUser() user: AuthUser,
    @Param('workspaceId') workspaceId: string,
    @Body() dto: UpdateWorkspaceDto,
  ) {
    return this.workspacesService.updateWorkspace(user.id, workspaceId, dto);
  }

  @Patch(':workspaceId/archive')
  @ApiOperation({
    summary: 'Archive workspace',
    description: 'Chi OWNER duoc archive workspace. Khong hard delete.',
  })
  @ApiParam({ name: 'workspaceId', example: 'workspace-uuid' })
  @ApiResponse({ status: 200, description: 'Archive workspace successfully.' })
  @ApiResponse({ status: 403, description: 'User khong phai OWNER.' })
  archiveWorkspace(
    @CurrentUser() user: AuthUser,
    @Param('workspaceId') workspaceId: string,
  ) {
    return this.workspacesService.archiveWorkspace(user.id, workspaceId);
  }
}
