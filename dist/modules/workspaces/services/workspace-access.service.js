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
exports.WorkspaceAccessService = void 0;
const common_1 = require("@nestjs/common");
const workspace_role_enum_1 = require("../../../common/enums/workspace-role.enum");
const workspace_status_enum_1 = require("../../../common/enums/workspace-status.enum");
const workspace_members_repository_1 = require("../repositories/workspace-members.repository");
const workspaces_repository_1 = require("../repositories/workspaces.repository");
const MEMBERSHIP_CACHE_TTL_MS = 15_000;
const MEMBERSHIP_CACHE_MAX_ENTRIES = 5_000;
let WorkspaceAccessService = class WorkspaceAccessService {
    workspacesRepository;
    workspaceMembersRepository;
    membershipCache = new Map();
    constructor(workspacesRepository, workspaceMembersRepository) {
        this.workspacesRepository = workspacesRepository;
        this.workspaceMembersRepository = workspaceMembersRepository;
    }
    async getMembershipSnapshot(userId, workspaceId) {
        const cacheKey = this.buildMembershipCacheKey(userId, workspaceId);
        const cached = this.membershipCache.get(cacheKey);
        if (cached && cached.expiresAt > Date.now()) {
            return cached.snapshot;
        }
        const member = await this.workspaceMembersRepository.findActiveByWorkspaceAndUser(workspaceId, userId);
        const snapshot = member
            ? { role: member.role, status: member.status }
            : null;
        this.writeCache(cacheKey, snapshot);
        return snapshot;
    }
    async getUserWorkspaceRole(userId, workspaceId) {
        const snapshot = await this.getMembershipSnapshot(userId, workspaceId);
        return snapshot?.role ?? null;
    }
    async isWorkspaceMember(userId, workspaceId) {
        const role = await this.getUserWorkspaceRole(userId, workspaceId);
        return Boolean(role);
    }
    async assertWorkspaceMembership(userId, workspaceId) {
        const snapshot = await this.getMembershipSnapshot(userId, workspaceId);
        if (!snapshot) {
            throw new common_1.ForbiddenException('You do not have access to this workspace');
        }
        return snapshot;
    }
    async assertWorkspaceMember(userId, workspaceId) {
        const member = await this.workspaceMembersRepository.findActiveByWorkspaceAndUser(workspaceId, userId);
        if (!member) {
            throw new common_1.ForbiddenException('You do not have access to this workspace');
        }
        return member;
    }
    async assertWorkspaceOwner(userId, workspaceId) {
        const member = await this.assertWorkspaceMember(userId, workspaceId);
        if (member.role !== workspace_role_enum_1.WorkspaceRole.Owner) {
            throw new common_1.ForbiddenException('Only workspace owner can perform this action');
        }
        return member;
    }
    async assertWorkspaceActive(workspaceId) {
        const workspace = await this.workspacesRepository.findById(workspaceId);
        if (!workspace) {
            throw new common_1.NotFoundException('Workspace not found');
        }
        if (workspace.status !== workspace_status_enum_1.WorkspaceStatus.Active) {
            throw new common_1.ForbiddenException('Workspace is archived');
        }
        return workspace;
    }
    invalidateMembership(userId, workspaceId) {
        this.membershipCache.delete(this.buildMembershipCacheKey(userId, workspaceId));
    }
    buildMembershipCacheKey(userId, workspaceId) {
        return `${workspaceId}:${userId}`;
    }
    writeCache(cacheKey, snapshot) {
        if (this.membershipCache.size >= MEMBERSHIP_CACHE_MAX_ENTRIES) {
            this.evictExpiredEntries();
        }
        this.membershipCache.set(cacheKey, {
            snapshot,
            expiresAt: Date.now() + MEMBERSHIP_CACHE_TTL_MS,
        });
    }
    evictExpiredEntries() {
        const now = Date.now();
        for (const [key, entry] of this.membershipCache) {
            if (entry.expiresAt <= now) {
                this.membershipCache.delete(key);
            }
        }
        if (this.membershipCache.size >= MEMBERSHIP_CACHE_MAX_ENTRIES) {
            this.membershipCache.clear();
        }
    }
};
exports.WorkspaceAccessService = WorkspaceAccessService;
exports.WorkspaceAccessService = WorkspaceAccessService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [workspaces_repository_1.WorkspacesRepository,
        workspace_members_repository_1.WorkspaceMembersRepository])
], WorkspaceAccessService);
//# sourceMappingURL=workspace-access.service.js.map