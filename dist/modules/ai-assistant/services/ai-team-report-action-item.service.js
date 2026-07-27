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
exports.AiTeamReportActionItemService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const ai_report_review_status_enum_1 = require("../../../common/enums/ai-report-review-status.enum");
const ai_report_type_enum_1 = require("../../../common/enums/ai-report-type.enum");
const team_report_action_item_status_enum_1 = require("../../../common/enums/team-report-action-item-status.enum");
const project_access_service_1 = require("../../projects/services/project-access.service");
const tasks_repository_1 = require("../../tasks/repositories/tasks.repository");
const tasks_service_1 = require("../../tasks/services/tasks.service");
const workspace_members_repository_1 = require("../../workspaces/repositories/workspace-members.repository");
const team_report_action_items_repository_1 = require("../repositories/team-report-action-items.repository");
const ai_report_schema_1 = require("../schemas/ai-report.schema");
const ai_report_access_service_1 = require("./ai-report-access.service");
let AiTeamReportActionItemService = class AiTeamReportActionItemService {
    aiReportModel;
    actionItemsRepository;
    aiReportAccessService;
    projectAccessService;
    tasksService;
    tasksRepository;
    workspaceMembers;
    constructor(aiReportModel, actionItemsRepository, aiReportAccessService, projectAccessService, tasksService, tasksRepository, workspaceMembers) {
        this.aiReportModel = aiReportModel;
        this.actionItemsRepository = actionItemsRepository;
        this.aiReportAccessService = aiReportAccessService;
        this.projectAccessService = projectAccessService;
        this.tasksService = tasksService;
        this.tasksRepository = tasksRepository;
        this.workspaceMembers = workspaceMembers;
    }
    async getActionItems(currentUserId, workspaceId, projectId, reportId) {
        const { report, canManage } = await this.findReportForRead(currentUserId, workspaceId, projectId, reportId);
        const records = await this.actionItemsRepository.findByReport(reportId);
        const recordsByKey = new Map(records.map((record) => [
            this.buildKey(record.source, record.itemIndex),
            record,
        ]));
        const output = report.aiOutput;
        return {
            success: true,
            message: 'Lay danh sach de xuat tu bao cao giao ban thanh cong',
            data: {
                items: [
                    ...this.collectItems(output.blockers ?? [], team_report_action_item_status_enum_1.TeamReportActionItemSource.Blocker, recordsByKey),
                    ...this.collectItems(output.recommendations ?? [], team_report_action_item_status_enum_1.TeamReportActionItemSource.Recommendation, recordsByKey),
                ],
                canHandle: canManage,
            },
        };
    }
    async createTaskFromActionItem(currentUserId, workspaceId, projectId, reportId, dto) {
        const { report, itemText } = await this.findPendingItem(currentUserId, workspaceId, projectId, reportId, dto.source, dto.itemIndex);
        const taskResult = await this.tasksService.createTask(currentUserId, workspaceId, projectId, {
            title: dto.title?.trim() || this.buildTaskTitle(itemText),
            description: this.buildTaskDescription(itemText, report.reportDate),
            assigneeId: dto.assigneeId,
            sprintId: dto.sprintId,
            dueDate: dto.dueDate,
        });
        const task = taskResult.data.task;
        const record = await this.actionItemsRepository.save({
            workspaceId,
            projectId,
            reportId,
            source: dto.source,
            itemIndex: dto.itemIndex,
            itemText,
            status: team_report_action_item_status_enum_1.TeamReportActionItemStatus.TaskCreated,
            createdTaskId: task.id,
            targetTaskId: null,
            suggestedReceiverId: null,
            handoverId: null,
            note: null,
            handledBy: currentUserId,
            handledAt: new Date(),
        });
        return {
            success: true,
            message: 'Da tao task tu de xuat cua bao cao giao ban',
            data: {
                item: this.toItemResponse(dto.itemIndex, itemText, dto.source, record),
                task,
            },
        };
    }
    async requestHandoverFromActionItem(currentUserId, workspaceId, projectId, reportId, dto) {
        const { itemText } = await this.findPendingItem(currentUserId, workspaceId, projectId, reportId, dto.source, dto.itemIndex);
        const task = await this.tasksRepository.findByIdAndProject(dto.taskId, projectId);
        if (!task) {
            throw new common_1.NotFoundException('Khong tim thay task trong du an');
        }
        if (!task.assigneeId) {
            throw new common_1.BadRequestException('Task chua co nguoi phu trach nen chua the de nghi ban giao');
        }
        if (task.assigneeId === dto.suggestedReceiverId) {
            throw new common_1.BadRequestException('Nguoi nhan de xuat phai khac nguoi dang phu trach task');
        }
        await this.assertActiveMember(workspaceId, dto.suggestedReceiverId);
        const record = await this.actionItemsRepository.save({
            workspaceId,
            projectId,
            reportId,
            source: dto.source,
            itemIndex: dto.itemIndex,
            itemText,
            status: team_report_action_item_status_enum_1.TeamReportActionItemStatus.HandoverRequested,
            createdTaskId: null,
            targetTaskId: task.id,
            suggestedReceiverId: dto.suggestedReceiverId,
            handoverId: null,
            note: dto.note?.trim() || null,
            handledBy: currentUserId,
            handledAt: new Date(),
        });
        return {
            success: true,
            message: 'Da gui de nghi ban giao cho nguoi dang phu trach task',
            data: {
                item: this.toItemResponse(dto.itemIndex, itemText, dto.source, record),
            },
        };
    }
    async dismissActionItem(currentUserId, workspaceId, projectId, reportId, source, itemIndex, dto) {
        const { itemText } = await this.findPendingItem(currentUserId, workspaceId, projectId, reportId, source, itemIndex);
        const record = await this.actionItemsRepository.save({
            workspaceId,
            projectId,
            reportId,
            source,
            itemIndex,
            itemText,
            status: team_report_action_item_status_enum_1.TeamReportActionItemStatus.Dismissed,
            createdTaskId: null,
            targetTaskId: null,
            suggestedReceiverId: null,
            handoverId: null,
            note: dto.reason?.trim() || null,
            handledBy: currentUserId,
            handledAt: new Date(),
        });
        return {
            success: true,
            message: 'Da bo qua de xuat nay',
            data: {
                item: this.toItemResponse(itemIndex, itemText, source, record),
            },
        };
    }
    async findPendingItem(currentUserId, workspaceId, projectId, reportId, source, itemIndex) {
        const report = await this.findReportOrFail(currentUserId, workspaceId, projectId, reportId);
        const itemText = this.getItemText(report, source, itemIndex);
        const existing = await this.actionItemsRepository.findOne(reportId, source, itemIndex);
        if (existing && existing.status !== team_report_action_item_status_enum_1.TeamReportActionItemStatus.Pending) {
            throw new common_1.ConflictException(this.buildConflictMessage(existing.status));
        }
        return { report, itemText };
    }
    buildConflictMessage(status) {
        if (status === team_report_action_item_status_enum_1.TeamReportActionItemStatus.TaskCreated) {
            return 'De xuat nay da duoc tao thanh task';
        }
        if (status === team_report_action_item_status_enum_1.TeamReportActionItemStatus.HandoverRequested) {
            return 'De xuat nay da co de nghi ban giao';
        }
        return 'De xuat nay da bi bo qua';
    }
    async findReportOrFail(currentUserId, workspaceId, projectId, reportId) {
        await this.aiReportAccessService.assertCanUseTeamReports(currentUserId, workspaceId);
        return this.loadReport(workspaceId, projectId, reportId);
    }
    async findReportForRead(currentUserId, workspaceId, projectId, reportId) {
        const role = await this.aiReportAccessService.assertCanViewTeamReport(currentUserId, workspaceId);
        const canManage = this.aiReportAccessService.isManagerRole(role);
        const report = await this.loadReport(workspaceId, projectId, reportId);
        if (!canManage &&
            (0, ai_report_review_status_enum_1.normalizeReviewStatus)(report.reviewStatus) !==
                ai_report_review_status_enum_1.AiReportReviewStatus.Published) {
            throw new common_1.ForbiddenException('Báo cáo giao ban này chưa được phát hành cho cả nhóm');
        }
        return { report, canManage };
    }
    async loadReport(workspaceId, projectId, reportId) {
        const reportModel = this.getReportModel();
        await this.projectAccessService.assertProjectInWorkspace(projectId, workspaceId);
        const report = await reportModel.findById(reportId).exec();
        if (!report ||
            report.workspaceId !== workspaceId ||
            report.projectId !== projectId ||
            report.reportType !== ai_report_type_enum_1.AiReportType.TeamDailyReport) {
            throw new common_1.NotFoundException('Khong tim thay bao cao giao ban trong du an');
        }
        return report;
    }
    getItemText(report, source, itemIndex) {
        if (!Number.isInteger(itemIndex) || itemIndex < 0) {
            throw new common_1.BadRequestException('Vi tri de xuat khong hop le');
        }
        const output = report.aiOutput;
        const list = source === team_report_action_item_status_enum_1.TeamReportActionItemSource.Blocker
            ? (output.blockers ?? [])
            : (output.recommendations ?? []);
        const itemText = list[itemIndex];
        if (!itemText) {
            throw new common_1.NotFoundException('Khong tim thay de xuat trong bao cao');
        }
        return itemText;
    }
    async assertActiveMember(workspaceId, userId) {
        const member = await this.workspaceMembers.findActiveByWorkspaceAndUser(workspaceId, userId);
        if (!member) {
            throw new common_1.BadRequestException('Nguoi nhan de xuat khong phai thanh vien dang hoat dong cua workspace');
        }
        return member;
    }
    collectItems(texts, source, recordsByKey) {
        return texts.map((text, index) => this.toItemResponse(index, text, source, recordsByKey.get(this.buildKey(source, index))));
    }
    buildKey(source, itemIndex) {
        return `${source}#${itemIndex}`;
    }
    toItemResponse(itemIndex, itemText, source, record) {
        return {
            itemIndex,
            source,
            text: itemText,
            status: record?.status ?? team_report_action_item_status_enum_1.TeamReportActionItemStatus.Pending,
            createdTaskId: record?.createdTaskId ?? null,
            targetTaskId: record?.targetTaskId ?? null,
            suggestedReceiverId: record?.suggestedReceiverId ?? null,
            handoverId: record?.handoverId ?? null,
            note: record?.note ?? null,
            handledAt: record?.handledAt ?? null,
        };
    }
    buildTaskTitle(itemText) {
        const title = itemText.trim().slice(0, 200);
        if (title.length < 2) {
            throw new common_1.BadRequestException('Noi dung de xuat qua ngan de tao task');
        }
        return title;
    }
    buildTaskDescription(itemText, reportDate) {
        return [
            `Duoc tao tu bao cao giao ban ngay ${reportDate}.`,
            '',
            itemText.trim(),
        ]
            .join('\n')
            .slice(0, 2000);
    }
    getReportModel() {
        if (!this.aiReportModel) {
            throw new common_1.ServiceUnavailableException('MongoDB dang tat');
        }
        return this.aiReportModel;
    }
};
exports.AiTeamReportActionItemService = AiTeamReportActionItemService;
exports.AiTeamReportActionItemService = AiTeamReportActionItemService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Optional)()),
    __param(0, (0, mongoose_1.InjectModel)(ai_report_schema_1.AiReport.name)),
    __metadata("design:paramtypes", [Object, team_report_action_items_repository_1.TeamReportActionItemsRepository,
        ai_report_access_service_1.AiReportAccessService,
        project_access_service_1.ProjectAccessService,
        tasks_service_1.TasksService,
        tasks_repository_1.TasksRepository,
        workspace_members_repository_1.WorkspaceMembersRepository])
], AiTeamReportActionItemService);
//# sourceMappingURL=ai-team-report-action-item.service.js.map