"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const bcrypt = __importStar(require("bcrypt"));
const jwt_config_1 = require("../../../config/jwt.config");
const mail_service_1 = require("../../mail/services/mail.service");
const mail_templates_1 = require("../../mail/templates/mail-templates");
const user_status_enum_1 = require("../../users/enums/user-status.enum");
const users_service_1 = require("../../users/services/users.service");
const otp_service_1 = require("./otp.service");
const auth_security_repository_1 = require("../repositories/auth-security.repository");
const crypto_1 = require("crypto");
let AuthService = class AuthService {
    usersService;
    jwtService;
    otpService;
    mailService;
    authSecurityRepository;
    saltRounds = 12;
    constructor(usersService, jwtService, otpService, mailService, authSecurityRepository) {
        this.usersService = usersService;
        this.jwtService = jwtService;
        this.otpService = otpService;
        this.mailService = mailService;
        this.authSecurityRepository = authSecurityRepository;
    }
    async register(dto) {
        const email = dto.email.trim().toLowerCase();
        const existingUser = await this.usersService.findByEmail(email);
        if (existingUser) {
            throw new common_1.ConflictException('Email already exists');
        }
        const cooldown = await this.otpService.getResendCooldownSeconds(email);
        if (cooldown > 0) {
            throw new common_1.BadRequestException(`Ma xac thuc vua duoc gui. Vui long cho ${cooldown} giay truoc khi yeu cau lai.`);
        }
        const fullName = dto.fullName.trim();
        const passwordHash = await bcrypt.hash(dto.password, this.saltRounds);
        const otp = this.otpService.generateOtp();
        await this.otpService.savePendingRegistration({ email, fullName, passwordHash }, otp);
        await this.sendOtpMail(email, fullName, otp);
        return {
            success: true,
            message: 'Ma xac thuc da duoc gui den email cua ban.',
            data: {
                email,
                otpExpiresInSeconds: otp_service_1.OTP_TTL_SECONDS,
                resendAfterSeconds: otp_service_1.OTP_RESEND_COOLDOWN_SECONDS,
            },
        };
    }
    async verifyRegistrationOtp(dto) {
        const email = dto.email.trim().toLowerCase();
        const result = await this.otpService.verifyOtp(email, dto.otp);
        if (result.status === 'NOT_FOUND') {
            throw new common_1.BadRequestException('Ma xac thuc khong ton tai hoac da het han. Vui long dang ky lai.');
        }
        if (result.status === 'TOO_MANY_ATTEMPTS') {
            throw new common_1.BadRequestException(`Ban da nhap sai qua ${otp_service_1.OTP_MAX_ATTEMPTS} lan. Vui long dang ky lai de nhan ma moi.`);
        }
        if (result.status === 'INVALID') {
            throw new common_1.BadRequestException(`Ma xac thuc khong dung. Ban con ${result.remainingAttempts} lan thu.`);
        }
        const existingUser = await this.usersService.findByEmail(email);
        if (existingUser) {
            await this.otpService.clearPendingRegistration(email);
            throw new common_1.ConflictException('Email already exists');
        }
        const user = await this.usersService.create({
            email: result.registration.email,
            fullName: result.registration.fullName,
            passwordHash: result.registration.passwordHash,
            status: user_status_enum_1.UserStatus.Active,
            emailVerifiedAt: new Date(),
        });
        await this.otpService.clearPendingRegistration(email);
        const tokens = await this.issueTokens(user);
        await this.storeRefreshTokenHash(user.id, tokens.refreshToken);
        return this.authResponse('Register successfully', user, tokens);
    }
    async resendRegistrationOtp(dto) {
        const email = dto.email.trim().toLowerCase();
        const cooldown = await this.otpService.getResendCooldownSeconds(email);
        if (cooldown > 0) {
            throw new common_1.BadRequestException(`Vui long cho ${cooldown} giay truoc khi yeu cau ma moi.`);
        }
        const pending = await this.otpService.getPendingRegistration(email);
        if (!pending) {
            throw new common_1.BadRequestException('Khong tim thay yeu cau dang ky nao dang cho. Vui long dang ky lai.');
        }
        const otp = this.otpService.generateOtp();
        await this.otpService.refreshOtp(email, otp);
        await this.sendOtpMail(email, pending.fullName, otp);
        return {
            success: true,
            message: 'Ma xac thuc moi da duoc gui.',
            data: {
                email,
                otpExpiresInSeconds: otp_service_1.OTP_TTL_SECONDS,
                resendAfterSeconds: otp_service_1.OTP_RESEND_COOLDOWN_SECONDS,
            },
        };
    }
    async sendOtpMail(email, fullName, otp) {
        const mail = (0, mail_templates_1.buildOtpMail)({
            fullName,
            otp,
            expiresInMinutes: Math.round(otp_service_1.OTP_TTL_SECONDS / 60),
        });
        try {
            await this.mailService.sendMail({
                to: email,
                subject: mail.subject,
                html: mail.html,
                text: mail.text,
            });
        }
        catch {
            await this.otpService.clearPendingRegistration(email);
            throw new common_1.BadRequestException('Khong gui duoc email xac thuc. Vui long kiem tra lai dia chi email hoac thu lai sau.');
        }
    }
    async login(dto, context = {}) {
        const email = dto.email.trim().toLowerCase();
        const user = await this.usersService.findByEmail(email);
        if (!user || user.status !== user_status_enum_1.UserStatus.Active) {
            await this.recordLoginAttempt(null, email, false, 'INVALID_ACCOUNT', context);
            throw new common_1.UnauthorizedException('Invalid email or password');
        }
        const isPasswordValid = await bcrypt.compare(dto.password, user.passwordHash);
        if (!isPasswordValid) {
            await this.recordLoginAttempt(user.id, email, false, 'INVALID_PASSWORD', context);
            throw new common_1.UnauthorizedException('Invalid email or password');
        }
        if (user.mfaEnabled) {
            const otp = this.otpService.generateOtp();
            await this.otpService.saveSecurityChallenge('mfa', user.email, otp, { userId: user.id, ...context });
            await this.sendSecurityOtp(user.email, user.fullName, otp, 'Mã xác thực đăng nhập');
            return { mfaRequired: true, body: { success: true, message: 'Cần xác thực MFA', data: { mfaRequired: true, email: user.email, otpExpiresInSeconds: otp_service_1.OTP_TTL_SECONDS } } };
        }
        const tokens = await this.issueSessionTokens(user, context);
        await this.recordLoginAttempt(user.id, email, true, 'PASSWORD', context);
        return this.authResponse('Login successfully', user, tokens);
    }
    async refreshTokens(authUser, refreshToken) {
        const user = await this.usersService.findById(authUser.id);
        const session = authUser.sessionId && this.authSecurityRepository ? await this.authSecurityRepository.findSession(authUser.sessionId, authUser.id) : null;
        if (!user || (!session && !user.refreshTokenHash)) {
            throw new common_1.UnauthorizedException('Invalid refresh token');
        }
        const isRefreshTokenValid = await bcrypt.compare(refreshToken, session?.refreshTokenHash ?? user.refreshTokenHash);
        if (!isRefreshTokenValid) {
            throw new common_1.UnauthorizedException('Invalid refresh token');
        }
        const tokens = await this.issueTokens(user, authUser.sessionId);
        if (session && this.authSecurityRepository)
            await this.authSecurityRepository.updateSession(session.id, { refreshTokenHash: await bcrypt.hash(tokens.refreshToken, this.saltRounds), lastUsedAt: new Date() });
        else
            await this.storeRefreshTokenHash(user.id, tokens.refreshToken);
        return this.authResponse('Refresh token successfully', user, tokens);
    }
    async logout(authUser) {
        if (authUser.sessionId && this.authSecurityRepository)
            await this.authSecurityRepository.revokeSession(authUser.sessionId, authUser.id);
        else
            await this.usersService.updateRefreshTokenHash(authUser.id, null);
        return {
            success: true,
            message: 'Logout successfully',
            data: null,
        };
    }
    async forgotPassword(dto) {
        const email = dto.email.trim().toLowerCase();
        const user = await this.usersService.findByEmail(email);
        if (user?.status === user_status_enum_1.UserStatus.Active) {
            const otp = this.otpService.generateOtp();
            await this.otpService.saveSecurityChallenge('reset', email, otp, { userId: user.id });
            await this.sendSecurityOtp(email, user.fullName, otp, 'Mã đặt lại mật khẩu');
        }
        return { success: true, message: 'Nếu email tồn tại, mã đặt lại mật khẩu đã được gửi.', data: { email, otpExpiresInSeconds: otp_service_1.OTP_TTL_SECONDS } };
    }
    async resetPassword(dto) {
        const email = dto.email.trim().toLowerCase();
        const result = await this.otpService.verifySecurityChallenge('reset', email, dto.otp);
        if (result.status !== 'OK')
            throw new common_1.BadRequestException('Mã xác thực không hợp lệ hoặc đã hết hạn');
        const user = await this.usersService.findByEmail(email);
        if (!user || result.data.userId !== user.id)
            throw new common_1.BadRequestException('Mã xác thực không hợp lệ');
        await this.usersService.updateSecurity(user.id, { passwordHash: await bcrypt.hash(dto.newPassword, this.saltRounds), refreshTokenHash: null });
        await this.authSecurityRepository?.revokeOtherSessions(user.id);
        return { success: true, message: 'Đặt lại mật khẩu thành công', data: null };
    }
    async setMfa(authUser, enabled) {
        const user = await this.usersService.updateSecurity(authUser.id, { mfaEnabled: enabled, refreshTokenHash: enabled ? null : undefined });
        if (enabled)
            await this.authSecurityRepository?.revokeOtherSessions(authUser.id, authUser.sessionId);
        return { success: true, message: enabled ? 'Đã bật MFA qua email' : 'Đã tắt MFA', data: user ? this.toPublicUser(user) : null };
    }
    async verifyMfa(dto) {
        const email = dto.email.trim().toLowerCase();
        const result = await this.otpService.verifySecurityChallenge('mfa', email, dto.otp);
        if (result.status !== 'OK')
            throw new common_1.UnauthorizedException('Mã MFA không hợp lệ hoặc đã hết hạn');
        const user = await this.usersService.findByEmail(email);
        if (!user || result.data.userId !== user.id || !user.mfaEnabled)
            throw new common_1.UnauthorizedException('Mã MFA không hợp lệ');
        const context = { ipAddress: result.data.ipAddress, userAgent: result.data.userAgent };
        const tokens = await this.issueSessionTokens(user, context);
        await this.recordLoginAttempt(user.id, email, true, 'MFA', context);
        return this.authResponse('Xác thực MFA thành công', user, tokens);
    }
    sendSecurityOtp(email, fullName, otp, subject) {
        return this.mailService.sendMail({ to: email, subject, html: `<p>Xin chào ${fullName},</p><p>Mã xác thực của bạn là <strong>${otp}</strong>. Mã hết hạn sau 10 phút.</p>`, text: `Mã xác thực của bạn là ${otp}. Mã hết hạn sau 10 phút.` });
    }
    async getMe(authUser) {
        const user = await this.usersService.findById(authUser.id);
        if (!user || user.status !== user_status_enum_1.UserStatus.Active) {
            throw new common_1.UnauthorizedException('Invalid access token');
        }
        return {
            success: true,
            message: 'Success',
            data: this.toPublicUser(user),
        };
    }
    async getSessions(authUser) {
        const items = this.authSecurityRepository ? await this.authSecurityRepository.listSessions(authUser.id) : [];
        return { success: true, message: 'Get sessions successfully', data: { items: items.map((item) => ({ id: item.id, current: item.id === authUser.sessionId, userAgent: item.userAgent, ipAddress: item.ipAddress, lastUsedAt: item.lastUsedAt, createdAt: item.createdAt, expiresAt: item.expiresAt, revokedAt: item.revokedAt })) } };
    }
    async revokeSession(authUser, sessionId) { await this.authSecurityRepository?.revokeSession(sessionId, authUser.id); return { success: true, message: 'Session revoked', data: null }; }
    async revokeOtherSessions(authUser) { await this.authSecurityRepository?.revokeOtherSessions(authUser.id, authUser.sessionId); return { success: true, message: 'Other sessions revoked', data: null }; }
    async issueTokens(user, sessionId) {
        const payload = {
            sub: user.id,
            email: user.email,
            ...(sessionId ? { sid: sessionId } : {}),
        };
        const config = (0, jwt_config_1.jwtConfig)();
        const [accessToken, refreshToken] = await Promise.all([
            this.jwtService.signAsync(payload, {
                secret: config.accessSecret,
                expiresIn: config.accessExpiresIn,
            }),
            this.jwtService.signAsync(payload, {
                secret: config.refreshSecret,
                expiresIn: config.refreshExpiresIn,
            }),
        ]);
        return {
            accessToken,
            refreshToken,
        };
    }
    async issueSessionTokens(user, context) {
        if (!this.authSecurityRepository) {
            const tokens = await this.issueTokens(user);
            await this.storeRefreshTokenHash(user.id, tokens.refreshToken);
            return tokens;
        }
        const sessionId = (0, crypto_1.randomUUID)();
        const tokens = await this.issueTokens(user, sessionId);
        const now = new Date();
        await this.authSecurityRepository.createSession({ id: sessionId, userId: user.id, refreshTokenHash: await bcrypt.hash(tokens.refreshToken, this.saltRounds), ipAddress: context.ipAddress ?? null, userAgent: context.userAgent?.slice(0, 500) ?? null, lastUsedAt: now, expiresAt: new Date(now.getTime() + 7 * 86400000), revokedAt: null });
        return tokens;
    }
    recordLoginAttempt(userId, email, success, reason, context) { return this.authSecurityRepository?.recordAttempt({ userId, email, success, reason, ipAddress: context.ipAddress ?? null, userAgent: context.userAgent?.slice(0, 500) ?? null }) ?? Promise.resolve(); }
    async storeRefreshTokenHash(userId, refreshToken) {
        const refreshTokenHash = await bcrypt.hash(refreshToken, this.saltRounds);
        await this.usersService.updateRefreshTokenHash(userId, refreshTokenHash);
    }
    authResponse(message, user, tokens) {
        return {
            body: {
                success: true,
                message,
                data: {
                    user: this.toPublicUser(user),
                    tokens: {
                        accessToken: tokens.accessToken,
                    },
                },
            },
            refreshToken: tokens.refreshToken,
        };
    }
    toPublicUser(user) {
        return this.usersService.toPublicUser(user);
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __param(4, (0, common_1.Optional)()),
    __metadata("design:paramtypes", [users_service_1.UsersService,
        jwt_1.JwtService,
        otp_service_1.OtpService,
        mail_service_1.MailService,
        auth_security_repository_1.AuthSecurityRepository])
], AuthService);
//# sourceMappingURL=auth.service.js.map