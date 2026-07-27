import { ProjectsRepository } from '../repositories/projects.repository';
export declare class ProjectKeyCodeService {
    private readonly projectsRepository;
    constructor(projectsRepository: ProjectsRepository);
    private removeDiacritics;
    buildBaseKeyCode(name: string): string;
    generateUniqueKeyCode(workspaceId: string, name: string): Promise<string>;
}
