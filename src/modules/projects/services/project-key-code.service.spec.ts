import { ProjectsRepository } from '../repositories/projects.repository';
import { ProjectKeyCodeService } from './project-key-code.service';

describe('ProjectKeyCodeService', () => {
  let service: ProjectKeyCodeService;
  let projectsRepository: jest.Mocked<
    Pick<ProjectsRepository, 'findKeyCodesByPrefix'>
  >;

  beforeEach(() => {
    projectsRepository = {
      findKeyCodesByPrefix: jest.fn().mockResolvedValue([]),
    };
    service = new ProjectKeyCodeService(
      projectsRepository as unknown as ProjectsRepository,
    );
  });

  it('takes the first letter of each word for multi word names', () => {
    expect(service.buildBaseKeyCode('Task AI Meeting')).toBe('TAM');
  });

  it('takes up to four characters for single word names', () => {
    expect(service.buildBaseKeyCode('Nexus')).toBe('NEXU');
  });

  it('strips Vietnamese diacritics', () => {
    expect(service.buildBaseKeyCode('Dự án Điều Hành')).toBe('DADH');
  });

  it('ignores punctuation between words', () => {
    expect(service.buildBaseKeyCode('Agile/Scrum AI')).toBe('ASA');
  });

  it('falls back when the name has no usable character', () => {
    expect(service.buildBaseKeyCode('***')).toBe('PRJ');
  });

  it('keeps the key code starting with a letter', () => {
    expect(service.buildBaseKeyCode('2026 Roadmap')).toBe('PRJ2R');
  });

  it('returns the base key code when it is free', async () => {
    await expect(
      service.generateUniqueKeyCode('workspace-id', 'Task AI Meeting'),
    ).resolves.toBe('TAM');
    expect(projectsRepository.findKeyCodesByPrefix).toHaveBeenCalledWith(
      'workspace-id',
      'TAM',
    );
  });

  it('appends a counter when the base key code is taken', async () => {
    projectsRepository.findKeyCodesByPrefix.mockResolvedValue(['TAM', 'TAM2']);

    await expect(
      service.generateUniqueKeyCode('workspace-id', 'Task AI Meeting'),
    ).resolves.toBe('TAM3');
  });

  it('compares existing key codes case insensitively', async () => {
    projectsRepository.findKeyCodesByPrefix.mockResolvedValue(['tam']);

    await expect(
      service.generateUniqueKeyCode('workspace-id', 'Task AI Meeting'),
    ).resolves.toBe('TAM2');
  });

  it('keeps the generated key code within the column length', async () => {
    // 25 tu, moi tu gop 1 chu cai dau nen base bi cat con dung 20 ky tu.
    const longName = Array.from({ length: 25 }, () => 'Alpha').join(' ');
    projectsRepository.findKeyCodesByPrefix.mockResolvedValue(['A'.repeat(20)]);

    const keyCode = await service.generateUniqueKeyCode(
      'workspace-id',
      longName,
    );

    expect(keyCode).toBe(`${'A'.repeat(19)}2`);
    expect(keyCode.length).toBeLessThanOrEqual(20);
  });
});
