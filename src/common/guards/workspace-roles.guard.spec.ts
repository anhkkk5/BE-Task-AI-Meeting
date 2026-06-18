import {
  ExecutionContext,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { WorkspaceRole } from '../enums/workspace-role.enum';
import { WorkspaceAccessService } from '../../modules/workspaces/services/workspace-access.service';
import { WorkspaceRolesGuard } from './workspace-roles.guard';

describe('WorkspaceRolesGuard', () => {
  let guard: WorkspaceRolesGuard;
  let reflector: jest.Mocked<Pick<Reflector, 'getAllAndOverride'>>;
  let workspaceAccessService: jest.Mocked<
    Pick<WorkspaceAccessService, 'getUserWorkspaceRole'>
  >;

  function createContext(request: {
    params?: { workspaceId?: string };
    user?: { id: string };
  }) {
    return {
      getClass: jest.fn(),
      getHandler: jest.fn(),
      switchToHttp: jest.fn(() => ({
        getRequest: jest.fn(() => request),
      })),
    } as unknown as ExecutionContext;
  }

  beforeEach(() => {
    reflector = {
      getAllAndOverride: jest.fn(),
    };
    workspaceAccessService = {
      getUserWorkspaceRole: jest.fn(),
    };
    guard = new WorkspaceRolesGuard(
      reflector as unknown as Reflector,
      workspaceAccessService as unknown as WorkspaceAccessService,
    );
  });

  it('allows route when no workspace roles metadata is required', async () => {
    reflector.getAllAndOverride.mockReturnValue(undefined);

    await expect(guard.canActivate(createContext({}))).resolves.toBeTruthy();
    expect(workspaceAccessService.getUserWorkspaceRole).not.toHaveBeenCalled();
  });

  it('allows project write roles', async () => {
    reflector.getAllAndOverride.mockReturnValue([
      WorkspaceRole.Owner,
      WorkspaceRole.ScrumMaster,
      WorkspaceRole.ProjectManager,
    ]);
    workspaceAccessService.getUserWorkspaceRole.mockResolvedValue(
      WorkspaceRole.ProjectManager,
    );

    await expect(
      guard.canActivate(
        createContext({
          params: { workspaceId: 'workspace-id' },
          user: { id: 'user-id' },
        }),
      ),
    ).resolves.toBeTruthy();
  });

  it('rejects member role for project write actions', async () => {
    reflector.getAllAndOverride.mockReturnValue([
      WorkspaceRole.Owner,
      WorkspaceRole.ScrumMaster,
      WorkspaceRole.ProjectManager,
    ]);
    workspaceAccessService.getUserWorkspaceRole.mockResolvedValue(
      WorkspaceRole.Member,
    );

    await expect(
      guard.canActivate(
        createContext({
          params: { workspaceId: 'workspace-id' },
          user: { id: 'user-id' },
        }),
      ),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('rejects request without authenticated user or workspaceId', async () => {
    reflector.getAllAndOverride.mockReturnValue([WorkspaceRole.Owner]);

    await expect(
      guard.canActivate(
        createContext({ params: { workspaceId: 'workspace-id' } }),
      ),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });
});
