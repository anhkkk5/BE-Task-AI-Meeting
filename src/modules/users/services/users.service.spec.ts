import { NotFoundException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { User } from '../entities/user.entity';
import { UserStatus } from '../enums/user-status.enum';
import { UsersRepository } from '../repositories/users.repository';
import { UsersService } from './users.service';

describe('UsersService', () => {
  let usersService: UsersService;
  let usersRepository: jest.Mocked<
    Pick<
      UsersRepository,
      | 'create'
      | 'findByEmail'
      | 'findById'
      | 'save'
      | 'update'
      | 'updateRefreshTokenHash'
    >
  >;

  const user = {
    id: 'user-id',
    email: 'member@example.com',
    fullName: 'Team Member',
    avatarUrl: null,
    phoneNumber: null,
    jobTitle: null,
    passwordHash: 'password-hash',
    status: UserStatus.Active,
    refreshTokenHash: 'refresh-hash',
    createdAt: new Date('2026-06-14T00:00:00.000Z'),
    updatedAt: new Date('2026-06-14T00:00:00.000Z'),
  } as User;

  beforeEach(() => {
    usersRepository = {
      create: jest.fn(),
      findByEmail: jest.fn(),
      findById: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
      updateRefreshTokenHash: jest.fn(),
    };
    usersService = new UsersService(
      usersRepository as unknown as UsersRepository,
    );
  });

  it('returns a public profile without sensitive fields', async () => {
    usersRepository.findById.mockResolvedValue(user);

    const response = await usersService.getProfile(user.id);

    expect(response.data).not.toHaveProperty('passwordHash');
    expect(response.data).not.toHaveProperty('refreshTokenHash');
    expect(response.data.email).toBe(user.email);
  });

  it('updates profile fields', async () => {
    usersRepository.findById.mockResolvedValue(user);
    usersRepository.update.mockResolvedValue({
      ...user,
      fullName: 'Updated Member',
      phoneNumber: '0900000000',
    });

    const response = await usersService.updateProfile(user.id, {
      fullName: ' Updated Member ',
      phoneNumber: ' 0900000000 ',
    });

    expect(usersRepository.update).toHaveBeenCalledWith(user.id, {
      fullName: 'Updated Member',
      avatarUrl: undefined,
      phoneNumber: '0900000000',
      jobTitle: undefined,
    });
    expect(response.message).toBe('Profile updated successfully');
    expect(response.data.fullName).toBe('Updated Member');
  });

  it('changes password and clears refresh token hash', async () => {
    const passwordHash = await bcrypt.hash('old-password', 4);
    usersRepository.findById.mockResolvedValue({ ...user, passwordHash });
    usersRepository.update.mockResolvedValue({
      ...user,
      passwordHash: 'new-password-hash',
      refreshTokenHash: null,
    });

    const response = await usersService.changePassword(user.id, {
      currentPassword: 'old-password',
      newPassword: 'new-password',
    });

    const updatePayload = usersRepository.update.mock.calls[0]?.[1];

    expect(usersRepository.update).toHaveBeenCalledWith(
      user.id,
      expect.objectContaining({
        refreshTokenHash: null,
      }),
    );
    expect(typeof updatePayload?.passwordHash).toBe('string');
    expect(response).toEqual({
      success: true,
      message: 'Password changed successfully',
      data: null,
    });
  });

  it('rejects incorrect current password', async () => {
    const passwordHash = await bcrypt.hash('old-password', 4);
    usersRepository.findById.mockResolvedValue({ ...user, passwordHash });

    await expect(
      usersService.changePassword(user.id, {
        currentPassword: 'wrong-password',
        newPassword: 'new-password',
      }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('throws when user is missing', async () => {
    usersRepository.findById.mockResolvedValue(null);

    await expect(usersService.getProfile(user.id)).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });
});
