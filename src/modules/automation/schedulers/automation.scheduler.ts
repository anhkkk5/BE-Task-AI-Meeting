import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { AutomationRepository } from '../repositories/automation.repository';
import { AutomationService } from '../services/automation.service';
@Injectable()
export class AutomationScheduler {
  constructor(private repo: AutomationRepository, private service: AutomationService) {}
  @Cron('0 */5 * * * *') async run() { for (const rule of await this.repo.enabledRules()) await this.service.runRule(rule); }
}
