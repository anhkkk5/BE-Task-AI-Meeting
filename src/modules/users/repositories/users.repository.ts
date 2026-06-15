import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';

@Injectable()
export class UsersRepository {
  constructor(
    @InjectRepository(User)
    private readonly repository: Repository<User>,
  ) {}

  create(data: Partial<User>) {
    return this.repository.create(data);
  }

  save(user: User) {
    return this.repository.save(user);
  }

  findById(id: string) {
    return this.repository.findOne({ where: { id } });
  }

  findByEmail(email: string) {
    return this.repository.findOne({ where: { email } });
  }

  async updateRefreshTokenHash(id: string, refreshTokenHash: string | null) {
    await this.repository.update(id, { refreshTokenHash });
  }

  async update(id: string, data: Partial<User>) {
    await this.repository.update(id, data);
    return this.findById(id);
  }
}
