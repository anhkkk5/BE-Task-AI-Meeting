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
Object.defineProperty(exports, "__esModule", { value: true });
exports.MembersService = void 0;
const common_1 = require("@nestjs/common");
const workspace_member_status_enum_1 = require("../../../common/enums/workspace-member-status.enum");
const workspace_role_enum_1 = require("../../../common/enums/workspace-role.enum");
const user_status_enum_1 = require("../../users/enums/user-status.enum");
const users_service_1 = require("../../users/services/users.service");
const workspace_members_repository_1 = require("../../workspaces/repositories/workspace-members.repository");
const workspace_access_service_1 = require("../../workspaces/services/workspace-access.service");
let MembersService = class MembersService {
    usersService;
    workspaceAccessService;
    workspaceMembersRepository;
    constructor(usersService, workspaceAccessService, workspaceMembersRepository) {
        this.usersService = usersService;
        this.workspaceAccessService = workspaceAccessService;
        this.workspaceMembersRepository = workspaceMembersRepository;
    }
    async getMembers(currentUserId, workspaceId) {
        await this.workspaceAccessService.assertWorkspaceMember(currentUserId, workspaceId);
        const members = await this.workspaceMembersRepository.findActiveByWorkspace(workspaceId);
        return {
            success: true,
            message: 'Get workspace members successfully',
            data: {
                items: members.map((member) => this.toMemberResponse(member)),
            },
        };
    }
    async updateCapacity(currentUserId, workspaceId, memberId, dto) {
        const current = await this.workspaceAccessService.assertWorkspaceMember(currentUserId, workspaceId);
        const target = await this.workspaceMembersRepository.findByIdAndWorkspace(memberId, workspaceId);
        if (!target || target.status !== workspace_member_status_enum_1.WorkspaceMemberStatus.Active)
            throw new common_1.NotFoundException('Workspace member not found');
        const managers = [
            workspace_role_enum_1.WorkspaceRole.Owner,
            workspace_role_enum_1.WorkspaceRole.ScrumMaster,
            workspace_role_enum_1.WorkspaceRole.ProjectManager,
        ];
        if (target.userId !== currentUserId && !managers.includes(current.role))
            throw new common_1.BadRequestException('You can only update your own capacity');
        const unavailableDates = [...new Set(dto.unavailableDates ?? [])].sort();
        const member = await this.workspaceMembersRepository.updateMember(target, {
            dailyCapacityHours: dto.dailyCapacityHours,
            unavailableDates,
        });
        return {
            success: true,
            message: 'Update member capacity successfully',
            data: { member: this.toMemberResponse(member) },
        };
    }
    async addMember(currentUserId, workspaceId, dto) {
        await this.workspaceAccessService.assertWorkspaceOwner(currentUserId, workspaceId);
        await this.workspaceAccessService.assertWorkspaceActive(workspaceId);
        const user = await this.usersService.findByEmail(dto.email.trim().toLowerCase());
        if (!user) {
            throw new common_1.NotFoundException('User with this email does not exist');
        }
        const existingMember = await this.workspaceMembersRepository.findByWorkspaceAndUser(workspaceId, user.id);
        if (existingMember?.status === workspace_member_status_enum_1.WorkspaceMemberStatus.Active) {
            throw new common_1.ConflictException('User is already a member of this workspace');
        }
        const member = existingMember
            ? await this.workspaceMembersRepository.updateMember(existingMember, {
                role: dto.role,
                status: workspace_member_status_enum_1.WorkspaceMemberStatus.Active,
                joinedAt: new Date(),
            })
            : await this.workspaceMembersRepository.createMember({
                workspaceId,
                userId: user.id,
                role: dto.role,
            });
        member.user = user;
        await this.workspaceAccessService.invalidateMembership(user.id, workspaceId);
        return {
            success: true,
            message: 'Add member successfully',
            data: {
                member: this.toMemberResponse(member),
            },
        };
    }
    async lookupMember(currentUserId, workspaceId, email) {
        await this.workspaceAccessService.assertWorkspaceOwner(currentUserId, workspaceId);
        await this.workspaceAccessService.assertWorkspaceActive(workspaceId);
        const normalizedEmail = email.trim().toLowerCase();
        const user = await this.usersService.findByEmail(normalizedEmail);
        if (!user) {
            return this.lookupResponse(null, null, false, 'USER_NOT_FOUND');
        }
        const existingMember = await this.workspaceMembersRepository.findByWorkspaceAndUser(workspaceId, user.id);
        if (existingMember) {
            existingMember.user = user;
        }
        if (user.status !== user_status_enum_1.UserStatus.Active) {
            return this.lookupResponse(user, existingMember, false, 'USER_NOT_ACTIVE');
        }
        if (existingMember?.status === workspace_member_status_enum_1.WorkspaceMemberStatus.Active) {
            return this.lookupResponse(user, existingMember, false, 'ALREADY_ACTIVE_MEMBER');
        }
        return this.lookupResponse(user, existingMember, true, existingMember?.status === workspace_member_status_enum_1.WorkspaceMemberStatus.Removed
            ? 'REMOVED_MEMBER_CAN_BE_REACTIVATED'
            : null);
    }
    async changeMemberRole(currentUserId, workspaceId, memberId, dto) {
        await this.workspaceAccessService.assertWorkspaceOwner(currentUserId, workspaceId);
        await this.workspaceAccessService.assertWorkspaceActive(workspaceId);
        const member = await this.findMemberOrFail(workspaceId, memberId);
        await this.assertNotLastOwner(member, 'Cannot change role of the last owner');
        const updatedMember = await this.workspaceMembersRepository.updateMember(member, {
            role: dto.role,
        });
        await this.workspaceAccessService.invalidateMembership(member.userId, workspaceId);
        return {
            success: true,
            message: 'Change member role successfully',
            data: {
                member: this.toMemberResponse(updatedMember),
            },
        };
    }
    async removeMember(currentUserId, workspaceId, memberId) {
        await this.workspaceAccessService.assertWorkspaceOwner(currentUserId, workspaceId);
        await this.workspaceAccessService.assertWorkspaceActive(workspaceId);
        const member = await this.findMemberOrFail(workspaceId, memberId);
        await this.assertNotLastOwner(member, 'Cannot remove the last owner of workspace');
        await this.workspaceMembersRepository.updateMember(member, {
            status: workspace_member_status_enum_1.WorkspaceMemberStatus.Removed,
        });
        await this.workspaceAccessService.invalidateMembership(member.userId, workspaceId);
        return {
            success: true,
            message: 'Remove member successfully',
            data: null,
        };
    }
    async getMyRole(currentUserId, workspaceId) {
        const member = await this.workspaceAccessService.assertWorkspaceMember(currentUserId, workspaceId);
        return {
            success: true,
            message: 'Get my workspace role successfully',
            data: {
                workspaceId,
                userId: currentUserId,
                role: member.role,
                status: member.status,
            },
        };
    }
    async findMemberOrFail(workspaceId, memberId) {
        const member = await this.workspaceMembersRepository.findByIdAndWorkspace(memberId, workspaceId);
        if (!member || member.status !== workspace_member_status_enum_1.WorkspaceMemberStatus.Active) {
            throw new common_1.NotFoundException('Workspace member not found');
        }
        return member;
    }
    async assertNotLastOwner(member, message) {
        if (member.role !== workspace_role_enum_1.WorkspaceRole.Owner) {
            return;
        }
        const ownerCount = await this.workspaceMembersRepository.countActiveOwners(member.workspaceId);
        if (ownerCount <= 1) {
            throw new common_1.BadRequestException(message);
        }
    }
    toMemberResponse(member) {
        return {
            memberId: member.id,
            userId: member.userId,
            fullName: member.user?.fullName ?? null,
            email: member.user?.email ?? null,
            avatarUrl: member.user?.avatarUrl ?? null,
            role: member.role,
            status: member.status,
            joinedAt: member.joinedAt,
            dailyCapacityHours: member.dailyCapacityHours ?? 8,
            unavailableDates: member.unavailableDates ?? [],
        };
    }
    lookupResponse(user, existingMember, canAdd, reason) {
        return {
            success: true,
            message: 'Lookup member successfully',
            data: {
                user: user ? this.toUserLookupResponse(user) : null,
                existingMember: existingMember
                    ? this.toMemberResponse(existingMember)
                    : null,
                canAdd,
                reason,
            },
        };
    }
    toUserLookupResponse(user) {
        return {
            id: user.id,
            email: user.email,
            fullName: user.fullName,
            avatarUrl: user.avatarUrl,
            jobTitle: user.jobTitle,
            status: user.status,
        };
    }
};
exports.MembersService = MembersService;
exports.MembersService = MembersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [users_service_1.UsersService,
        workspace_access_service_1.WorkspaceAccessService,
        workspace_members_repository_1.WorkspaceMembersRepository])
], MembersService);
//# sourceMappingURL=members.service.js.map