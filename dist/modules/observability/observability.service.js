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
var ObservabilityService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ObservabilityService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const admin_audit_log_entity_1 = require("./entities/admin-audit-log.entity");
const observability_event_entity_1 = require("./entities/observability-event.entity");
let ObservabilityService = ObservabilityService_1 = class ObservabilityService {
    audits;
    events;
    logger = new common_1.Logger(ObservabilityService_1.name);
    constructor(audits, events) {
        this.audits = audits;
        this.events = events;
    }
    audit(input) { return this.audits.save(this.audits.create(input)); }
    async record(input) { try {
        const event = await this.events.save(this.events.create(input));
        if (input.status === 'FAILED')
            this.logger.error(`[ALERT] ${input.kind}/${input.operation}: ${input.error ?? 'failed'}`);
        return event;
    }
    catch (error) {
        this.logger.error(`Cannot persist telemetry: ${error instanceof Error ? error.message : error}`);
        return null;
    } }
    async auditLogs(page = 1, limit = 50) { const [items, total] = await this.audits.findAndCount({ order: { createdAt: 'DESC' }, skip: (page - 1) * limit, take: limit }); return { items, total, page, limit }; }
    async summary(hours = 24) { const since = new Date(Date.now() - hours * 3600000); const items = await this.events.find({ where: { createdAt: (0, typeorm_2.MoreThanOrEqual)(since) }, order: { createdAt: 'DESC' }, take: 500 }); const ai = items.filter((item) => item.kind === 'AI'); return { windowHours: hours, totals: { events: items.length, failures: items.filter((item) => item.status === 'FAILED').length, slowApis: items.filter((item) => item.kind === 'API' && item.status === 'SLOW').length, failedJobs: items.filter((item) => item.kind === 'SCHEDULER' && item.status === 'FAILED').length, failedEmails: items.filter((item) => item.kind === 'EMAIL' && item.status === 'FAILED').length }, ai: { calls: ai.length, inputTokens: ai.reduce((sum, item) => sum + (item.inputTokens ?? 0), 0), outputTokens: ai.reduce((sum, item) => sum + (item.outputTokens ?? 0), 0), estimatedCostUsd: ai.reduce((sum, item) => sum + Number(item.estimatedCostUsd ?? 0), 0), averageLatencyMs: ai.length ? Math.round(ai.reduce((sum, item) => sum + (item.durationMs ?? 0), 0) / ai.length) : 0 }, recentFailures: items.filter((item) => item.status === 'FAILED' || item.status === 'WARNING').slice(0, 20) }; }
};
exports.ObservabilityService = ObservabilityService;
exports.ObservabilityService = ObservabilityService = ObservabilityService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(admin_audit_log_entity_1.AdminAuditLog)),
    __param(1, (0, typeorm_1.InjectRepository)(observability_event_entity_1.ObservabilityEvent)),
    __metadata("design:paramtypes", [typeorm_2.Repository, typeorm_2.Repository])
], ObservabilityService);
//# sourceMappingURL=observability.service.js.map