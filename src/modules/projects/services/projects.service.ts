import {
  BadRequestException,
  Injectable,
  NotFoundException,
  Optional,
} from '@nestjs/common';
import { DataSource } from 'typeorm';
import { randomUUID } from 'crypto';
import { WorkspaceRole } from '../../../common/enums/workspace-role.enum';
import { WorkspaceAccessService } from '../../workspaces/services/workspace-access.service';
import { CreateProjectDto } from '../dto/create-project.dto';
import { GetProjectsQueryDto } from '../dto/get-projects-query.dto';
import { UpdateProjectDto } from '../dto/update-project.dto';
import {
  DEFAULT_WORKFLOW_STATUSES,
  DEFAULT_WORKFLOW_TRANSITIONS,
} from '../../../common/workflow/default-workflow';
import { TaskStatus } from '../../../common/enums/task-status.enum';
import { Project } from '../entities/project.entity';
import { ProjectsRepository } from '../repositories/projects.repository';
import { ProjectAccessService } from './project-access.service';
import { ProjectKeyCodeService } from './project-key-code.service';

const projectWriteRoles = [
  WorkspaceRole.Owner,
  WorkspaceRole.ScrumMaster,
  WorkspaceRole.ProjectManager,
];

@Injectable()
export class ProjectsService {
  constructor(
    private readonly projectsRepository: ProjectsRepository,
    private readonly projectAccessService: ProjectAccessService,
    private readonly projectKeyCodeService: ProjectKeyCodeService,
    private readonly workspaceAccessService: WorkspaceAccessService,
    @Optional() private readonly dataSource?: DataSource,
  ) {}

  async listWorkflowTemplates(currentUserId: string, workspaceId: string) {
    await this.workspaceAccessService.assertWorkspaceMember(
      currentUserId,
      workspaceId,
    );
    if (!this.dataSource)
      return {
        success: true,
        message: 'Get workflow templates successfully',
        data: { items: [] },
      };
    const templates = (await this.dataSource.query(
      'SELECT * FROM `workflow_templates` ORDER BY `is_system` DESC, `name` ASC',
    )) as Array<Record<string, unknown>>;
    return {
      success: true,
      message: 'Get workflow templates successfully',
      data: { items: templates },
    };
  }

  async createWorkflowTemplate(
    currentUserId: string,
    workspaceId: string,
    dto: {
      name: string;
      description?: string;
      statuses: UpdateProjectDto['workflowStatuses'];
      transitions: UpdateProjectDto['workflowTransitions'];
    },
  ) {
    await this.workspaceAccessService.assertWorkspaceMember(
      currentUserId,
      workspaceId,
    );
    this.assertWorkflow(dto.statuses, dto.transitions);
    if (!this.dataSource)
      throw new BadRequestException('Workflow storage unavailable');
    const id = randomUUID();
    await this.dataSource.transaction(async (manager) => {
      await manager.query(
        'INSERT INTO `workflow_templates` (`id`,`name`,`description`,`is_system`) VALUES (?,?,?,0)',
        [id, dto.name.trim(), dto.description?.trim() || null],
      );
      for (const status of dto.statuses ?? [])
        await manager.query(
          'INSERT INTO `workflow_statuses` (`id`,`template_id`,`status_key`,`label`,`color`,`category`,`sort_order`,`enabled`) VALUES (?,?,?,?,?,?,?,?)',
          [
            randomUUID(),
            id,
            status.key,
            status.label,
            status.color,
            status.category,
            status.order,
            status.enabled,
          ],
        );
      for (const transition of dto.transitions ?? [])
        await manager.query(
          'INSERT INTO `workflow_transitions` (`id`,`template_id`,`from_key`,`to_key`,`allowed_roles`) VALUES (?,?,?,?,?)',
          [
            randomUUID(),
            id,
            transition.from,
            transition.to,
            transition.roles?.length ? JSON.stringify(transition.roles) : null,
          ],
        );
    });
    return {
      success: true,
      message: 'Create workflow template successfully',
      data: { id },
    };
  }

  async updateWorkflowTemplate(
    currentUserId: string,
    workspaceId: string,
    templateId: string,
    dto: {
      name: string;
      description?: string;
      statuses: UpdateProjectDto['workflowStatuses'];
      transitions: UpdateProjectDto['workflowTransitions'];
    },
  ) {
    await this.workspaceAccessService.assertWorkspaceMember(
      currentUserId,
      workspaceId,
    );
    this.assertWorkflow(dto.statuses, dto.transitions);
    if (!this.dataSource)
      throw new BadRequestException('Workflow storage unavailable');
    const templates = (await this.dataSource.query(
      'SELECT `is_system` FROM `workflow_templates` WHERE `id`=? LIMIT 1',
      [templateId],
    )) as Array<{ is_system: boolean | number }>;
    if (!templates.length)
      throw new NotFoundException('Workflow template not found');
    if (templates[0].is_system)
      throw new BadRequestException(
        'System workflow template cannot be edited',
      );
    await this.dataSource.transaction(async (manager) => {
      await manager.query(
        'UPDATE `workflow_templates` SET `name`=?,`description`=? WHERE `id`=?',
        [dto.name.trim(), dto.description?.trim() || null, templateId],
      );
      await manager.query(
        'UPDATE `workflow_statuses` SET `enabled`=0 WHERE `template_id`=?',
        [templateId],
      );
      for (const status of dto.statuses ?? []) {
        const existing = (await manager.query(
          'SELECT `id` FROM `workflow_statuses` WHERE `template_id`=? AND `status_key`=? LIMIT 1',
          [templateId, status.key],
        )) as Array<{ id: string }>;
        if (existing.length)
          await manager.query(
            'UPDATE `workflow_statuses` SET `label`=?,`color`=?,`category`=?,`sort_order`=?,`enabled`=? WHERE `id`=?',
            [
              status.label,
              status.color,
              status.category,
              status.order,
              status.enabled,
              existing[0].id,
            ],
          );
        else
          await manager.query(
            'INSERT INTO `workflow_statuses` (`id`,`template_id`,`status_key`,`label`,`color`,`category`,`sort_order`,`enabled`) VALUES (?,?,?,?,?,?,?,?)',
            [
              randomUUID(),
              templateId,
              status.key,
              status.label,
              status.color,
              status.category,
              status.order,
              status.enabled,
            ],
          );
      }
      await manager.query(
        'DELETE FROM `workflow_transitions` WHERE `template_id`=?',
        [templateId],
      );
      for (const transition of dto.transitions ?? [])
        await manager.query(
          'INSERT INTO `workflow_transitions` (`id`,`template_id`,`from_key`,`to_key`,`allowed_roles`) VALUES (?,?,?,?,?)',
          [
            randomUUID(),
            templateId,
            transition.from,
            transition.to,
            transition.roles?.length ? JSON.stringify(transition.roles) : null,
          ],
        );
    });
    return {
      success: true,
      message: 'Update workflow template successfully',
      data: { id: templateId },
    };
  }

  async applyWorkflowTemplate(
    currentUserId: string,
    workspaceId: string,
    projectId: string,
    templateId: string,
  ) {
    await this.workspaceAccessService.assertWorkspaceMember(
      currentUserId,
      workspaceId,
    );
    const project = await this.projectAccessService.assertProjectInWorkspace(
      projectId,
      workspaceId,
    );
    if (!this.dataSource)
      throw new BadRequestException('Workflow storage unavailable');
    const statuses = await this.dataSource.query(
      'SELECT `id` `workflowStatusId`,`status_key` `key`,`label`,`color`,`category`,`sort_order` `order`,`enabled` FROM `workflow_statuses` WHERE `template_id`=? ORDER BY `sort_order`',
      [templateId],
    );
    if (!statuses.length)
      throw new NotFoundException('Workflow template not found');
    const rawTransitions = await this.dataSource.query(
      'SELECT `from_key` `from`,`to_key` `to`,`allowed_roles` `roles` FROM `workflow_transitions` WHERE `template_id`=?',
      [templateId],
    );
    const transitions = rawTransitions.map(
      (item: {
        from: string;
        to: string;
        roles: string | string[] | null;
      }) => ({
        ...item,
        roles:
          typeof item.roles === 'string'
            ? JSON.parse(item.roles)
            : (item.roles ?? undefined),
      }),
    );
    const updated = await this.projectsRepository.update(project, {
      workflowTemplateId: templateId,
      workflowStatuses: statuses,
      workflowTransitions: transitions,
    });
    await this.dataSource.query(
      'UPDATE `tasks` t JOIN `workflow_statuses` s ON s.template_id=? AND s.status_key=t.status SET t.workflow_status_id=s.id WHERE t.project_id=?',
      [templateId, projectId],
    );
    return {
      success: true,
      message: 'Apply workflow template successfully',
      data: { project: this.toProjectResponse(updated) },
    };
  }

  async deleteWorkflowTemplate(
    currentUserId: string,
    workspaceId: string,
    templateId: string,
  ) {
    await this.workspaceAccessService.assertWorkspaceMember(
      currentUserId,
      workspaceId,
    );
    if (!this.dataSource)
      throw new BadRequestException('Workflow storage unavailable');
    const result = await this.dataSource.query(
      'DELETE FROM `workflow_templates` WHERE `id`=? AND `is_system`=0',
      [templateId],
    );
    return {
      success: true,
      message: 'Delete workflow template successfully',
      data: { affected: result.affectedRows ?? 0 },
    };
  }

  async createProject(
    currentUserId: string,
    workspaceId: string,
    dto: CreateProjectDto,
  ) {
    await this.workspaceAccessService.assertWorkspaceActive(workspaceId);
    await this.workspaceAccessService.assertWorkspaceMember(
      currentUserId,
      workspaceId,
    );
    this.assertDateRange(dto.startDate, dto.endDate);

    const name = dto.name.trim();
    // Key code sinh tu ten project. Nguoi dung khong nhap nen khong the trung,
    // ham nay tu them so dem khi can.
    const keyCode = await this.projectKeyCodeService.generateUniqueKeyCode(
      workspaceId,
      name,
    );

    const project = await this.projectsRepository.create({
      workspaceId,
      name,
      keyCode,
      description: dto.description?.trim() || null,
      startDate: dto.startDate ?? null,
      endDate: dto.endDate ?? null,
      createdBy: currentUserId,
    });

    return {
      success: true,
      message: 'Create project successfully',
      data: {
        project: this.toProjectResponse(project),
      },
    };
  }

  async getProjects(
    currentUserId: string,
    workspaceId: string,
    query: GetProjectsQueryDto,
  ) {
    await this.workspaceAccessService.assertWorkspaceMember(
      currentUserId,
      workspaceId,
    );
    const result = await this.projectsRepository.findByWorkspace(
      workspaceId,
      query,
    );

    return {
      success: true,
      message: 'Get projects successfully',
      data: {
        items: result.items.map((project) => this.toProjectResponse(project)),
        meta: {
          total: result.total,
          page: result.page,
          limit: result.limit,
        },
      },
    };
  }

  async getProjectDetail(
    currentUserId: string,
    workspaceId: string,
    projectId: string,
  ) {
    await this.workspaceAccessService.assertWorkspaceMember(
      currentUserId,
      workspaceId,
    );
    const project =
      await this.projectAccessService.assertProjectDetailInWorkspace(
        projectId,
        workspaceId,
      );
    const workflowStatuses = await this.getNormalizedWorkflowStatuses(project);

    return {
      success: true,
      message: 'Get project detail successfully',
      data: {
        project: {
          ...this.toProjectResponse(project),
          workflowStatuses,
          createdByUser: project.creator
            ? {
                id: project.creator.id,
                fullName: project.creator.fullName,
                email: project.creator.email,
                avatarUrl: project.creator.avatarUrl,
              }
            : null,
        },
      },
    };
  }

  async updateProject(
    currentUserId: string,
    workspaceId: string,
    projectId: string,
    dto: UpdateProjectDto,
  ) {
    await this.workspaceAccessService.assertWorkspaceActive(workspaceId);
    await this.workspaceAccessService.assertWorkspaceMember(
      currentUserId,
      workspaceId,
    );
    this.assertDateRange(dto.startDate, dto.endDate);
    const project = await this.projectAccessService.assertProjectInWorkspace(
      projectId,
      workspaceId,
    );
    this.assertWorkflow(dto.workflowStatuses, dto.workflowTransitions);

    const updatedProject = await this.projectsRepository.update(project, {
      name: dto.name?.trim() ?? project.name,
      description:
        dto.description === undefined
          ? project.description
          : dto.description.trim() || null,
      startDate: dto.startDate ?? project.startDate,
      endDate: dto.endDate ?? project.endDate,
      workflowStatuses:
        (dto.workflowStatuses as typeof project.workflowStatuses | undefined) ??
        project.workflowStatuses,
      workflowTransitions:
        (dto.workflowTransitions as
          typeof project.workflowTransitions | undefined) ??
        project.workflowTransitions,
    });

    return {
      success: true,
      message: 'Update project successfully',
      data: {
        project: this.toProjectResponse(updatedProject),
      },
    };
  }

  async archiveProject(
    currentUserId: string,
    workspaceId: string,
    projectId: string,
  ) {
    await this.workspaceAccessService.assertWorkspaceMember(
      currentUserId,
      workspaceId,
    );
    const project = await this.projectAccessService.assertProjectInWorkspace(
      projectId,
      workspaceId,
    );
    await this.projectsRepository.archive(project);

    return {
      success: true,
      message: 'Archive project successfully',
      data: null,
    };
  }

  async completeProject(
    currentUserId: string,
    workspaceId: string,
    projectId: string,
  ) {
    await this.workspaceAccessService.assertWorkspaceMember(
      currentUserId,
      workspaceId,
    );
    const project = await this.projectAccessService.assertProjectInWorkspace(
      projectId,
      workspaceId,
    );
    await this.projectsRepository.complete(project);

    return {
      success: true,
      message: 'Complete project successfully',
      data: null,
    };
  }

  getProjectWriteRoles() {
    return projectWriteRoles;
  }

  private assertDateRange(startDate?: string, endDate?: string) {
    if (!startDate || !endDate) {
      return;
    }

    if (new Date(endDate).getTime() < new Date(startDate).getTime()) {
      throw new BadRequestException(
        'endDate must not be earlier than startDate',
      );
    }
  }

  private assertWorkflow(
    statuses?: UpdateProjectDto['workflowStatuses'],
    transitions?: UpdateProjectDto['workflowTransitions'],
  ) {
    if (!statuses && !transitions) return;
    const valid = new Set(Object.values(TaskStatus));
    if (statuses) {
      const keys = statuses.map((status) => status.key);
      if (
        new Set(keys).size !== keys.length ||
        keys.some((key) => !valid.has(key as TaskStatus))
      )
        throw new BadRequestException(
          'Workflow statuses contain duplicate or invalid keys',
        );
      if (
        !statuses.some(
          (status) => status.key === TaskStatus.Done && status.enabled,
        )
      )
        throw new BadRequestException('Workflow must keep DONE enabled');
    }
    const validRoles = new Set(Object.values(WorkspaceRole));
    if (
      transitions?.some(
        (transition) =>
          !valid.has(transition.from as TaskStatus) ||
          !valid.has(transition.to as TaskStatus) ||
          transition.from === transition.to ||
          transition.roles?.some(
            (role) => !validRoles.has(role as WorkspaceRole),
          ),
      )
    )
      throw new BadRequestException(
        'Workflow contains invalid transitions or roles',
      );
  }

  private toProjectResponse(project: Project) {
    return {
      id: project.id,
      workspaceId: project.workspaceId,
      name: project.name,
      keyCode: project.keyCode,
      description: project.description,
      status: project.status,
      startDate: project.startDate,
      endDate: project.endDate,
      workflowStatuses: project.workflowStatuses ?? DEFAULT_WORKFLOW_STATUSES,
      workflowTransitions:
        project.workflowTransitions ?? DEFAULT_WORKFLOW_TRANSITIONS,
      workflowTemplateId: project.workflowTemplateId,
      createdBy: project.createdBy,
      createdAt: project.createdAt,
      updatedAt: project.updatedAt,
    };
  }

  private async getNormalizedWorkflowStatuses(project: Project) {
    if (!this.dataSource || !project.workflowTemplateId)
      return project.workflowStatuses ?? DEFAULT_WORKFLOW_STATUSES;
    const statuses = await this.dataSource.query(
      'SELECT `id` `workflowStatusId`,`status_key` `key`,`label`,`color`,`category`,`sort_order` `order`,`enabled` FROM `workflow_statuses` WHERE `template_id`=? ORDER BY `sort_order`',
      [project.workflowTemplateId],
    );
    return statuses.length
      ? statuses
      : (project.workflowStatuses ?? DEFAULT_WORKFLOW_STATUSES);
  }
}
