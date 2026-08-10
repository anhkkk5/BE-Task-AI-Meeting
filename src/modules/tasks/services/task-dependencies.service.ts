import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { TaskDependencyType } from '../../../common/enums/task-dependency-type.enum';
import { ProjectAccessService } from '../../projects/services/project-access.service';
import { WorkspaceAccessService } from '../../workspaces/services/workspace-access.service';
import { CreateTaskDependencyDto } from '../dto/create-task-dependency.dto';
import { TaskDependenciesRepository } from '../repositories/task-dependencies.repository';
import { TaskAccessService } from './task-access.service';

@Injectable()
export class TaskDependenciesService {
  constructor(
    private readonly repository: TaskDependenciesRepository,
    private readonly taskAccessService: TaskAccessService,
    private readonly workspaceAccessService: WorkspaceAccessService,
    private readonly projectAccessService: ProjectAccessService,
  ) {}

  async list(userId: string, workspaceId: string, projectId: string, taskId: string) {
    await this.assertAccess(userId, workspaceId, projectId, taskId);
    const items = await this.repository.findByTask(taskId);
    return { success: true, message: 'Get task dependencies successfully', data: { items } };
  }

  async create(userId: string, workspaceId: string, projectId: string, sourceTaskId: string, dto: CreateTaskDependencyDto) {
    await this.assertAccess(userId, workspaceId, projectId, sourceTaskId);
    await this.taskAccessService.assertTaskInProject(dto.targetTaskId, projectId);
    if (sourceTaskId === dto.targetTaskId) throw new BadRequestException('Task can not depend on itself');
    if (await this.repository.findDuplicate(sourceTaskId, dto.targetTaskId, dto.type)) throw new ConflictException('Task dependency already exists');
    if ([TaskDependencyType.Blocks, TaskDependencyType.DependsOn].includes(dto.type)) {
      await this.assertNoCycle(projectId, sourceTaskId, dto.targetTaskId, dto.type);
    }
    const dependency = await this.repository.create({ sourceTaskId, targetTaskId: dto.targetTaskId, type: dto.type, createdBy: userId });
    return { success: true, message: 'Create task dependency successfully', data: { dependency } };
  }

  async remove(userId: string, workspaceId: string, projectId: string, taskId: string, dependencyId: string) {
    await this.assertAccess(userId, workspaceId, projectId, taskId);
    const item = await this.repository.findOwned(dependencyId);
    if (!item || (item.sourceTaskId !== taskId && item.targetTaskId !== taskId)) throw new NotFoundException('Task dependency not found');
    await this.repository.remove(item);
    return { success: true, message: 'Delete task dependency successfully', data: null };
  }

  private async assertAccess(userId: string, workspaceId: string, projectId: string, taskId: string) {
    await this.workspaceAccessService.assertWorkspaceMember(userId, workspaceId);
    await this.projectAccessService.assertProjectInWorkspace(projectId, workspaceId);
    return this.taskAccessService.assertTaskInProject(taskId, projectId);
  }

  private async assertNoCycle(projectId: string, source: string, target: string, type: TaskDependencyType) {
    const edges = (await this.repository.findByProject(projectId)).filter((item) => [TaskDependencyType.Blocks, TaskDependencyType.DependsOn].includes(item.type));
    const graph = new Map<string, string[]>();
    const add = (from: string, to: string) => graph.set(from, [...(graph.get(from) ?? []), to]);
    edges.forEach((item) => item.type === TaskDependencyType.Blocks ? add(item.sourceTaskId, item.targetTaskId) : add(item.targetTaskId, item.sourceTaskId));
    const from = type === TaskDependencyType.Blocks ? source : target;
    const to = type === TaskDependencyType.Blocks ? target : source;
    const seen = new Set<string>();
    const reaches = (node: string): boolean => node === from || (!seen.has(node) && (seen.add(node), (graph.get(node) ?? []).some(reaches)));
    if (reaches(to)) throw new BadRequestException('This dependency would create a cycle');
  }
}
