import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ThrottlerModule } from '@nestjs/throttler';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthSession } from './entities/auth-session.entity';
import { AuthLoginAttempt } from './entities/auth-login-attempt.entity';
import { AuthSecurityRepository } from './repositories/auth-security.repository';
import { UsersModule } from '../users/users.module';
import { AuthController } from './controllers/auth.controller';
import { AccessTokenGuard } from './guards/access-token.guard';
import { RefreshTokenGuard } from './guards/refresh-token.guard';
import { AuthService } from './services/auth.service';
import { OtpService } from './services/otp.service';
import { AccessTokenStrategy } from './strategies/access-token.strategy';
import { RefreshTokenStrategy } from './strategies/refresh-token.strategy';

@Module({
  imports: [
    UsersModule,
    TypeOrmModule.forFeature([AuthSession, AuthLoginAttempt]),
    PassportModule,
    JwtModule.register({}),
    // Throttler chi bat o day thay vi toan app: cac endpoint OTP co the bi lam
    // dung de gui thu rac, con cac API khac chua can gioi han.
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 10 }]),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    OtpService,
    AccessTokenStrategy,
    RefreshTokenStrategy,
    AccessTokenGuard,
    RefreshTokenGuard,
    AuthSecurityRepository,
  ],
})
export class AuthModule {}
