import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { SystemAdminGuard } from '../../common/guards/system-admin.guard';
import { AccessTokenGuard } from '../auth/guards/access-token.guard';
import type { AuthUser } from '../auth/types/auth-user.type';
import { AdminService } from './admin.service';
import { ObservabilityService } from '../observability/observability.service';

@Controller('admin')
@ApiTags('System Admin')
@ApiBearerAuth()
@UseGuards(AccessTokenGuard, SystemAdminGuard)
export class AdminController {
  constructor(private readonly adminService: AdminService, private readonly observability: ObservabilityService) {}

  // ===== SYSTEM STATS =====
  @Get('stats')
  @ApiOperation({
    summary: '[ADMIN] Thống kê tổng quan hệ thống',
    description: 'Tổng số users, workspaces, dự án, task, cuộc họp.',
  })
  getSystemStats() {
    return this.adminService.getSystemStats();
  }

  @Get('observability')
  getObservability(@Query('hours') hours?: string) { return this.observability.summary(Math.min(168, Math.max(1, Number(hours) || 24))).then((data) => ({ success: true, message: 'Success', data })); }

  @Get('audit-logs')
  getAuditLogs(@Query('page') page?: string, @Query('limit') limit?: string) { return this.observability.auditLogs(Math.max(1, Number(page) || 1), Math.min(100, Math.max(1, Number(limit) || 50))).then((data) => ({ success: true, message: 'Success', data })); }

  // ===== USER MANAGEMENT =====
  @Get('users')
  @ApiOperation({ summary: '[ADMIN] Danh sách tất cả users trong hệ thống' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: ['active', 'inactive', 'admin'],
  })
  getAllUsers(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('status') status?: string,
  ) {
    return this.adminService.getAllUsers({
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 20,
      search,
      status,
    });
  }

  @Patch('users/:userId/status')
  @ApiOperation({ summary: '[ADMIN] Bật / Tắt tài khoản user' })
  @ApiParam({ name: 'userId' })
  toggleUserStatus(
    @CurrentUser() admin: AuthUser,
    @Param('userId') userId: string,
  ) {
    return this.adminService.toggleUserStatus(admin.id, userId);
  }

  @Patch('users/:userId/admin')
  @ApiOperation({ summary: '[ADMIN] Cấp / Thu hồi quyền System Admin' })
  @ApiParam({ name: 'userId' })
  toggleAdminRole(
    @CurrentUser() admin: AuthUser,
    @Param('userId') userId: string,
  ) {
    return this.adminService.toggleAdminRole(admin.id, userId);
  }

  // ===== WORKSPACE MANAGEMENT =====
  @Get('workspaces')
  @ApiOperation({ summary: '[ADMIN] Danh sách tất cả workspaces' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'status', required: false, enum: ['active', 'archived'] })
  getAllWorkspaces(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('status') status?: string,
  ) {
    return this.adminService.getAllWorkspaces({
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 20,
      search,
      status,
    });
  }

  @Patch('workspaces/:workspaceId/status')
  @ApiOperation({ summary: '[ADMIN] Bật / Archive workspace' })
  @ApiParam({ name: 'workspaceId' })
  toggleWorkspaceStatus(@CurrentUser() admin: AuthUser, @Param('workspaceId') workspaceId: string) {
    return this.adminService.toggleWorkspaceStatus(admin.id, workspaceId);
  }
}
