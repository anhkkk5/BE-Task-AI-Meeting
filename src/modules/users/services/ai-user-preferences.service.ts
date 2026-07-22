import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UpdateAiUserPreferencesDto } from '../dto/update-ai-user-preferences.dto';
import { AiUserPreference } from '../entities/ai-user-preference.entity';
import {
  DEFAULT_AI_USER_PREFERENCES,
  ResolvedAiUserPreferences,
} from '../types/ai-user-preferences.type';

@Injectable()
export class AiUserPreferencesService {
  constructor(
    @InjectRepository(AiUserPreference)
    private readonly repository: Repository<AiUserPreference>,
  ) {}

  async getPreferences(userId: string) {
    return {
      success: true,
      message: 'Đã lấy cấu hình cá nhân hóa.',
      data: await this.getResolvedPreferences(userId),
    };
  }

  async updatePreferences(userId: string, dto: UpdateAiUserPreferencesDto) {
    const current = await this.repository.findOne({ where: { userId } });
    const resolved = this.resolve(current);
    const saved = await this.repository.save(
      this.repository.create({
        ...current,
        userId,
        responseStyle: dto.responseStyle ?? resolved.responseStyle,
        tone: dto.tone ?? resolved.tone,
        focusAreas: dto.focusAreas ? [...dto.focusAreas] : resolved.focusAreas,
      }),
    );

    return {
      success: true,
      message: 'Đã lưu cấu hình cá nhân hóa.',
      data: this.resolve(saved),
    };
  }

  async resetPreferences(userId: string) {
    await this.repository.delete({ userId });
    return {
      success: true,
      message: 'Đã khôi phục cấu hình mặc định.',
      data: this.defaultPreferences(),
    };
  }

  async getResolvedPreferences(
    userId: string,
  ): Promise<ResolvedAiUserPreferences> {
    const preference = await this.repository.findOne({ where: { userId } });
    return this.resolve(preference);
  }

  private resolve(
    preference: AiUserPreference | null,
  ): ResolvedAiUserPreferences {
    if (!preference) return this.defaultPreferences();

    return {
      responseStyle: preference.responseStyle,
      tone: preference.tone,
      focusAreas: preference.focusAreas?.length
        ? [...preference.focusAreas]
        : [...DEFAULT_AI_USER_PREFERENCES.focusAreas],
    };
  }

  private defaultPreferences(): ResolvedAiUserPreferences {
    return {
      ...DEFAULT_AI_USER_PREFERENCES,
      focusAreas: [...DEFAULT_AI_USER_PREFERENCES.focusAreas],
    };
  }
}
