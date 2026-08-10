"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MembersController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const current_user_decorator_1 = require("../../../common/decorators/current-user.decorator");
const workspace_roles_decorator_1 = require("../../../common/decorators/workspace-roles.decorator");
const workspace_role_enum_1 = require("../../../common/enums/workspace-role.enum");
const workspace_member_guard_1 = require("../../../common/guards/workspace-member.guard");
const workspace_roles_guard_1 = require("../../../common/guards/workspace-roles.guard");
const access_token_guard_1 = require("../../auth/guards/access-token.guard");
const add_member_dto_1 = require("../dto/add-member.dto");
const change_member_role_dto_1 = require("../dto/change-member-role.dto");
const lookup_member_query_dto_1 = require("../dto/lookup-member-query.dto");
const members_service_1 = require("../services/members.service");
const update_member_capacity_dto_1 = require("../dto/update-member-capacity.dto");
let MembersController = class MembersController {
    membersService;
    constructor(membersService) {
        this.membersService = membersService;
    }
    getMembers(user, workspaceId) {
        return this.membersService.getMembers(user.id, workspaceId);
    }
    lookupMember(user, workspaceId, query) {
        return this.membersService.lookupMember(user.id, workspaceId, query.email);
    }
    getMyRole(user, workspaceId) {
        return this.membersService.getMyRole(user.id, workspaceId);
    }
    addMember(user, workspaceId, dto) {
        return this.membersService.addMember(user.id, workspaceId, dto);
    }
    changeMemberRole(user, workspaceId, memberId, dto) {
        return this.membersService.changeMemberRole(user.id, workspaceId, memberId, dto);
    }
    removeMember(user, workspaceId, memberId) {
        return this.membersService.removeMember(user.id, workspaceId, memberId);
    }
    updateCapacity(user, workspaceId, memberId, dto) {
        return this.membersService.updateCapacity(user.id, workspaceId, memberId, dto);
    }
};
exports.MembersController = MembersController;
__decorate([
    (0, common_1.Get)(),
    (0, common_1.UseGuards)(workspace_member_guard_1.WorkspaceMemberGuard),
    (0, swagger_1.ApiOperation)({
        summary: 'Get workspace members',
        description: 'Workspace member ACTIVE nao cung xem duoc danh sach thanh vien.',
    }),
    (0, swagger_1.ApiParam)({ name: 'workspaceId', example: 'workspace-uuid' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Get workspace members successfully.',
    }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('workspaceId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], MembersController.prototype, "getMembers", null);
__decorate([
    (0, common_1.Get)('lookup'),
    (0, workspace_roles_decorator_1.WorkspaceRoles)(workspace_role_enum_1.WorkspaceRole.Owner),
    (0, common_1.UseGuards)(workspace_roles_guard_1.WorkspaceRolesGuard),
    (0, swagger_1.ApiOperation)({
        summary: 'Lookup user before adding workspace member',
        description: 'OWNER nhap email de xem user da dang ky va trang thai trong workspace truoc khi them.',
    }),
    (0, swagger_1.ApiParam)({ name: 'workspaceId', example: 'workspace-uuid' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('workspaceId')),
    __param(2, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, lookup_member_query_dto_1.LookupMemberQueryDto]),
    __metadata("design:returntype", void 0)
], MembersController.prototype, "lookupMember", null);
__decorate([
    (0, common_1.Get)('me'),
    (0, common_1.UseGuards)(workspace_member_guard_1.WorkspaceMemberGuard),
    (0, swagger_1.ApiOperation)({
        summary: 'Get my role in workspace',
        description: 'Lay role cua user hien tai trong workspace.',
    }),
    (0, swagger_1.ApiParam)({ name: 'workspaceId', example: 'workspace-uuid' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('workspaceId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], MembersController.prototype, "getMyRole", null);
__decorate([
    (0, common_1.Post)(),
    (0, workspace_roles_decorator_1.WorkspaceRoles)(workspace_role_enum_1.WorkspaceRole.Owner),
    (0, common_1.UseGuards)(workspace_roles_guard_1.WorkspaceRolesGuard),
    (0, swagger_1.ApiOperation)({
        summary: 'Add workspace member',
        description: 'Chi OWNER duoc them user da dang ky vao workspace.',
    }),
    (0, swagger_1.ApiParam)({ name: 'workspaceId', example: 'workspace-uuid' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('workspaceId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, add_member_dto_1.AddMemberDto]),
    __metadata("design:returntype", void 0)
], MembersController.prototype, "addMember", null);
__decorate([
    (0, common_1.Patch)(':memberId/role'),
    (0, workspace_roles_decorator_1.WorkspaceRoles)(workspace_role_enum_1.WorkspaceRole.Owner),
    (0, common_1.UseGuards)(workspace_roles_guard_1.WorkspaceRolesGuard),
    (0, swagger_1.ApiOperation)({
        summary: 'Change member role',
        description: 'Chi OWNER duoc doi role. Khong cho doi sang OWNER.',
    }),
    (0, swagger_1.ApiParam)({ name: 'workspaceId', example: 'workspace-uuid' }),
    (0, swagger_1.ApiParam)({ name: 'memberId', example: 'member-uuid' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('workspaceId')),
    __param(2, (0, common_1.Param)('memberId')),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, change_member_role_dto_1.ChangeMemberRoleDto]),
    __metadata("design:returntype", void 0)
], MembersController.prototype, "changeMemberRole", null);
__decorate([
    (0, common_1.Patch)(':memberId/remove'),
    (0, workspace_roles_decorator_1.WorkspaceRoles)(workspace_role_enum_1.WorkspaceRole.Owner),
    (0, common_1.UseGuards)(workspace_roles_guard_1.WorkspaceRolesGuard),
    (0, swagger_1.ApiOperation)({
        summary: 'Remove workspace member',
        description: 'Chi OWNER duoc remove. He thong set status = REMOVED.',
    }),
    (0, swagger_1.ApiParam)({ name: 'workspaceId', example: 'workspace-uuid' }),
    (0, swagger_1.ApiParam)({ name: 'memberId', example: 'member-uuid' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('workspaceId')),
    __param(2, (0, common_1.Param)('memberId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", void 0)
], MembersController.prototype, "removeMember", null);
__decorate([
    (0, common_1.Patch)(':memberId/capacity'),
    (0, common_1.UseGuards)(workspace_member_guard_1.WorkspaceMemberGuard),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('workspaceId')),
    __param(2, (0, common_1.Param)('memberId')),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, update_member_capacity_dto_1.UpdateMemberCapacityDto]),
    __metadata("design:returntype", void 0)
], MembersController.prototype, "updateCapacity", null);
exports.MembersController = MembersController = __decorate([
    (0, common_1.Controller)('workspaces/:workspaceId/members'),
    (0, swagger_1.ApiTags)('Members'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(access_token_guard_1.AccessTokenGuard),
    __metadata("design:paramtypes", [members_service_1.MembersService])
], MembersController);
//# sourceMappingURL=members.controller.js.map