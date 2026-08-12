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
exports.AuthController = void 0;
const common_1 = require("@nestjs/common");
const throttler_1 = require("@nestjs/throttler");
const swagger_1 = require("@nestjs/swagger");
const current_user_decorator_1 = require("../../../common/decorators/current-user.decorator");
const login_dto_1 = require("../dto/login.dto");
const register_dto_1 = require("../dto/register.dto");
const resend_otp_dto_1 = require("../dto/resend-otp.dto");
const verify_otp_dto_1 = require("../dto/verify-otp.dto");
const forgot_password_dto_1 = require("../dto/forgot-password.dto");
const reset_password_dto_1 = require("../dto/reset-password.dto");
const verify_mfa_dto_1 = require("../dto/verify-mfa.dto");
const access_token_guard_1 = require("../guards/access-token.guard");
const refresh_token_guard_1 = require("../guards/refresh-token.guard");
const auth_service_1 = require("../services/auth.service");
const REFRESH_TOKEN_COOKIE = 'refreshToken';
let AuthController = class AuthController {
    authService;
    constructor(authService) {
        this.authService = authService;
    }
    register(dto) {
        return this.authService.register(dto);
    }
    async verifyOtp(dto, response) {
        const result = await this.authService.verifyRegistrationOtp(dto);
        this.setRefreshTokenCookie(response, result.refreshToken);
        return result.body;
    }
    resendOtp(dto) {
        return this.authService.resendRegistrationOtp(dto);
    }
    async login(dto, response) {
        const result = await this.authService.login(dto);
        if ('mfaRequired' in result)
            return result.body;
        this.setRefreshTokenCookie(response, result.refreshToken);
        return result.body;
    }
    forgotPassword(dto) { return this.authService.forgotPassword(dto); }
    resetPassword(dto) { return this.authService.resetPassword(dto); }
    async verifyMfa(dto, response) {
        const result = await this.authService.verifyMfa(dto);
        this.setRefreshTokenCookie(response, result.refreshToken);
        return result.body;
    }
    setMfa(user, dto) { return this.authService.setMfa(user, dto.enabled === true); }
    refresh(user, request, response) {
        const refreshToken = this.getRefreshTokenFromCookie(request);
        if (!refreshToken) {
            throw new common_1.UnauthorizedException('Invalid refresh token');
        }
        return this.authService.refreshTokens(user, refreshToken).then((result) => {
            this.setRefreshTokenCookie(response, result.refreshToken);
            return result.body;
        });
    }
    async logout(user, response) {
        this.clearRefreshTokenCookie(response);
        return this.authService.logout(user);
    }
    me(user) {
        return this.authService.getMe(user);
    }
    setRefreshTokenCookie(response, refreshToken) {
        response.cookie(REFRESH_TOKEN_COOKIE, refreshToken, this.getRefreshTokenCookieOptions());
    }
    clearRefreshTokenCookie(response) {
        response.clearCookie(REFRESH_TOKEN_COOKIE, this.getRefreshTokenCookieBaseOptions());
    }
    getRefreshTokenFromCookie(request) {
        const cookieHeader = request.headers.cookie;
        if (!cookieHeader) {
            return null;
        }
        const cookies = cookieHeader.split(';').map((cookie) => cookie.trim());
        const refreshTokenCookie = cookies.find((cookie) => cookie.startsWith(`${REFRESH_TOKEN_COOKIE}=`));
        if (!refreshTokenCookie) {
            return null;
        }
        return decodeURIComponent(refreshTokenCookie.split('=').slice(1).join('='));
    }
    getRefreshTokenCookieOptions() {
        return {
            ...this.getRefreshTokenCookieBaseOptions(),
            httpOnly: true,
            maxAge: this.getRefreshTokenCookieMaxAge(),
        };
    }
    getRefreshTokenCookieBaseOptions() {
        const isProduction = process.env.NODE_ENV === 'production' || process.env.RENDER === 'true';
        const configuredSameSite = process.env.REFRESH_COOKIE_SAME_SITE?.trim().toLowerCase();
        const sameSite = configuredSameSite === 'lax' ||
            configuredSameSite === 'strict' ||
            configuredSameSite === 'none'
            ? configuredSameSite
            : isProduction
                ? 'none'
                : 'lax';
        const configuredSecure = process.env.REFRESH_COOKIE_SECURE?.trim().toLowerCase();
        const secure = configuredSecure === 'true'
            ? true
            : configuredSecure === 'false'
                ? false
                : sameSite === 'none' || isProduction;
        return {
            httpOnly: true,
            path: '/api/v1/auth',
            sameSite,
            secure,
        };
    }
    getRefreshTokenCookieMaxAge() {
        const expiresIn = process.env.JWT_REFRESH_EXPIRES_IN ?? '7d';
        const match = expiresIn.match(/^(\d+)([smhd])$/);
        if (!match) {
            return 7 * 24 * 60 * 60 * 1000;
        }
        const value = Number(match[1]);
        const unit = match[2];
        const multipliers = {
            s: 1000,
            m: 60 * 1000,
            h: 60 * 60 * 1000,
            d: 24 * 60 * 60 * 1000,
        };
        return value * multipliers[unit];
    }
};
exports.AuthController = AuthController;
__decorate([
    (0, common_1.Post)('register'),
    (0, common_1.UseGuards)(throttler_1.ThrottlerGuard),
    (0, throttler_1.Throttle)({ default: { limit: 5, ttl: 60_000 } }),
    (0, swagger_1.ApiOperation)({
        summary: 'Buoc 1: yeu cau ma xac thuc dang ky',
        description: 'Kiem tra email chua ton tai roi gui OTP 6 so den email. Chua tao tai khoan va chua tra token o buoc nay.',
    }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Da gui ma xac thuc.' }),
    (0, swagger_1.ApiResponse)({
        status: 400,
        description: 'Request body khong hop le hoac chua het thoi gian cho gui lai.',
    }),
    (0, swagger_1.ApiResponse)({ status: 409, description: 'Email da ton tai.' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [register_dto_1.RegisterDto]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "register", null);
__decorate([
    (0, common_1.Post)('verify-otp'),
    (0, common_1.UseGuards)(throttler_1.ThrottlerGuard),
    (0, throttler_1.Throttle)({ default: { limit: 10, ttl: 60_000 } }),
    (0, swagger_1.ApiOperation)({
        summary: 'Buoc 2: xac thuc OTP va tao tai khoan',
        description: 'OTP dung thi tao tai khoan, danh dau email da xac thuc va tra accessToken/refreshToken.',
    }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Xac thuc thanh cong.' }),
    (0, swagger_1.ApiResponse)({
        status: 400,
        description: 'OTP sai, het han hoac vuot so lan thu cho phep.',
    }),
    (0, swagger_1.ApiResponse)({ status: 409, description: 'Email da ton tai.' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [verify_otp_dto_1.VerifyOtpDto, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "verifyOtp", null);
__decorate([
    (0, common_1.Post)('resend-otp'),
    (0, common_1.UseGuards)(throttler_1.ThrottlerGuard),
    (0, throttler_1.Throttle)({ default: { limit: 3, ttl: 60_000 } }),
    (0, swagger_1.ApiOperation)({
        summary: 'Gui lai ma xac thuc',
        description: 'Cap OTP moi cho yeu cau dang ky dang cho. Moi lan gui cach nhau it nhat 60 giay.',
    }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Da gui lai ma xac thuc.' }),
    (0, swagger_1.ApiResponse)({
        status: 400,
        description: 'Chua het thoi gian cho hoac khong co yeu cau dang ky nao.',
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [resend_otp_dto_1.ResendOtpDto]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "resendOtp", null);
__decorate([
    (0, common_1.Post)('login'),
    (0, swagger_1.ApiOperation)({
        summary: 'Dang nhap',
        description: 'Nhap email/password de lay accessToken va refreshToken.',
    }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Dang nhap thanh cong.' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Request body khong hop le.' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Sai email hoac mat khau.' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [login_dto_1.LoginDto, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "login", null);
__decorate([
    (0, common_1.Post)('forgot-password'),
    (0, common_1.UseGuards)(throttler_1.ThrottlerGuard),
    (0, throttler_1.Throttle)({ default: { limit: 3, ttl: 60_000 } }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [forgot_password_dto_1.ForgotPasswordDto]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "forgotPassword", null);
__decorate([
    (0, common_1.Post)('reset-password'),
    (0, common_1.UseGuards)(throttler_1.ThrottlerGuard),
    (0, throttler_1.Throttle)({ default: { limit: 5, ttl: 60_000 } }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [reset_password_dto_1.ResetPasswordDto]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "resetPassword", null);
__decorate([
    (0, common_1.Post)('mfa/verify'),
    (0, common_1.UseGuards)(throttler_1.ThrottlerGuard),
    (0, throttler_1.Throttle)({ default: { limit: 5, ttl: 60_000 } }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [verify_mfa_dto_1.VerifyMfaDto, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "verifyMfa", null);
__decorate([
    (0, common_1.Patch)('mfa'),
    (0, common_1.UseGuards)(access_token_guard_1.AccessTokenGuard),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "setMfa", null);
__decorate([
    (0, common_1.Post)('refresh'),
    (0, swagger_1.ApiOperation)({
        summary: 'Lam moi token',
        description: 'Refresh token duoc gui tu HttpOnly cookie, FE khong doc truc tiep token nay.',
    }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Cap token moi thanh cong.' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Refresh token khong hop le.' }),
    (0, common_1.UseGuards)(refresh_token_guard_1.RefreshTokenGuard),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "refresh", null);
__decorate([
    (0, common_1.Post)('logout'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({
        summary: 'Dang xuat',
        description: 'Dan accessToken vao Authorize. API se xoa refresh token hash trong DB.',
    }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Dang xuat thanh cong.' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Access token khong hop le.' }),
    (0, common_1.UseGuards)(access_token_guard_1.AccessTokenGuard),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "logout", null);
__decorate([
    (0, common_1.Get)('me'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({
        summary: 'Lay thong tin user hien tai',
        description: 'Dan accessToken vao Authorize de xem user dang dang nhap.',
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Lay thong tin thanh cong.' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Access token khong hop le.' }),
    (0, common_1.UseGuards)(access_token_guard_1.AccessTokenGuard),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "me", null);
exports.AuthController = AuthController = __decorate([
    (0, common_1.Controller)('auth'),
    (0, swagger_1.ApiTags)('Auth'),
    __metadata("design:paramtypes", [auth_service_1.AuthService])
], AuthController);
//# sourceMappingURL=auth.controller.js.map