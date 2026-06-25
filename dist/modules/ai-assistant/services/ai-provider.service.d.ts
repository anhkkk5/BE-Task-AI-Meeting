import { PersonalDailyReportOutput } from '../schemas/ai-report.schema';
import { PersonalReportInputData } from './ai-report-data-builder.service';
export type AiProviderResult = {
    model: string;
    rawResponse: string;
    output: PersonalDailyReportOutput;
};
export declare class AiProviderService {
    generatePersonalDailyReport(prompt: string, inputData: PersonalReportInputData): Promise<AiProviderResult>;
    private resolveMockResponse;
    private generateMockResponse;
}
