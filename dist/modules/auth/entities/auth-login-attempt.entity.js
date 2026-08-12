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
exports.AuthLoginAttempt = void 0;
const typeorm_1 = require("typeorm");
let AuthLoginAttempt = class AuthLoginAttempt {
    id;
    userId;
    email;
    success;
    reason;
    ipAddress;
    userAgent;
    createdAt;
};
exports.AuthLoginAttempt = AuthLoginAttempt;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], AuthLoginAttempt.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Index)(),
    (0, typeorm_1.Column)({ name: 'user_id', type: 'char', length: 36, nullable: true }),
    __metadata("design:type", Object)
], AuthLoginAttempt.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.Index)(),
    (0, typeorm_1.Column)({ length: 255 }),
    __metadata("design:type", String)
], AuthLoginAttempt.prototype, "email", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'tinyint', width: 1 }),
    __metadata("design:type", Boolean)
], AuthLoginAttempt.prototype, "success", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 60 }),
    __metadata("design:type", String)
], AuthLoginAttempt.prototype, "reason", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'ip_address', type: 'varchar', length: 64, nullable: true }),
    __metadata("design:type", Object)
], AuthLoginAttempt.prototype, "ipAddress", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'user_agent', type: 'varchar', length: 500, nullable: true }),
    __metadata("design:type", Object)
], AuthLoginAttempt.prototype, "userAgent", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], AuthLoginAttempt.prototype, "createdAt", void 0);
exports.AuthLoginAttempt = AuthLoginAttempt = __decorate([
    (0, typeorm_1.Entity)('auth_login_attempts')
], AuthLoginAttempt);
//# sourceMappingURL=auth-login-attempt.entity.js.map