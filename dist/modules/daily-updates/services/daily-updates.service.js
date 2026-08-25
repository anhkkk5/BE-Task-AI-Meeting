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
exports.DailyUpdatesService = void 0;
const common_1 = require("@nestjs/common");
const workspace_access_service_1 = require("../../workspaces/services/workspace-access.service");
const project_access_service_1 = require("../../projects/services/project-access.service");
const sprint_access_service_1 = require("../../sprints/services/sprint-access.service");
const daily_updates_repository_1 = require("../repositories/daily-updates.repository");
const daily_update_access_service_1 = require("./daily-update-access.service");
const daily_update_submission_status_enum_1 = require("../../../common/enums/daily-update-submission-status.enum");
let DailyUpdatesService = class DailyUpdatesService {
    dailyUpdatesRepository;
    dailyUpdateAccessService;
    workspaceAccessService;
    projectAccessService;
    sprintAccessService;
    constructor(dailyUpdatesRepository, dailyUpdateAccessService, workspaceAccessService, projectAccessService, sprintAccessService) {
        this.dailyUpdatesRepository = dailyUpdatesRepository;
        this.dailyUpdateAccessService = dailyUpdateAccessService;
        this.workspaceAccessService = workspaceAccessService;
        this.projectAccessService = projectAccessService;
        this.sprintAccessService = sprintAccessService;
    }
    async createDailyUpdate(currentUserId, workspaceId, projectId, dto) {
        await this.workspaceAccessService.assertWorkspaceActive(workspaceId);
        await this.dailyUpdateAccessService.assertCanWriteDailyUpdate(currentUserId, workspaceId);
        await this.projectAccessService.assertProjectActive(projectId, workspaceId);
        if (dto.sprintId) {
            await this.sprintAccessService.assertSprintInProject(dto.sprintId, projectId);
        }
        const updateDate = this.normalizeDate(dto.updateDate);
        const duplicate = await this.dailyUpdatesRepository.findDuplicate(workspaceId, projectId, currentUserId, updateDate);
        if (duplicate &&
            ![
                daily_update_submission_status_enum_1.DailyUpdateSubmissionStatus.PendingReview,
                daily_update_submission_status_enum_1.DailyUpdateSubmissionStatus.Missed,
            ].includes(duplicate.submissionStatus)) {
            throw new common_1.ConflictException('Daily update already exists for this date');
        }
        await this.assertNeedHelpFromMember(dto.needHelpFromId, workspaceId, currentUserId);
        const submittedData = {
            sprintId: dto.sprintId ?? null,
            yesterdayWork: dto.yesterdayWork.trim(),
            todayPlan: dto.todayPlan.trim(),
            blockers: this.optionalText(dto.blockers),
            needHelpFromId: dto.needHelpFromId ?? null,
            notes: this.optionalText(dto.notes),
            mood: dto.mood ?? null,
            submissionStatus: daily_update_submission_status_enum_1.DailyUpdateSubmissionStatus.Submitted,
            submittedAt: new Date(),
        };
        const dailyUpdate = duplicate
            ? await this.dailyUpdatesRepository.update(duplicate, submittedData)
            : await this.dailyUpdatesRepository.create({
                workspaceId,
                projectId,
                userId: currentUserId,
                updateDate,
                generatedByAi: false,
                ...submittedData,
            });
        return {
            success: true,
            message: 'Create daily update successfully',
            data: {
                dailyUpdate: this.toDailyUpdateResponse(dailyUpdate),
            },
        };
    }
    async getMyReviewDraft(currentUserId, workspaceId, projectId, updateDate) {
        await this.workspaceAccessService.assertWorkspaceMember(currentUserId, workspaceId);
        await this.projectAccessService.assertProjectInWorkspace(projectId, workspaceId);
        const draft = await this.dailyUpdatesRepository.findReviewDraft(projectId, currentUserId, this.normalizeDate(updateDate));
        return {
            success: true,
            message: 'Get pending daily update draft successfully',
            data: { draft: draft ? this.toDailyUpdateResponse(draft) : null },
        };
    }
    async getMyDailyUpdates(currentUserId, workspaceId, projectId, query) {
        await this.workspaceAccessService.assertWorkspaceMember(currentUserId, workspaceId);
        await this.projectAccessService.assertProjectInWorkspace(projectId, workspaceId);
        await this.assertValidDailyUpdateFilters(projectId, workspaceId, query, {
            validateMember: false,
        });
        const result = await this.dailyUpdatesRepository.findMy(projectId, currentUserId, query);
        return {
            success: true,
            message: 'Get my daily updates successfully',
            data: {
                items: result.items.map((dailyUpdate) => this.toDailyUpdateResponse(dailyUpdate)),
                meta: {
                    total: result.total,
                    page: result.page,
                    limit: result.limit,
                },
            },
        };
    }
    async getTeamDailyUpdates(currentUserId, workspaceId, projectId, query) {
        await this.workspaceAccessService.assertWorkspaceMember(currentUserId, workspaceId);
        await this.dailyUpdateAccessService.assertCanViewTeamDailyUpdates(currentUserId, workspaceId);
        await this.projectAccessService.assertProjectInWorkspace(projectId, workspaceId);
        await this.assertValidDailyUpdateFilters(projectId, workspaceId, query, {
            validateMember: true,
        });
        const result = await this.dailyUpdatesRepository.findTeam(projectId, query);
        return {
            success: true,
            message: 'Get team daily updates successfully',
            data: {
                items: result.items.map((dailyUpdate) => this.toDailyUpdateResponse(dailyUpdate)),
                meta: {
                    total: result.total,
                    page: result.page,
                    limit: result.limit,
                },
            },
        };
    }
    async getDailyUpdateDetail(currentUserId, workspaceId, projectId, dailyUpdateId) {
        await this.workspaceAccessService.assertWorkspaceMember(currentUserId, workspaceId);
        await this.projectAccessService.assertProjectInWorkspace(projectId, workspaceId);
        const dailyUpdate = await this.dailyUpdateAccessService.assertDailyUpdateInProject(dailyUpdateId, projectId);
        if (dailyUpdate.submissionStatus &&
            dailyUpdate.submissionStatus !== daily_update_submission_status_enum_1.DailyUpdateSubmissionStatus.Submitted &&
            dailyUpdate.userId !== currentUserId) {
            throw new common_1.NotFoundException('Daily update not found');
        }
        await this.dailyUpdateAccessService.assertCanViewDailyUpdate(currentUserId, workspaceId, dailyUpdate);
        return {
            success: true,
            message: 'Get daily update detail successfully',
            data: {
                dailyUpdate: this.toDailyUpdateResponse(dailyUpdate),
            },
        };
    }
    async updateDailyUpdate(currentUserId, workspaceId, projectId, dailyUpdateId, dto) {
        await this.workspaceAccessService.assertWorkspaceActive(workspaceId);
        await this.dailyUpdateAccessService.assertCanWriteDailyUpdate(currentUserId, workspaceId);
        await this.projectAccessService.assertProjectInWorkspace(projectId, workspaceId);
        const dailyUpdate = await this.dailyUpdateAccessService.assertDailyUpdateInProject(dailyUpdateId, projectId);
        this.dailyUpdateAccessService.assertCanEditDailyUpdate(currentUserId, dailyUpdate);
        if (dto.sprintId) {
            await this.sprintAccessService.assertSprintInProject(dto.sprintId, projectId);
        }
        await this.assertNeedHelpFromMember(dto.needHelpFromId, workspaceId, currentUserId);
        const updatedDailyUpdate = await this.dailyUpdatesRepository.update(dailyUpdate, {
            sprintId: dto.sprintId === undefined ? dailyUpdate.sprintId : dto.sprintId,
            yesterdayWork: dto.yesterdayWork === undefined
                ? dailyUpdate.yesterdayWork
                : dto.yesterdayWork.trim(),
            todayPlan: dto.todayPlan === undefined
                ? dailyUpdate.todayPlan
                : dto.todayPlan.trim(),
            blockers: dto.blockers === undefined
                ? dailyUpdate.blockers
                : this.optionalText(dto.blockers),
            needHelpFromId: dto.needHelpFromId === undefined
                ? dailyUpdate.needHelpFromId
                : (dto.needHelpFromId ?? null),
            notes: dto.notes === undefined
                ? dailyUpdate.notes
                : this.optionalText(dto.notes),
            mood: dto.mood === undefined ? dailyUpdate.mood : dto.mood,
        });
        return {
            success: true,
            message: 'Update daily update successfully',
            data: {
                dailyUpdate: this.toDailyUpdateResponse(updatedDailyUpdate),
            },
        };
    }
    async archiveDailyUpdate(currentUserId, workspaceId, projectId, dailyUpdateId) {
        await this.workspaceAccessService.assertWorkspaceActive(workspaceId);
        await this.dailyUpdateAccessService.assertCanWriteDailyUpdate(currentUserId, workspaceId);
        await this.projectAccessService.assertProjectInWorkspace(projectId, workspaceId);
        const dailyUpdate = await this.dailyUpdateAccessService.assertDailyUpdateInProject(dailyUpdateId, projectId);
        this.dailyUpdateAccessService.assertCanEditDailyUpdate(currentUserId, dailyUpdate);
        await this.dailyUpdatesRepository.archive(dailyUpdate);
        return {
            success: true,
            message: 'Archive daily update successfully',
            data: null,
        };
    }
    async assertValidDailyUpdateFilters(projectId, workspaceId, query, options) {
        if (query.fromDate && query.toDate) {
            const fromDate = this.normalizeDate(query.fromDate);
            const toDate = this.normalizeDate(query.toDate);
            if (fromDate > toDate) {
                throw new common_1.BadRequestException('fromDate must be before or equal to toDate');
            }
        }
        if (query.sprintId) {
            await this.sprintAccessService.assertSprintInProject(query.sprintId, projectId);
        }
        if (options.validateMember && query.memberId) {
            await this.workspaceAccessService.assertWorkspaceMember(query.memberId, workspaceId);
        }
    }
    async assertNeedHelpFromMember(needHelpFromId, workspaceId, currentUserId) {
        if (!needHelpFromId) {
            return;
        }
        if (needHelpFromId === currentUserId) {
            throw new common_1.BadRequestException('Khong the tu nho chinh minh ho tro');
        }
        await this.workspaceAccessService.assertWorkspaceMember(needHelpFromId, workspaceId);
    }
    normalizeDate(value) {
        return value.slice(0, 10);
    }
    optionalText(value) {
        if (value === null || value === undefined) {
            return null;
        }
        const trimmedValue = value.trim();
        return trimmedValue.length ? trimmedValue : null;
    }
    toDailyUpdateResponse(dailyUpdate) {
        return {
            id: dailyUpdate.id,
            workspaceId: dailyUpdate.workspaceId,
            projectId: dailyUpdate.projectId,
            sprintId: dailyUpdate.sprintId,
            userId: dailyUpdate.userId,
            user: dailyUpdate.user
                ? {
                    id: dailyUpdate.user.id,
                    fullName: dailyUpdate.user.fullName,
                    email: dailyUpdate.user.email,
                    avatarUrl: dailyUpdate.user.avatarUrl,
                }
                : null,
            sprint: dailyUpdate.sprint
                ? {
                    id: dailyUpdate.sprint.id,
                    name: dailyUpdate.sprint.name,
                    status: dailyUpdate.sprint.status,
                }
                : null,
            updateDate: dailyUpdate.updateDate,
            yesterdayWork: dailyUpdate.yesterdayWork,
            todayPlan: dailyUpdate.todayPlan,
            blockers: dailyUpdate.blockers,
            needHelpFromId: dailyUpdate.needHelpFromId,
            needHelpFrom: dailyUpdate.needHelpFrom
                ? {
                    id: dailyUpdate.needHelpFrom.id,
                    fullName: dailyUpdate.needHelpFrom.fullName,
                    email: dailyUpdate.needHelpFrom.email,
                    avatarUrl: dailyUpdate.needHelpFrom.avatarUrl,
                }
                : null,
            notes: dailyUpdate.notes,
            mood: dailyUpdate.mood,
            submissionStatus: dailyUpdate.submissionStatus,
            generatedByAi: dailyUpdate.generatedByAi,
            submittedAt: dailyUpdate.submittedAt,
            createdAt: dailyUpdate.createdAt,
            updatedAt: dailyUpdate.updatedAt,
        };
    }
};
exports.DailyUpdatesService = DailyUpdatesService;
exports.DailyUpdatesService = DailyUpdatesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [daily_updates_repository_1.DailyUpdatesRepository,
        daily_update_access_service_1.DailyUpdateAccessService,
        workspace_access_service_1.WorkspaceAccessService,
        project_access_service_1.ProjectAccessService,
        sprint_access_service_1.SprintAccessService])
], DailyUpdatesService);
//# sourceMappingURL=daily-updates.service.js.map