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
exports.AuthSecurityRepository = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const auth_session_entity_1 = require("../entities/auth-session.entity");
const auth_login_attempt_entity_1 = require("../entities/auth-login-attempt.entity");
let AuthSecurityRepository = class AuthSecurityRepository {
    sessions;
    attempts;
    constructor(sessions, attempts) {
        this.sessions = sessions;
        this.attempts = attempts;
    }
    createSession(data) {
        return this.sessions.save(this.sessions.create(data));
    }
    findSession(id, userId) {
        return this.sessions.findOne({
            where: { id, userId, revokedAt: (0, typeorm_2.IsNull)() },
        });
    }
    listSessions(userId) {
        return this.sessions.find({
            where: { userId },
            order: { lastUsedAt: 'DESC' },
        });
    }
    updateSession(id, data) {
        return this.sessions.update(id, data);
    }
    revokeSession(id, userId) {
        return this.sessions.update({ id, userId, revokedAt: (0, typeorm_2.IsNull)() }, { revokedAt: new Date(), refreshTokenHash: '' });
    }
    revokeOtherSessions(userId, currentId) {
        return this.sessions
            .createQueryBuilder()
            .update()
            .set({ revokedAt: new Date(), refreshTokenHash: '' })
            .where('user_id = :userId AND revoked_at IS NULL', { userId })
            .andWhere(currentId ? 'id <> :currentId' : '1=1', { currentId })
            .execute();
    }
    recordAttempt(data) {
        return this.attempts.save(this.attempts.create(data));
    }
};
exports.AuthSecurityRepository = AuthSecurityRepository;
exports.AuthSecurityRepository = AuthSecurityRepository = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(auth_session_entity_1.AuthSession)),
    __param(1, (0, typeorm_1.InjectRepository)(auth_login_attempt_entity_1.AuthLoginAttempt)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], AuthSecurityRepository);
//# sourceMappingURL=auth-security.repository.js.map