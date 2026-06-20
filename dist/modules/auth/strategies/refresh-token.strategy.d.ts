import { Strategy } from 'passport-jwt';
import { UsersService } from '../../users/services/users.service';
import { AuthUser } from '../types/auth-user.type';
import { JwtPayload } from '../types/jwt-payload.type';
declare const RefreshTokenStrategy_base: new (...args: [opt: import("passport-jwt").StrategyOptionsWithRequest] | [opt: import("passport-jwt").StrategyOptionsWithoutRequest]) => Strategy & {
    validate(...args: any[]): unknown;
};
export declare class RefreshTokenStrategy extends RefreshTokenStrategy_base {
    private readonly usersService;
    constructor(usersService: UsersService);
    validate(payload: JwtPayload): Promise<AuthUser>;
    private static extractRefreshTokenFromCookie;
}
export {};
