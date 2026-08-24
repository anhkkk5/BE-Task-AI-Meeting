import { Injectable, Optional, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-jwt';
import type { Request } from 'express';
import { jwtConfig } from '../../../config/jwt.config';
import { UserStatus } from '../../users/enums/user-status.enum';
import { UsersService } from '../../users/services/users.service';
import { AuthUser } from '../types/auth-user.type';
import { JwtPayload } from '../types/jwt-payload.type';
import { AuthSecurityRepository } from '../repositories/auth-security.repository';

@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(
    private readonly usersService: UsersService,
    @Optional() private readonly securityRepository?: AuthSecurityRepository,
  ) {
    super({
      jwtFromRequest: (request: Request) =>
        RefreshTokenStrategy.extractRefreshTokenFromCookie(request),
      secretOrKey: jwtConfig().refreshSecret,
      passReqToCallback: false,
    });
  }

  async validate(payload: JwtPayload): Promise<AuthUser> {
    const user = await this.usersService.findById(payload.sub);

    if (!user || user.status !== UserStatus.Active) {
      throw new UnauthorizedException('Invalid refresh token');
    }
    if (
      payload.sid &&
      this.securityRepository &&
      !(await this.securityRepository.findSession(payload.sid, user.id))
    )
      throw new UnauthorizedException('Session has been revoked');

    return {
      id: user.id,
      email: user.email,
      sessionId: payload.sid,
    };
  }

  private static extractRefreshTokenFromCookie(request: Request) {
    const cookieHeader = request?.headers?.cookie;

    if (!cookieHeader) {
      return null;
    }

    const cookies = cookieHeader.split(';').map((cookie) => cookie.trim());
    const refreshTokenCookie = cookies.find((cookie) =>
      cookie.startsWith('refreshToken='),
    );

    if (!refreshTokenCookie) {
      return null;
    }

    return decodeURIComponent(refreshTokenCookie.split('=').slice(1).join('='));
  }
}
