import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { WorkspaceStatus } from '../../../common/enums/workspace-status.enum';
import { Workspace } from '../entities/workspace.entity';

@Injectable()
export class WorkspacesRepository {
  constructor(
    @InjectRepository(Workspace)
    private readonly repository: Repository<Workspace>,
  ) {}

  create(
    data: Pick<Workspace, 'name' | 'slug' | 'description' | 'ownerId'>,
    manager?: EntityManager,
  ) {
    const repository = this.getRepository(manager);
    const workspace = repository.create(data);

    return repository.save(workspace);
  }

  findById(id: string) {
    return this.repository.findOne({ where: { id } });
  }

  findBySlug(slug: string) {
    return this.repository.findOne({ where: { slug } });
  }

  async update(id: string, data: Partial<Workspace>) {
    await this.repository.update(id, data);
    return this.findById(id);
  }

  async archive(id: string) {
    await this.repository.update(id, { status: WorkspaceStatus.Archived });
  }

  private getRepository(manager?: EntityManager) {
    return manager ? manager.getRepository(Workspace) : this.repository;
  }
}
