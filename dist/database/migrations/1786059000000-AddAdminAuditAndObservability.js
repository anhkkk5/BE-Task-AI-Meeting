"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddAdminAuditAndObservability1786059000000 = void 0;
class AddAdminAuditAndObservability1786059000000 {
    name = 'AddAdminAuditAndObservability1786059000000';
    async up(q) {
        await q.query('CREATE TABLE `admin_audit_logs` (`id` char(36) NOT NULL, `actor_id` char(36) NOT NULL, `action` varchar(60) NOT NULL, `target_type` varchar(40) NOT NULL, `target_id` char(36) NOT NULL, `before` json NULL, `after` json NULL, `metadata` json NULL, `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), INDEX `IDX_audit_actor` (`actor_id`), INDEX `IDX_audit_action` (`action`), INDEX `IDX_audit_target` (`target_id`), PRIMARY KEY (`id`)) ENGINE=InnoDB');
        await q.query('CREATE TABLE `observability_events` (`id` char(36) NOT NULL, `kind` varchar(20) NOT NULL, `status` varchar(30) NOT NULL, `operation` varchar(160) NOT NULL, `duration_ms` int NULL, `input_tokens` int NULL, `output_tokens` int NULL, `estimated_cost_usd` decimal(12,6) NULL, `error` text NULL, `metadata` json NULL, `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), INDEX `IDX_observe_kind` (`kind`), INDEX `IDX_observe_status` (`status`), INDEX `IDX_observe_operation` (`operation`), PRIMARY KEY (`id`)) ENGINE=InnoDB');
    }
    async down(q) {
        await q.query('DROP TABLE `observability_events`');
        await q.query('DROP TABLE `admin_audit_logs`');
    }
}
exports.AddAdminAuditAndObservability1786059000000 = AddAdminAuditAndObservability1786059000000;
//# sourceMappingURL=1786059000000-AddAdminAuditAndObservability.js.map