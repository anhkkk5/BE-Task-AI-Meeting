import { ForbiddenException } from '@nestjs/common';
import { WorkspaceRole } from '../../../common/enums/workspace-role.enum';
import { WorkspaceAccessService } from '../../workspaces/services/workspace-access.service';
import { SprintAccessService } from '../../sprints/services/sprint-access.service';
import { Task } from '../entities/task.entity';
import { TasksRepository } from '../repositories/tasks.repository';
import { TaskAccessService } from './task-access.service';

describe('TaskAccessService', () => {
  let service: TaskAccessService;
  let workspaceAccessService: jest.Mocked<
    Pick<WorkspaceAccessService, 'getUserWorkspaceRole'>
  >;

  const task = {
    id: 'task-id',
    createdBy: 'creator-id',
  } as Task;

  beforeEach(() => {
    workspaceAccessService = {
      getUserWorkspaceRole: jest.fn(),
    };
    service = new TaskAccessService(
      {} as TasksRepository,
      {} as SprintAccessService,
      workspaceAccessService as unknown as WorkspaceAccessService,
    );
  });

  it('allows the task creator to delete their task', async () => {
    workspaceAccessService.getUserWorkspaceRole.mockResolvedValue(
      WorkspaceRole.Member,
    );

    await expect(
      service.assertUserCanDeleteTask('creator-id', 'workspace-id', task),
    ).resolves.toBe(WorkspaceRole.Member);
  });

  it('allows workspace managers to delete a task', async () => {
    workspaceAccessService.getUserWorkspaceRole.mockResolvedValue(
      WorkspaceRole.ProjectManager,
    );

    await expect(
      service.assertUserCanDeleteTask('manager-id', 'workspace-id', task),
    ).resolves.toBe(WorkspaceRole.ProjectManager);
  });

  it('rejects a member deleting another user task', async () => {
    workspaceAccessService.getUserWorkspaceRole.mockResolvedValue(
      WorkspaceRole.Member,
    );

    await expect(
      service.assertUserCanDeleteTask('member-id', 'workspace-id', task),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });
});
