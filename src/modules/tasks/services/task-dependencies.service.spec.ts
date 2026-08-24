import { BadRequestException, ConflictException } from '@nestjs/common';
import { TaskDependencyType } from '../../../common/enums/task-dependency-type.enum';
import { TaskDependenciesService } from './task-dependencies.service';

describe('TaskDependenciesService', () => {
  const repository = {
    findDuplicate: jest.fn(),
    findByProject: jest.fn(),
    create: jest.fn(),
    findByTask: jest.fn(),
    findOwned: jest.fn(),
    remove: jest.fn(),
  };
  const taskAccess = {
    assertTaskInProject: jest.fn().mockResolvedValue({ id: 'task' }),
  };
  const workspaceAccess = { assertWorkspaceMember: jest.fn() };
  const projectAccess = { assertProjectInWorkspace: jest.fn() };
  const service = new TaskDependenciesService(
    repository as never,
    taskAccess as never,
    workspaceAccess as never,
    projectAccess as never,
  );

  beforeEach(() => jest.clearAllMocks());

  it('rejects self dependencies', async () => {
    await expect(
      service.create('u', 'w', 'p', 'a', {
        targetTaskId: 'a',
        type: TaskDependencyType.Blocks,
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('rejects duplicate dependencies', async () => {
    repository.findDuplicate.mockResolvedValue({ id: 'existing' });
    await expect(
      service.create('u', 'w', 'p', 'a', {
        targetTaskId: 'b',
        type: TaskDependencyType.RelatesTo,
      }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('rejects a blocking edge that closes a cycle', async () => {
    repository.findDuplicate.mockResolvedValue(null);
    repository.findByProject.mockResolvedValue([
      { sourceTaskId: 'b', targetTaskId: 'a', type: TaskDependencyType.Blocks },
    ]);
    await expect(
      service.create('u', 'w', 'p', 'a', {
        targetTaskId: 'b',
        type: TaskDependencyType.Blocks,
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});
