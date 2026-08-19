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
exports.UsersController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const platform_express_1 = require("@nestjs/platform-express");
const current_user_decorator_1 = require("../../../common/decorators/current-user.decorator");
const access_token_guard_1 = require("../../auth/guards/access-token.guard");
const change_password_dto_1 = require("../dto/change-password.dto");
const update_ai_user_preferences_dto_1 = require("../dto/update-ai-user-preferences.dto");
const update_profile_dto_1 = require("../dto/update-profile.dto");
const ai_user_preferences_service_1 = require("../services/ai-user-preferences.service");
const users_service_1 = require("../services/users.service");
const avatar_upload_service_1 = require("../services/avatar-upload.service");
let UsersController = class UsersController {
    usersService;
    aiUserPreferencesService;
    avatarUploadService;
    constructor(usersService, aiUserPreferencesService, avatarUploadService) {
        this.usersService = usersService;
        this.aiUserPreferencesService = aiUserPreferencesService;
        this.avatarUploadService = avatarUploadService;
    }
    getAiPreferences(user) {
        return this.aiUserPreferencesService.getPreferences(user.id);
    }
    updateAiPreferences(user, dto) {
        return this.aiUserPreferencesService.updatePreferences(user.id, dto);
    }
    resetAiPreferences(user) {
        return this.aiUserPreferencesService.resetPreferences(user.id);
    }
    getProfile(user) {
        return this.usersService.getProfile(user.id);
    }
    updateProfile(user, dto) {
        return this.usersService.updateProfile(user.id, dto);
    }
    async uploadAvatar(user, file) {
        const uploaded = await this.avatarUploadService.upload(user.id, file);
        return this.usersService.updateProfile(user.id, { avatarUrl: uploaded.secure_url });
    }
    changePassword(user, dto) {
        return this.usersService.changePassword(user.id, dto);
    }
};
exports.UsersController = UsersController;
__decorate([
    (0, common_1.Get)('me/ai-preferences'),
    (0, swagger_1.ApiOperation)({ summary: 'Xem cấu hình cá nhân hóa AI' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "getAiPreferences", null);
__decorate([
    (0, common_1.Patch)('me/ai-preferences'),
    (0, swagger_1.ApiOperation)({ summary: 'Cập nhật cấu hình cá nhân hóa AI' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, update_ai_user_preferences_dto_1.UpdateAiUserPreferencesDto]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "updateAiPreferences", null);
__decorate([
    (0, common_1.Delete)('me/ai-preferences'),
    (0, swagger_1.ApiOperation)({ summary: 'Khôi phục cấu hình AI mặc định' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "resetAiPreferences", null);
__decorate([
    (0, common_1.Get)('me'),
    (0, swagger_1.ApiOperation)({
        summary: 'Xem ho so ca nhan',
        description: 'Dan accessToken vao Authorize de lay profile user hien tai.',
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Lay profile thanh cong.' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Access token khong hop le.' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "getProfile", null);
__decorate([
    (0, common_1.Patch)('me'),
    (0, swagger_1.ApiOperation)({
        summary: 'Cap nhat ho so ca nhan',
        description: 'Dan accessToken vao Authorize, sau do gui cac field profile can cap nhat.',
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Cap nhat profile thanh cong.' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Request body khong hop le.' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Access token khong hop le.' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, update_profile_dto_1.UpdateProfileDto]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "updateProfile", null);
__decorate([
    (0, common_1.Post)('me/avatar'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('avatar', { limits: { fileSize: 5 * 1024 * 1024 } })),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, swagger_1.ApiBody)({ schema: { type: 'object', properties: { avatar: { type: 'string', format: 'binary' } }, required: ['avatar'] } }),
    (0, swagger_1.ApiOperation)({ summary: 'Tải ảnh đại diện lên Cloudinary' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "uploadAvatar", null);
__decorate([
    (0, common_1.Patch)('me/password'),
    (0, swagger_1.ApiOperation)({
        summary: 'Doi mat khau',
        description: 'Dan accessToken vao Authorize. Can nhap currentPassword va newPassword.',
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Doi mat khau thanh cong.' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Request body khong hop le.' }),
    (0, swagger_1.ApiResponse)({
        status: 401,
        description: 'Access token khong hop le hoac currentPassword sai.',
    }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, change_password_dto_1.ChangePasswordDto]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "changePassword", null);
exports.UsersController = UsersController = __decorate([
    (0, common_1.Controller)('users'),
    (0, swagger_1.ApiTags)('Users'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(access_token_guard_1.AccessTokenGuard),
    __metadata("design:paramtypes", [users_service_1.UsersService,
        ai_user_preferences_service_1.AiUserPreferencesService,
        avatar_upload_service_1.AvatarUploadService])
], UsersController);
//# sourceMappingURL=users.controller.js.map