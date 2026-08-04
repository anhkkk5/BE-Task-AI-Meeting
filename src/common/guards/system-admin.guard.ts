import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersRepository } from '../../modules/users/repositories/users.repository';

type RequestWithUser = {
  user?: { id: string };
};

@Injectable()
export class SystemAdminGuard implements CanActivate {
  constructor(private readonly usersRepository: UsersRepository) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const userId = request.user?.id;

    if (!userId) {
      throw new UnauthorizedException('Unauthorized');
    }

    const user = await this.usersRepository.findById(userId);

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    if (!user.isSystemAdmin) {
      throw new ForbiddenException(
        'Chỉ Quản trị viên hệ thống mới được truy cập tính năng này.',
      );
    }

    return true;
  }
}
