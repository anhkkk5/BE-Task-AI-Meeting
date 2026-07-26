import { AiReportEvent } from '../events/ai-report.event';
type AiReportListener = (event: AiReportEvent) => void | Promise<void>;
export declare class AiReportEventsService {
    private readonly logger;
    private readonly listeners;
    onAiReportEvent(listener: AiReportListener): () => boolean;
    publish(event: AiReportEvent): void;
}
export {};
