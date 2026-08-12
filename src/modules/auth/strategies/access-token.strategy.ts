import { Injectable, Optional, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { jwtConfig } from '../../../config/jwt.config';
import { UserStatus } from '../../users/enums/user-status.enum';
import { UsersService } from '../../users/services/users.service';
import { AuthUser } from '../types/auth-user.type';
import { JwtPayload } from '../types/jwt-payload.type';
import { AuthSecurityRepository } from '../repositories/auth-security.repository';

@Injectable()
export class AccessTokenStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(private readonly usersService: UsersService, @Optional() private readonly securityRepository?: AuthSecurityRepository) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: jwtConfig().accessSecret,
    });
  }

  async validate(payload: JwtPayload): Promise<AuthUser> {
    const user = await this.usersService.findById(payload.sub);

    if (!user || user.status !== UserStatus.Active) {
      throw new UnauthorizedException('Invalid access token');
    }
    if (payload.sid && this.securityRepository && !(await this.securityRepository.findSession(payload.sid, user.id))) throw new UnauthorizedException('Session has been revoked');

    return {
      id: user.id,
      email: user.email,
      sessionId: payload.sid,
    };
  }
}
