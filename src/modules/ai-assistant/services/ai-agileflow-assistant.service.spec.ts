import { AiAgileFlowAssistantService } from './ai-agileflow-assistant.service';

describe('AiAgileFlowAssistantService', () => {
  const memberships = {
    findActiveByUser: jest.fn(),
    findActiveByWorkspaceAndUser: jest.fn(),
  };
  const projects = {
    findByWorkspace: jest.fn(),
    findByIdAndWorkspace: jest.fn(),
  };
  const sprints = { findByProject: jest.fn() };
  const projectAssistant = { ask: jest.fn() };
  const provider = { generateProjectAssistantAnswer: jest.fn() };
  let service: AiAgileFlowAssistantService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new AiAgileFlowAssistantService(
      memberships as never,
      projects as never,
      sprints as never,
      projectAssistant as never,
      provider as never,
    );
  });

  it('answers product feature questions without requiring a workspace', async () => {
    provider.generateProjectAssistantAnswer.mockResolvedValue({
      output: { answer: 'Backlog là danh sách công việc chưa vào Sprint.', suggestedQuestions: [] },
    });

    const result = await service.ask('user-1', { question: 'Backlog là gì?' });

    expect(result.data.state).toBe('GLOBAL');
    expect(memberships.findActiveByUser).not.toHaveBeenCalled();
  });

  it('offers only workspaces accessible to the current user', async () => {
    memberships.findActiveByUser.mockResolvedValue([
      { workspace: { id: 'workspace-1', name: 'Nhóm Alpha', description: null } },
    ]);

    const result = await service.ask('user-1', { question: 'Backlog hiện có gì?' });

    expect(result.data.state).toBe('NEED_WORKSPACE');
    expect(result.data.choices).toEqual([
      { id: 'workspace-1', label: 'Nhóm Alpha', description: undefined },
    ]);
  });

  it('continues from workspace to project selection', async () => {
    memberships.findActiveByWorkspaceAndUser.mockResolvedValue({ id: 'member-1' });
    projects.findByWorkspace.mockResolvedValue({
      items: [{ id: 'project-1', name: 'Website', keyCode: 'WEB' }],
    });

    const result = await service.ask('user-1', {
      question: 'Backlog hiện có gì?',
      workspaceId: 'workspace-1',
    });

    expect(result.data.state).toBe('NEED_PROJECT');
    expect(result.data.choices[0].id).toBe('project-1');
  });
});
