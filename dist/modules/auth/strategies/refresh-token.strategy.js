"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var RefreshTokenStrategy_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RefreshTokenStrategy = void 0;
const common_1 = require("@nestjs/common");
const passport_1 = require("@nestjs/passport");
const passport_jwt_1 = require("passport-jwt");
const jwt_config_1 = require("../../../config/jwt.config");
const user_status_enum_1 = require("../../users/enums/user-status.enum");
const users_service_1 = require("../../users/services/users.service");
let RefreshTokenStrategy = RefreshTokenStrategy_1 = class RefreshTokenStrategy extends (0, passport_1.PassportStrategy)(passport_jwt_1.Strategy, 'jwt-refresh') {
    usersService;
    constructor(usersService) {
        super({
            jwtFromRequest: (request) => RefreshTokenStrategy_1.extractRefreshTokenFromCookie(request),
            secretOrKey: (0, jwt_config_1.jwtConfig)().refreshSecret,
            passReqToCallback: false,
        });
        this.usersService = usersService;
    }
    async validate(payload) {
        const user = await this.usersService.findById(payload.sub);
        if (!user || user.status !== user_status_enum_1.UserStatus.Active) {
            throw new common_1.UnauthorizedException('Invalid refresh token');
        }
        return {
            id: user.id,
            email: user.email,
        };
    }
    static extractRefreshTokenFromCookie(request) {
        const cookieHeader = request?.headers?.cookie;
        if (!cookieHeader) {
            return null;
        }
        const cookies = cookieHeader.split(';').map((cookie) => cookie.trim());
        const refreshTokenCookie = cookies.find((cookie) => cookie.startsWith('refreshToken='));
        if (!refreshTokenCookie) {
            return null;
        }
        return decodeURIComponent(refreshTokenCookie.split('=').slice(1).join('='));
    }
};
exports.RefreshTokenStrategy = RefreshTokenStrategy;
exports.RefreshTokenStrategy = RefreshTokenStrategy = RefreshTokenStrategy_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [users_service_1.UsersService])
], RefreshTokenStrategy);
//# sourceMappingURL=refresh-token.strategy.js.map