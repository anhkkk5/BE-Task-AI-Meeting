import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { SprintStatus } from '../../../common/enums/sprint-status.enum';
import { SprintsRepository } from '../repositories/sprints.repository';

@Injectable()
export class SprintAccessService {
  constructor(private readonly sprintsRepository: SprintsRepository) {}

  getSprintInProject(sprintId: string, projectId: string) {
    return this.sprintsRepository.findByIdAndProject(sprintId, projectId);
  }

  async assertSprintInProject(sprintId: string, projectId: string) {
    const sprint = await this.getSprintInProject(sprintId, projectId);

    if (!sprint) {
      throw new NotFoundException('Sprint not found in this project');
    }

    return sprint;
  }

  async assertSprintPlanned(sprintId: string, projectId: string) {
    const sprint = await this.assertSprintInProject(sprintId, projectId);

    if (sprint.status !== SprintStatus.Planned) {
      throw new BadRequestException('Only planned sprint can be updated');
    }

    return sprint;
  }

  async assertSprintActive(sprintId: string, projectId: string) {
    const sprint = await this.assertSprintInProject(sprintId, projectId);

    if (sprint.status !== SprintStatus.Active) {
      throw new BadRequestException('Only active sprint can be completed');
    }

    return sprint;
  }

  async assertProjectHasNoActiveSprint(projectId: string, sprintId?: string) {
    const activeSprint =
      await this.sprintsRepository.findActiveByProject(projectId);

    if (activeSprint && activeSprint.id !== sprintId) {
      throw new ConflictException(
        `Dự án đang có Sprint “${activeSprint.name}” hoạt động. Hãy hoàn thành Sprint này trước khi bắt đầu Sprint khác.`,
      );
    }
  }
}
