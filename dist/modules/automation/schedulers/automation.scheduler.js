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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AutomationScheduler = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const automation_repository_1 = require("../repositories/automation.repository");
const automation_service_1 = require("../services/automation.service");
const observability_service_1 = require("../../observability/observability.service");
let AutomationScheduler = class AutomationScheduler {
    repo;
    service;
    observability;
    constructor(repo, service, observability) {
        this.repo = repo;
        this.service = service;
        this.observability = observability;
    }
    async run() {
        const started = Date.now();
        try {
            const rules = await this.repo.enabledRules();
            for (const rule of rules)
                await this.service.runRule(rule);
            await this.observability.record({
                kind: 'SCHEDULER',
                status: 'SUCCESS',
                operation: 'automation.run',
                durationMs: Date.now() - started,
                error: null,
                metadata: { rules: rules.length },
            });
        }
        catch (error) {
            await this.observability.record({
                kind: 'SCHEDULER',
                status: 'FAILED',
                operation: 'automation.run',
                durationMs: Date.now() - started,
                error: error instanceof Error ? error.message : String(error),
                metadata: null,
            });
        }
    }
};
exports.AutomationScheduler = AutomationScheduler;
__decorate([
    (0, schedule_1.Cron)('0 */5 * * * *'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AutomationScheduler.prototype, "run", null);
exports.AutomationScheduler = AutomationScheduler = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [automation_repository_1.AutomationRepository,
        automation_service_1.AutomationService,
        observability_service_1.ObservabilityService])
], AutomationScheduler);
//# sourceMappingURL=automation.scheduler.js.map