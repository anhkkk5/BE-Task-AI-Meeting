import { AutomationRepository } from '../repositories/automation.repository';
import { AutomationService } from '../services/automation.service';
export declare class AutomationScheduler {
    private repo;
    private service;
    constructor(repo: AutomationRepository, service: AutomationService);
    run(): Promise<void>;
}
