import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { JwtSignOptions } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { jwtConfig } from '../../../config/jwt.config';
import { User } from '../../users/entities/user.entity';
import { UserStatus } from '../../users/enums/user-status.enum';
import { UsersService } from '../../users/services/users.service';
import { LoginDto } from '../dto/login.dto';
import { RegisterDto } from '../dto/register.dto';
import { AuthUser } from '../types/auth-user.type';

@Injectable()
export class AuthService {
  private readonly saltRounds = 12;

  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const email = dto.email.trim().toLowerCase();
    const existingUser = await this.usersService.findByEmail(email);

    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    const passwordHash = await bcrypt.hash(dto.password, this.saltRounds);
    const user = await this.usersService.create({
      email,
      fullName: dto.fullName.trim(),
      passwordHash,
      status: UserStatus.Active,
    });
    const tokens = await this.issueTokens(user);

    await this.storeRefreshTokenHash(user.id, tokens.refreshToken);

    return this.authResponse('Register successfully', user, tokens);
  }

  async login(dto: LoginDto) {
    const user = await this.usersService.findByEmail(
      dto.email.trim().toLowerCase(),
    );

    if (!user || user.status !== UserStatus.Active) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const isPasswordValid = await bcrypt.compare(
      dto.password,
      user.passwordHash,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const tokens = await this.issueTokens(user);
    await this.storeRefreshTokenHash(user.id, tokens.refreshToken);

    return this.authResponse('Login successfully', user, tokens);
  }

  async refreshTokens(authUser: AuthUser, refreshToken: string) {
    const user = await this.usersService.findById(authUser.id);

    if (!user || !user.refreshTokenHash) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const isRefreshTokenValid = await bcrypt.compare(
      refreshToken,
      user.refreshTokenHash,
    );

    if (!isRefreshTokenValid) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const tokens = await this.issueTokens(user);
    await this.storeRefreshTokenHash(user.id, tokens.refreshToken);

    return this.authResponse('Refresh token successfully', user, tokens);
  }

  async logout(authUser: AuthUser) {
    await this.usersService.updateRefreshTokenHash(authUser.id, null);

    return {
      success: true,
      message: 'Logout successfully',
      data: null,
    };
  }

  async getMe(authUser: AuthUser) {
    const user = await this.usersService.findById(authUser.id);

    if (!user || user.status !== UserStatus.Active) {
      throw new UnauthorizedException('Invalid access token');
    }

    return {
      success: true,
      message: 'Success',
      data: this.toPublicUser(user),
    };
  }

  private async issueTokens(user: User) {
    const payload = {
      sub: user.id,
      email: user.email,
    };
    const config = jwtConfig();

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: config.accessSecret,
        expiresIn: config.accessExpiresIn as JwtSignOptions['expiresIn'],
      }),
      this.jwtService.signAsync(payload, {
        secret: config.refreshSecret,
        expiresIn: config.refreshExpiresIn as JwtSignOptions['expiresIn'],
      }),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }

  private async storeRefreshTokenHash(userId: string, refreshToken: string) {
    const refreshTokenHash = await bcrypt.hash(refreshToken, this.saltRounds);
    await this.usersService.updateRefreshTokenHash(userId, refreshTokenHash);
  }

  private authResponse(
    message: string,
    user: User,
    tokens: { accessToken: string; refreshToken: string },
  ) {
    return {
      success: true,
      message,
      data: {
        user: this.toPublicUser(user),
        tokens,
      },
    };
  }

  private toPublicUser(user: User) {
    return this.usersService.toPublicUser(user);
  }
}
