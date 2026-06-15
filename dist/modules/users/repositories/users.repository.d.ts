import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
export declare class UsersRepository {
    private readonly repository;
    constructor(repository: Repository<User>);
    create(data: Partial<User>): User;
    save(user: User): Promise<User>;
    findById(id: string): Promise<User | null>;
    findByEmail(email: string): Promise<User | null>;
    updateRefreshTokenHash(id: string, refreshTokenHash: string | null): Promise<void>;
    update(id: string, data: Partial<User>): Promise<User | null>;
}
