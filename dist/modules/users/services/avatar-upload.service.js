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
exports.AvatarUploadService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const cloudinary_1 = require("cloudinary");
let AvatarUploadService = class AvatarUploadService {
    configService;
    constructor(configService) {
        this.configService = configService;
        cloudinary_1.v2.config({
            cloud_name: this.configService.get('CLOUDINARY_CLOUD_NAME'),
            api_key: this.configService.get('CLOUDINARY_API_KEY'),
            api_secret: this.configService.get('CLOUDINARY_API_SECRET'),
            secure: true,
        });
    }
    upload(userId, file) {
        if (!file)
            throw new common_1.BadRequestException('Vui lòng chọn một ảnh');
        if (!file.mimetype.startsWith('image/')) {
            throw new common_1.BadRequestException('Tệp tải lên phải là hình ảnh');
        }
        if (file.size > 5 * 1024 * 1024) {
            throw new common_1.BadRequestException('Ảnh không được lớn hơn 5 MB');
        }
        const cloudName = this.configService.get('CLOUDINARY_CLOUD_NAME');
        const apiKey = this.configService.get('CLOUDINARY_API_KEY');
        const apiSecret = this.configService.get('CLOUDINARY_API_SECRET');
        if (!cloudName || !apiKey || !apiSecret) {
            throw new common_1.BadRequestException('Backend chưa cấu hình Cloudinary');
        }
        const folder = this.configService.get('CLOUDINARY_UPLOAD_FOLDER') || 'agile-ai';
        return new Promise((resolve, reject) => {
            const stream = cloudinary_1.v2.uploader.upload_stream({
                folder: `${folder}/avatars`,
                public_id: userId,
                overwrite: true,
                invalidate: true,
                resource_type: 'image',
                transformation: [
                    {
                        width: 512,
                        height: 512,
                        crop: 'fill',
                        gravity: 'face',
                        quality: 'auto',
                        fetch_format: 'auto',
                    },
                ],
            }, (error, result) => {
                if (error || !result)
                    return reject(new common_1.BadRequestException('Không thể tải ảnh lên Cloudinary'));
                resolve(result);
            });
            stream.end(file.buffer);
        });
    }
};
exports.AvatarUploadService = AvatarUploadService;
exports.AvatarUploadService = AvatarUploadService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], AvatarUploadService);
//# sourceMappingURL=avatar-upload.service.js.map