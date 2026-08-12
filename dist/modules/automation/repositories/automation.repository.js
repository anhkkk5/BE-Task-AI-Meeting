"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AutomationRepository = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const automation_rule_entity_1 = require("../entities/automation-rule.entity");
const automation_run_entity_1 = require("../entities/automation-run.entity");
let AutomationRepository = class AutomationRepository {
    rules;
    runs;
    constructor(rules, runs) {
        this.rules = rules;
        this.runs = runs;
    }
    listRules(projectId) { return this.rules.find({ where: { projectId }, order: { createdAt: 'DESC' } }); }
    enabledRules() { return this.rules.find({ where: { enabled: true } }); }
    findRule(id, projectId) { return this.rules.findOne({ where: { id, projectId } }); }
    saveRule(data) { return this.rules.save(this.rules.create(data)); }
    deleteRule(rule) { return this.rules.remove(rule); }
    listRuns(ruleId) { return this.runs.find({ where: { ruleId }, order: { createdAt: 'DESC' }, take: 100 }); }
    findRun(id) { return this.runs.findOne({ where: { id } }); }
    findExecution(key) { return this.runs.findOne({ where: { executionKey: key } }); }
    saveRun(data) { return this.runs.save(this.runs.create(data)); }
};
exports.AutomationRepository = AutomationRepository;
exports.AutomationRepository = AutomationRepository = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(automation_rule_entity_1.AutomationRule)),
    __param(1, (0, typeorm_1.InjectRepository)(automation_run_entity_1.AutomationRun)),
    __metadata("design:paramtypes", [typeorm_2.Repository, typeorm_2.Repository])
], AutomationRepository);
//# sourceMappingURL=automation.repository.js.map