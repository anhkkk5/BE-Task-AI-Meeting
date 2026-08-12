import type { Connection } from 'mongoose';
import { ObservabilityService } from '../../observability/observability.service';
export declare class MongodbObservabilityScheduler {
    private connection;
    private observability;
    constructor(connection: Connection, observability: ObservabilityService);
    check(): Promise<void>;
}
