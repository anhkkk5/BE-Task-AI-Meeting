import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { ChangePasswordDto } from '../dto/change-password.dto';
import { UpdateProfileDto } from '../dto/update-profile.dto';
import { User } from '../entities/user.entity';
import { UsersRepository } from '../repositories/users.repository';

@Injectable()
export class UsersService {
  private readonly saltRounds = 12;

  constructor(private readonly usersRepository: UsersRepository) {}

  create(data: Partial<User>) {
    const user = this.usersRepository.create(data);
    return this.usersRepository.save(user);
  }

  findById(id: string) {
    return this.usersRepository.findById(id);
  }

  findByEmail(email: string) {
    return this.usersRepository.findByEmail(email);
  }

  updateRefreshTokenHash(id: string, refreshTokenHash: string | null) {
    return this.usersRepository.updateRefreshTokenHash(id, refreshTokenHash);
  }

  async getProfile(id: string) {
    const user = await this.findExistingUser(id);

    return {
      success: true,
      message: 'Success',
      data: this.toPublicUser(user),
    };
  }

  async updateProfile(id: string, dto: UpdateProfileDto) {
    await this.findExistingUser(id);

    const user = await this.usersRepository.update(id, {
      fullName: dto.fullName?.trim(),
      avatarUrl: dto.avatarUrl?.trim(),
      phoneNumber: dto.phoneNumber?.trim(),
      jobTitle: dto.jobTitle?.trim(),
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      success: true,
      message: 'Profile updated successfully',
      data: this.toPublicUser(user),
    };
  }

  async changePassword(id: string, dto: ChangePasswordDto) {
    const user = await this.findExistingUser(id);
    const isCurrentPasswordValid = await bcrypt.compare(
      dto.currentPassword,
      user.passwordHash,
    );

    if (!isCurrentPasswordValid) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    const passwordHash = await bcrypt.hash(dto.newPassword, this.saltRounds);
    await this.usersRepository.update(id, {
      passwordHash,
      refreshTokenHash: null,
    });

    return {
      success: true,
      message: 'Password changed successfully',
      data: null,
    };
  }

  toPublicUser(user: User) {
    return {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      avatarUrl: user.avatarUrl,
      phoneNumber: user.phoneNumber,
      jobTitle: user.jobTitle,
      status: user.status,
      isSystemAdmin: user.isSystemAdmin ?? false,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  private async findExistingUser(id: string) {
    const user = await this.usersRepository.findById(id);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }
}
