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
exports.StatsRepository = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const sprint_status_enum_1 = require("../../../common/enums/sprint-status.enum");
const workspace_member_status_enum_1 = require("../../../common/enums/workspace-member-status.enum");
const meeting_entity_1 = require("../../meetings/entities/meeting.entity");
const project_entity_1 = require("../../projects/entities/project.entity");
const sprint_entity_1 = require("../../sprints/entities/sprint.entity");
const task_entity_1 = require("../../tasks/entities/task.entity");
const workspace_member_entity_1 = require("../../workspaces/entities/workspace-member.entity");
let StatsRepository = class StatsRepository {
    workspaceMembersRepository;
    projectsRepository;
    tasksRepository;
    sprintsRepository;
    meetingsRepository;
    constructor(workspaceMembersRepository, projectsRepository, tasksRepository, sprintsRepository, meetingsRepository) {
        this.workspaceMembersRepository = workspaceMembersRepository;
        this.projectsRepository = projectsRepository;
        this.tasksRepository = tasksRepository;
        this.sprintsRepository = sprintsRepository;
        this.meetingsRepository = meetingsRepository;
    }
    countProjectsByWorkspace(workspaceIds) {
        return this.projectsRepository
            .createQueryBuilder('project')
            .select('project.workspaceId', 'workspaceId')
            .addSelect('COUNT(project.id)', 'total')
            .where('project.workspaceId IN (:...workspaceIds)', { workspaceIds })
            .andWhere('project.deletedAt IS NULL')
            .groupBy('project.workspaceId')
            .getRawMany();
    }
    countMembersByWorkspace(workspaceIds) {
        return this.workspaceMembersRepository
            .createQueryBuilder('member')
            .select('member.workspaceId', 'workspaceId')
            .addSelect('COUNT(member.id)', 'total')
            .where('member.workspaceId IN (:...workspaceIds)', { workspaceIds })
            .andWhere('member.status = :status', {
            status: workspace_member_status_enum_1.WorkspaceMemberStatus.Active,
        })
            .groupBy('member.workspaceId')
            .getRawMany();
    }
    countTasksByWorkspace(workspaceIds) {
        return this.tasksRepository
            .createQueryBuilder('task')
            .innerJoin('task.project', 'project')
            .select('project.workspaceId', 'workspaceId')
            .addSelect('COUNT(task.id)', 'total')
            .where('project.workspaceId IN (:...workspaceIds)', { workspaceIds })
            .andWhere('task.deletedAt IS NULL')
            .andWhere('project.deletedAt IS NULL')
            .groupBy('project.workspaceId')
            .getRawMany();
    }
    countMeetingsByWorkspace(workspaceIds) {
        return this.meetingsRepository
            .createQueryBuilder('meeting')
            .select('meeting.workspaceId', 'workspaceId')
            .addSelect('COUNT(meeting.id)', 'total')
            .where('meeting.workspaceId IN (:...workspaceIds)', { workspaceIds })
            .andWhere('meeting.deletedAt IS NULL')
            .groupBy('meeting.workspaceId')
            .getRawMany();
    }
    async countDistinctMembers(workspaceIds) {
        const raw = await this.workspaceMembersRepository
            .createQueryBuilder('member')
            .select('COUNT(DISTINCT member.userId)', 'total')
            .where('member.workspaceId IN (:...workspaceIds)', { workspaceIds })
            .andWhere('member.status = :status', {
            status: workspace_member_status_enum_1.WorkspaceMemberStatus.Active,
        })
            .getRawOne();
        return Number(raw?.total ?? 0);
    }
    countProjectsByStatus(workspaceId) {
        return this.projectsRepository
            .createQueryBuilder('project')
            .select('project.status', 'status')
            .addSelect('COUNT(project.id)', 'total')
            .where('project.workspaceId = :workspaceId', { workspaceId })
            .andWhere('project.deletedAt IS NULL')
            .groupBy('project.status')
            .getRawMany();
    }
    countTasksByStatus(workspaceId) {
        return this.tasksRepository
            .createQueryBuilder('task')
            .innerJoin('task.project', 'project')
            .innerJoin('workflow_statuses', 'workflowStatus', 'workflowStatus.id = task.workflow_status_id')
            .select('workflowStatus.status_key', 'status')
            .addSelect('COUNT(task.id)', 'total')
            .where('project.workspaceId = :workspaceId', { workspaceId })
            .andWhere('task.deletedAt IS NULL')
            .andWhere('project.deletedAt IS NULL')
            .groupBy('workflowStatus.status_key')
            .getRawMany();
    }
    findActiveSprint(workspaceId) {
        return this.sprintsRepository
            .createQueryBuilder('sprint')
            .innerJoinAndSelect('sprint.project', 'project')
            .where('project.workspaceId = :workspaceId', { workspaceId })
            .andWhere('sprint.status = :status', { status: sprint_status_enum_1.SprintStatus.Active })
            .andWhere('sprint.deletedAt IS NULL')
            .andWhere('project.deletedAt IS NULL')
            .orderBy('sprint.startDate', 'DESC')
            .getOne();
    }
    countSprintTasksByStatus(sprintId) {
        return this.tasksRepository
            .createQueryBuilder('task')
            .innerJoin('workflow_statuses', 'workflowStatus', 'workflowStatus.id = task.workflow_status_id')
            .select('workflowStatus.status_key', 'status')
            .addSelect('COUNT(task.id)', 'total')
            .where('task.sprintId = :sprintId', { sprintId })
            .andWhere('task.deletedAt IS NULL')
            .groupBy('workflowStatus.status_key')
            .getRawMany();
    }
    findUpcomingTasks(workspaceId, limit) {
        return this.tasksRepository
            .createQueryBuilder('task')
            .innerJoinAndSelect('task.project', 'project')
            .innerJoin('workflow_statuses', 'workflowStatus', 'workflowStatus.id = task.workflow_status_id')
            .leftJoinAndSelect('task.assignee', 'assignee')
            .where('project.workspaceId = :workspaceId', { workspaceId })
            .andWhere('task.dueDate IS NOT NULL')
            .andWhere('workflowStatus.category != :doneCategory', { doneCategory: 'DONE' })
            .andWhere('task.deletedAt IS NULL')
            .andWhere('project.deletedAt IS NULL')
            .orderBy('task.dueDate', 'ASC')
            .limit(limit)
            .getMany();
    }
    countCompletedTasksByDay(workspaceId, fromDate) {
        return this.tasksRepository
            .createQueryBuilder('task')
            .innerJoin('task.project', 'project')
            .innerJoin('workflow_statuses', 'workflowStatus', 'workflowStatus.id = task.workflow_status_id')
            .select('DATE(task.updated_at)', 'day')
            .addSelect('COUNT(task.id)', 'total')
            .where('project.workspace_id = :workspaceId', { workspaceId })
            .andWhere('workflowStatus.category = :doneCategory', { doneCategory: 'DONE' })
            .andWhere('task.updated_at >= :fromDate', { fromDate })
            .andWhere('task.deletedAt IS NULL')
            .andWhere('project.deletedAt IS NULL')
            .groupBy('DATE(task.updated_at)')
            .getRawMany();
    }
    async countUpcomingMeetings(workspaceId, fromDate) {
        const raw = await this.meetingsRepository
            .createQueryBuilder('meeting')
            .select('COUNT(meeting.id)', 'total')
            .where('meeting.workspace_id = :workspaceId', { workspaceId })
            .andWhere('meeting.meeting_date >= :fromDate', { fromDate })
            .andWhere('meeting.deletedAt IS NULL')
            .getRawOne();
        return Number(raw?.total ?? 0);
    }
};
exports.StatsRepository = StatsRepository;
exports.StatsRepository = StatsRepository = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(workspace_member_entity_1.WorkspaceMember)),
    __param(1, (0, typeorm_1.InjectRepository)(project_entity_1.Project)),
    __param(2, (0, typeorm_1.InjectRepository)(task_entity_1.Task)),
    __param(3, (0, typeorm_1.InjectRepository)(sprint_entity_1.Sprint)),
    __param(4, (0, typeorm_1.InjectRepository)(meeting_entity_1.Meeting)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], StatsRepository);
//# sourceMappingURL=stats.repository.js.map