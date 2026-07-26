import { HandoverEvent } from '../events/handover.event';
type HandoverListener = (event: HandoverEvent) => void | Promise<void>;
export declare class HandoverEventsService {
    private readonly logger;
    private readonly listeners;
    onHandoverEvent(listener: HandoverListener): () => boolean;
    publish(event: HandoverEvent): void;
}
export {};
