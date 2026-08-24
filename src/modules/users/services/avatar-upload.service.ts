import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';

@Injectable()
export class AvatarUploadService {
  constructor(private readonly configService: ConfigService) {
    cloudinary.config({
      cloud_name: this.configService.get<string>('CLOUDINARY_CLOUD_NAME'),
      api_key: this.configService.get<string>('CLOUDINARY_API_KEY'),
      api_secret: this.configService.get<string>('CLOUDINARY_API_SECRET'),
      secure: true,
    });
  }

  upload(
    userId: string,
    file: Express.Multer.File,
  ): Promise<UploadApiResponse> {
    if (!file) throw new BadRequestException('Vui lòng chọn một ảnh');
    if (!file.mimetype.startsWith('image/')) {
      throw new BadRequestException('Tệp tải lên phải là hình ảnh');
    }
    if (file.size > 5 * 1024 * 1024) {
      throw new BadRequestException('Ảnh không được lớn hơn 5 MB');
    }

    const cloudName = this.configService.get<string>('CLOUDINARY_CLOUD_NAME');
    const apiKey = this.configService.get<string>('CLOUDINARY_API_KEY');
    const apiSecret = this.configService.get<string>('CLOUDINARY_API_SECRET');
    if (!cloudName || !apiKey || !apiSecret) {
      throw new BadRequestException('Backend chưa cấu hình Cloudinary');
    }

    const folder =
      this.configService.get<string>('CLOUDINARY_UPLOAD_FOLDER') || 'agile-ai';
    return new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
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
        },
        (error, result) => {
          if (error || !result)
            return reject(
              new BadRequestException('Không thể tải ảnh lên Cloudinary'),
            );
          resolve(result);
        },
      );
      stream.end(file.buffer);
    });
  }
}
