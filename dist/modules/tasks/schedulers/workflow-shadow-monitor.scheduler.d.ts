import { DataSource } from 'typeorm';
import { ObservabilityService } from '../../observability/observability.service';
export declare class WorkflowShadowMonitorScheduler {
    private dataSource;
    private observability;
    constructor(dataSource: DataSource, observability: ObservabilityService);
    check(): Promise<void>;
}
