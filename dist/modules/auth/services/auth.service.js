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
let AuthService = class AuthService {
    usersService;
    jwtService;
    otpService;
    mailService;
    saltRounds = 12;
    constructor(usersService, jwtService, otpService, mailService) {
        this.usersService = usersService;
        this.jwtService = jwtService;
        this.otpService = otpService;
        this.mailService = mailService;
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
    async login(dto) {
        const user = await this.usersService.findByEmail(dto.email.trim().toLowerCase());
        if (!user || user.status !== user_status_enum_1.UserStatus.Active) {
            throw new common_1.UnauthorizedException('Invalid email or password');
        }
        const isPasswordValid = await bcrypt.compare(dto.password, user.passwordHash);
        if (!isPasswordValid) {
            throw new common_1.UnauthorizedException('Invalid email or password');
        }
        const tokens = await this.issueTokens(user);
        await this.storeRefreshTokenHash(user.id, tokens.refreshToken);
        return this.authResponse('Login successfully', user, tokens);
    }
    async refreshTokens(authUser, refreshToken) {
        const user = await this.usersService.findById(authUser.id);
        if (!user || !user.refreshTokenHash) {
            throw new common_1.UnauthorizedException('Invalid refresh token');
        }
        const isRefreshTokenValid = await bcrypt.compare(refreshToken, user.refreshTokenHash);
        if (!isRefreshTokenValid) {
            throw new common_1.UnauthorizedException('Invalid refresh token');
        }
        const tokens = await this.issueTokens(user);
        await this.storeRefreshTokenHash(user.id, tokens.refreshToken);
        return this.authResponse('Refresh token successfully', user, tokens);
    }
    async logout(authUser) {
        await this.usersService.updateRefreshTokenHash(authUser.id, null);
        return {
            success: true,
            message: 'Logout successfully',
            data: null,
        };
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
    async issueTokens(user) {
        const payload = {
            sub: user.id,
            email: user.email,
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
    __metadata("design:paramtypes", [users_service_1.UsersService,
        jwt_1.JwtService,
        otp_service_1.OtpService,
        mail_service_1.MailService])
], AuthService);
//# sourceMappingURL=auth.service.js.map