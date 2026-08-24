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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AccessTokenStrategy = void 0;
const common_1 = require("@nestjs/common");
const passport_1 = require("@nestjs/passport");
const passport_jwt_1 = require("passport-jwt");
const jwt_config_1 = require("../../../config/jwt.config");
const user_status_enum_1 = require("../../users/enums/user-status.enum");
const users_service_1 = require("../../users/services/users.service");
const auth_security_repository_1 = require("../repositories/auth-security.repository");
let AccessTokenStrategy = class AccessTokenStrategy extends (0, passport_1.PassportStrategy)(passport_jwt_1.Strategy, 'jwt') {
    usersService;
    securityRepository;
    constructor(usersService, securityRepository) {
        super({
            jwtFromRequest: passport_jwt_1.ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: (0, jwt_config_1.jwtConfig)().accessSecret,
        });
        this.usersService = usersService;
        this.securityRepository = securityRepository;
    }
    async validate(payload) {
        const user = await this.usersService.findById(payload.sub);
        if (!user || user.status !== user_status_enum_1.UserStatus.Active) {
            throw new common_1.UnauthorizedException('Invalid access token');
        }
        if (payload.sid &&
            this.securityRepository &&
            !(await this.securityRepository.findSession(payload.sid, user.id)))
            throw new common_1.UnauthorizedException('Session has been revoked');
        return {
            id: user.id,
            email: user.email,
            sessionId: payload.sid,
        };
    }
};
exports.AccessTokenStrategy = AccessTokenStrategy;
exports.AccessTokenStrategy = AccessTokenStrategy = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, common_1.Optional)()),
    __metadata("design:paramtypes", [users_service_1.UsersService,
        auth_security_repository_1.AuthSecurityRepository])
], AccessTokenStrategy);
//# sourceMappingURL=access-token.strategy.js.map