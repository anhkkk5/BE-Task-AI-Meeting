import { CanActivate, ExecutionContext } from '@nestjs/common';
import { UsersRepository } from '../../modules/users/repositories/users.repository';
export declare class SystemAdminGuard implements CanActivate {
    private readonly usersRepository;
    constructor(usersRepository: UsersRepository);
    canActivate(context: ExecutionContext): Promise<boolean>;
}
