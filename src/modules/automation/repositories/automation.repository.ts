import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AutomationRule } from '../entities/automation-rule.entity';
import { AutomationRun } from '../entities/automation-run.entity';
@Injectable()
export class AutomationRepository {
  constructor(
    @InjectRepository(AutomationRule) private rules: Repository<AutomationRule>,
    @InjectRepository(AutomationRun) private runs: Repository<AutomationRun>,
  ) {}
  listRules(projectId: string) {
    return this.rules.find({
      where: { projectId },
      order: { createdAt: 'DESC' },
    });
  }
  enabledRules() {
    return this.rules.find({ where: { enabled: true } });
  }
  findRule(id: string, projectId: string) {
    return this.rules.findOne({ where: { id, projectId } });
  }
  saveRule(data: Partial<AutomationRule>) {
    return this.rules.save(this.rules.create(data));
  }
  deleteRule(rule: AutomationRule) {
    return this.rules.remove(rule);
  }
  listRuns(ruleId: string) {
    return this.runs.find({
      where: { ruleId },
      order: { createdAt: 'DESC' },
      take: 100,
    });
  }
  findRun(id: string) {
    return this.runs.findOne({ where: { id } });
  }
  findExecution(key: string) {
    return this.runs.findOne({ where: { executionKey: key } });
  }
  saveRun(data: Partial<AutomationRun>) {
    return this.runs.save(this.runs.create(data));
  }
}
