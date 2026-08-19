import { ConfigService } from '@nestjs/config';
import { UploadApiResponse } from 'cloudinary';
export declare class AvatarUploadService {
    private readonly configService;
    constructor(configService: ConfigService);
    upload(userId: string, file: Express.Multer.File): Promise<UploadApiResponse>;
}
