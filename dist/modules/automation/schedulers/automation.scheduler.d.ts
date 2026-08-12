import { AutomationRepository } from '../repositories/automation.repository';
import { AutomationService } from '../services/automation.service';
import { ObservabilityService } from '../../observability/observability.service';
export declare class AutomationScheduler {
    private repo;
    private service;
    private observability;
    constructor(repo: AutomationRepository, service: AutomationService, observability: ObservabilityService);
    run(): Promise<void>;
}
