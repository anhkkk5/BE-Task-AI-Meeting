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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthSession = void 0;
const typeorm_1 = require("typeorm");
let AuthSession = class AuthSession {
    id;
    userId;
    refreshTokenHash;
    userAgent;
    ipAddress;
    lastUsedAt;
    expiresAt;
    revokedAt;
    createdAt;
    updatedAt;
};
exports.AuthSession = AuthSession;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], AuthSession.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Index)(),
    (0, typeorm_1.Column)({ name: 'user_id', type: 'char', length: 36 }),
    __metadata("design:type", String)
], AuthSession.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'refresh_token_hash', length: 255 }),
    __metadata("design:type", String)
], AuthSession.prototype, "refreshTokenHash", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'user_agent', type: 'varchar', length: 500, nullable: true }),
    __metadata("design:type", Object)
], AuthSession.prototype, "userAgent", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'ip_address', type: 'varchar', length: 64, nullable: true }),
    __metadata("design:type", Object)
], AuthSession.prototype, "ipAddress", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'last_used_at', type: 'datetime', precision: 6 }),
    __metadata("design:type", Date)
], AuthSession.prototype, "lastUsedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'expires_at', type: 'datetime', precision: 6 }),
    __metadata("design:type", Date)
], AuthSession.prototype, "expiresAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'revoked_at', type: 'datetime', precision: 6, nullable: true }),
    __metadata("design:type", Object)
], AuthSession.prototype, "revokedAt", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], AuthSession.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], AuthSession.prototype, "updatedAt", void 0);
exports.AuthSession = AuthSession = __decorate([
    (0, typeorm_1.Entity)('auth_sessions')
], AuthSession);
//# sourceMappingURL=auth-session.entity.js.map