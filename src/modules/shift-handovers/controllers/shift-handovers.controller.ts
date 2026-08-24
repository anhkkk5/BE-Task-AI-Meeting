import {
  Body,
  Controller,
  Delete,
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
import { CreateHandoverDto } from '../dto/create-handover.dto';
import { GetHandoversQueryDto } from '../dto/get-handovers-query.dto';
import { RejectHandoverDto } from '../dto/reject-handover.dto';
import { RequestHandoverChangesDto } from '../dto/request-handover-changes.dto';
import { UpdateHandoverDto } from '../dto/update-handover.dto';
import { ShiftHandoversService } from '../services/shift-handovers.service';

const contributorRoles = [
  WorkspaceRole.Owner,
  WorkspaceRole.ScrumMaster,
  WorkspaceRole.ProjectManager,
  WorkspaceRole.Member,
];

@Controller('workspaces/:workspaceId/projects/:projectId/shift-handovers')
@ApiTags('Bàn giao công việc')
@ApiBearerAuth()
@UseGuards(AccessTokenGuard)
export class ShiftHandoversController {
  constructor(private readonly service: ShiftHandoversService) {}

  @Post('handovers')
  @WorkspaceRoles(...contributorRoles)
  @UseGuards(WorkspaceRolesGuard)
  @ApiOperation({
    summary: 'Tạo bản nháp bàn giao task',
    description:
      'Người đang phụ trách task tạo nội dung bàn giao cho một thành viên khác. Task chưa đổi người phụ trách ở bước này.',
  })
  @ApiResponse({ status: 201, description: 'Tạo bản nháp thành công.' })
  @ApiResponse({
    status: 409,
    description: 'Task đã có yêu cầu bàn giao chưa hoàn tất.',
  })
  createHandover(
    @CurrentUser() user: AuthUser,
    @Param('workspaceId') workspaceId: string,
    @Param('projectId') projectId: string,
    @Body() dto: CreateHandoverDto,
  ) {
    return this.service.createHandover(user.id, workspaceId, projectId, dto);
  }

  @Get('handovers')
  @UseGuards(WorkspaceMemberGuard)
  @ApiOperation({ summary: 'Lấy lịch sử bàn giao công việc' })
  getHandovers(
    @CurrentUser() user: AuthUser,
    @Param('workspaceId') workspaceId: string,
    @Param('projectId') projectId: string,
    @Query() query: GetHandoversQueryDto,
  ) {
    return this.service.getHandovers(user.id, workspaceId, projectId, query);
  }

  @Get('handovers/:handoverId')
  @UseGuards(WorkspaceMemberGuard)
  @ApiOperation({ summary: 'Lấy chi tiết một bản bàn giao' })
  @ApiParam({ name: 'handoverId', description: 'ID bản bàn giao' })
  getHandover(
    @CurrentUser() user: AuthUser,
    @Param('workspaceId') workspaceId: string,
    @Param('projectId') projectId: string,
    @Param('handoverId') handoverId: string,
  ) {
    return this.service.getHandover(
      user.id,
      workspaceId,
      projectId,
      handoverId,
    );
  }

  @Patch('handovers/:handoverId')
  @WorkspaceRoles(...contributorRoles)
  @UseGuards(WorkspaceRolesGuard)
  @ApiOperation({
    summary: 'Bổ sung bản bàn giao',
    description:
      'Người giao được sửa bản nháp hoặc bản đang bị yêu cầu bổ sung.',
  })
  updateHandover(
    @CurrentUser() user: AuthUser,
    @Param('workspaceId') workspaceId: string,
    @Param('projectId') projectId: string,
    @Param('handoverId') handoverId: string,
    @Body() dto: UpdateHandoverDto,
  ) {
    return this.service.updateHandover(
      user.id,
      workspaceId,
      projectId,
      handoverId,
      dto,
    );
  }

  @Post('handovers/:handoverId/submit')
  @WorkspaceRoles(...contributorRoles)
  @UseGuards(WorkspaceRolesGuard)
  @ApiOperation({
    summary: 'Gửi yêu cầu bàn giao',
    description: 'Chuyển bản nháp sang trạng thái chờ người nhận xử lý.',
  })
  submit(
    @CurrentUser() user: AuthUser,
    @Param('workspaceId') workspaceId: string,
    @Param('projectId') projectId: string,
    @Param('handoverId') handoverId: string,
  ) {
    return this.service.submitHandover(
      user.id,
      workspaceId,
      projectId,
      handoverId,
    );
  }

  @Post('handovers/:handoverId/request-changes')
  @WorkspaceRoles(...contributorRoles)
  @UseGuards(WorkspaceRolesGuard)
  @ApiOperation({
    summary: 'Yêu cầu bổ sung thông tin',
    description: 'Chỉ người nhận của yêu cầu đang chờ mới thực hiện được.',
  })
  requestChanges(
    @CurrentUser() user: AuthUser,
    @Param('workspaceId') workspaceId: string,
    @Param('projectId') projectId: string,
    @Param('handoverId') handoverId: string,
    @Body() dto: RequestHandoverChangesDto,
  ) {
    return this.service.requestChanges(
      user.id,
      workspaceId,
      projectId,
      handoverId,
      dto.reason,
    );
  }

  @Post('handovers/:handoverId/reject')
  @WorkspaceRoles(...contributorRoles)
  @UseGuards(WorkspaceRolesGuard)
  @ApiOperation({
    summary: 'Từ chối nhận bàn giao',
    description:
      'Người nhận từ chối và bắt buộc nêu lý do. Task vẫn thuộc người giao.',
  })
  reject(
    @CurrentUser() user: AuthUser,
    @Param('workspaceId') workspaceId: string,
    @Param('projectId') projectId: string,
    @Param('handoverId') handoverId: string,
    @Body() dto: RejectHandoverDto,
  ) {
    return this.service.reject(
      user.id,
      workspaceId,
      projectId,
      handoverId,
      dto.reason,
    );
  }

  @Post('handovers/:handoverId/accept')
  @WorkspaceRoles(...contributorRoles)
  @UseGuards(WorkspaceRolesGuard)
  @ApiOperation({
    summary: 'Chấp nhận bàn giao',
    description:
      'Chỉ người nhận được chấp nhận. Hệ thống đổi người phụ trách task từ người giao sang người nhận trong cùng transaction.',
  })
  accept(
    @CurrentUser() user: AuthUser,
    @Param('workspaceId') workspaceId: string,
    @Param('projectId') projectId: string,
    @Param('handoverId') handoverId: string,
  ) {
    return this.service.accept(user.id, workspaceId, projectId, handoverId);
  }

  @Delete('handovers/:handoverId')
  @UseGuards(WorkspaceMemberGuard)
  @ApiOperation({
    summary: 'Xóa bản bàn giao',
    description: 'Người tạo bản bàn giao hoặc quản lý workspace được xóa mềm.',
  })
  deleteHandover(
    @CurrentUser() user: AuthUser,
    @Param('workspaceId') workspaceId: string,
    @Param('projectId') projectId: string,
    @Param('handoverId') handoverId: string,
  ) {
    return this.service.deleteHandover(
      user.id,
      workspaceId,
      projectId,
      handoverId,
    );
  }
}
