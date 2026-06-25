import { ForbiddenException } from '@nestjs/common';
import { WorkspaceRole } from '../../../common/enums/workspace-role.enum';
import { WorkspaceAccessService } from '../../workspaces/services/workspace-access.service';
import { AiReportDocument } from '../schemas/ai-report.schema';
import { AiReportAccessService } from './ai-report-access.service';

describe('AiReportAccessService', () => {
  let workspaceAccessService: jest.Mocked<
    Pick<WorkspaceAccessService, 'getUserWorkspaceRole'>
  >;
  let service: AiReportAccessService;

  beforeEach(() => {
    workspaceAccessService = {
      getUserWorkspaceRole: jest.fn(),
    };
    service = new AiReportAccessService(
      workspaceAccessService as unknown as WorkspaceAccessService,
    );
  });

  it('allows MEMBER to use own AI personal reports', async () => {
    workspaceAccessService.getUserWorkspaceRole.mockResolvedValue(
      WorkspaceRole.Member,
    );

    await expect(
      service.assertCanUseOwnReports('member-id', 'workspace-id'),
    ).resolves.toBe(WorkspaceRole.Member);
  });

  it('rejects VIEWER from AI personal reports', async () => {
    workspaceAccessService.getUserWorkspaceRole.mockResolvedValue(
      WorkspaceRole.Viewer,
    );

    await expect(
      service.assertCanUseOwnReports('viewer-id', 'workspace-id'),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('allows manager to view another member report', async () => {
    workspaceAccessService.getUserWorkspaceRole.mockResolvedValue(
      WorkspaceRole.ScrumMaster,
    );

    await expect(
      service.assertCanViewReport('scrum-id', 'workspace-id', {
        userId: 'member-id',
      } as AiReportDocument),
    ).resolves.toBe(WorkspaceRole.ScrumMaster);
  });

  it('rejects MEMBER viewing another user report', async () => {
    workspaceAccessService.getUserWorkspaceRole.mockResolvedValue(
      WorkspaceRole.Member,
    );

    await expect(
      service.assertCanViewReport('member-id', 'workspace-id', {
        userId: 'other-member-id',
      } as AiReportDocument),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });
});
