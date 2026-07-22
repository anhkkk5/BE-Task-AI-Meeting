import { Repository } from 'typeorm';
import { UpdateAiUserPreferencesDto } from '../dto/update-ai-user-preferences.dto';
import { AiUserPreference } from '../entities/ai-user-preference.entity';
import { ResolvedAiUserPreferences } from '../types/ai-user-preferences.type';
export declare class AiUserPreferencesService {
    private readonly repository;
    constructor(repository: Repository<AiUserPreference>);
    getPreferences(userId: string): Promise<{
        success: boolean;
        message: string;
        data: ResolvedAiUserPreferences;
    }>;
    updatePreferences(userId: string, dto: UpdateAiUserPreferencesDto): Promise<{
        success: boolean;
        message: string;
        data: ResolvedAiUserPreferences;
    }>;
    resetPreferences(userId: string): Promise<{
        success: boolean;
        message: string;
        data: ResolvedAiUserPreferences;
    }>;
    getResolvedPreferences(userId: string): Promise<ResolvedAiUserPreferences>;
    private resolve;
    private defaultPreferences;
}
