import { Strategy } from 'passport-jwt';
import { UsersService } from '../../users/services/users.service';
import { AuthUser } from '../types/auth-user.type';
import { JwtPayload } from '../types/jwt-payload.type';
import { AuthSecurityRepository } from '../repositories/auth-security.repository';
declare const AccessTokenStrategy_base: new (...args: [opt: import("passport-jwt").StrategyOptionsWithRequest] | [opt: import("passport-jwt").StrategyOptionsWithoutRequest]) => Strategy & {
    validate(...args: any[]): unknown;
};
export declare class AccessTokenStrategy extends AccessTokenStrategy_base {
    private readonly usersService;
    private readonly securityRepository?;
    constructor(usersService: UsersService, securityRepository?: AuthSecurityRepository | undefined);
    validate(payload: JwtPayload): Promise<AuthUser>;
}
export {};
