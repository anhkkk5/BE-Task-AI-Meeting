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
exports.WorkspaceMembersRepository = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const workspace_member_status_enum_1 = require("../../../common/enums/workspace-member-status.enum");
const workspace_role_enum_1 = require("../../../common/enums/workspace-role.enum");
const workspace_member_entity_1 = require("../entities/workspace-member.entity");
let WorkspaceMembersRepository = class WorkspaceMembersRepository {
    repository;
    constructor(repository) {
        this.repository = repository;
    }
    createOwnerMember(data, manager) {
        const repository = this.getRepository(manager);
        const member = repository.create({
            workspaceId: data.workspaceId,
            userId: data.userId,
            role: workspace_role_enum_1.WorkspaceRole.Owner,
            status: workspace_member_status_enum_1.WorkspaceMemberStatus.Active,
            joinedAt: new Date(),
        });
        return repository.save(member);
    }
    findActiveByWorkspaceAndUser(workspaceId, userId) {
        return this.repository.findOne({
            where: {
                workspaceId,
                userId,
                status: workspace_member_status_enum_1.WorkspaceMemberStatus.Active,
            },
        });
    }
    findActiveByUser(userId, status) {
        const query = this.repository
            .createQueryBuilder('member')
            .innerJoinAndSelect('member.workspace', 'workspace')
            .where('member.userId = :userId', { userId })
            .andWhere('member.status = :memberStatus', {
            memberStatus: workspace_member_status_enum_1.WorkspaceMemberStatus.Active,
        })
            .andWhere('workspace.deletedAt IS NULL');
        if (status) {
            query.andWhere('workspace.status = :status', { status });
        }
        return query.orderBy('workspace.createdAt', 'DESC').getMany();
    }
    getRepository(manager) {
        return manager ? manager.getRepository(workspace_member_entity_1.WorkspaceMember) : this.repository;
    }
};
exports.WorkspaceMembersRepository = WorkspaceMembersRepository;
exports.WorkspaceMembersRepository = WorkspaceMembersRepository = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(workspace_member_entity_1.WorkspaceMember)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], WorkspaceMembersRepository);
//# sourceMappingURL=workspace-members.repository.js.map