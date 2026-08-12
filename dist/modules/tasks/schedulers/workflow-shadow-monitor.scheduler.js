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
exports.WorkflowShadowMonitorScheduler = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const observability_service_1 = require("../../observability/observability.service");
let WorkflowShadowMonitorScheduler = class WorkflowShadowMonitorScheduler {
    dataSource;
    observability;
    constructor(dataSource, observability) {
        this.dataSource = dataSource;
        this.observability = observability;
    }
    async check() { const started = Date.now(); try {
        const rows = await this.dataSource.query(`SELECT COUNT(*) total, SUM(CASE WHEN task.workflow_status_id IS NULL THEN 1 ELSE 0 END) missing_workflow, SUM(CASE WHEN workflow_status.id IS NOT NULL AND task.status <> workflow_status.status_key THEN 1 ELSE 0 END) mismatched FROM tasks task LEFT JOIN workflow_statuses workflow_status ON workflow_status.id = task.workflow_status_id WHERE task.deleted_at IS NULL`);
        const result = rows[0] ?? { total: '0', missing_workflow: '0', mismatched: '0' };
        const missing = Number(result.missing_workflow);
        const mismatched = Number(result.mismatched);
        await this.observability.record({ kind: 'SCHEDULER', status: missing || mismatched ? 'WARNING' : 'SUCCESS', operation: 'workflow.shadow.compatibility', durationMs: Date.now() - started, error: missing || mismatched ? `${missing} missing workflow IDs, ${mismatched} shadow mismatches` : null, metadata: { total: Number(result.total), missingWorkflow: missing, mismatched } });
    }
    catch (error) {
        await this.observability.record({ kind: 'SCHEDULER', status: 'FAILED', operation: 'workflow.shadow.compatibility', durationMs: Date.now() - started, error: error instanceof Error ? error.message : String(error), metadata: null });
    } }
};
exports.WorkflowShadowMonitorScheduler = WorkflowShadowMonitorScheduler;
__decorate([
    (0, schedule_1.Cron)('0 */10 * * * *'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], WorkflowShadowMonitorScheduler.prototype, "check", null);
exports.WorkflowShadowMonitorScheduler = WorkflowShadowMonitorScheduler = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectDataSource)()),
    __metadata("design:paramtypes", [typeorm_2.DataSource, observability_service_1.ObservabilityService])
], WorkflowShadowMonitorScheduler);
//# sourceMappingURL=workflow-shadow-monitor.scheduler.js.map