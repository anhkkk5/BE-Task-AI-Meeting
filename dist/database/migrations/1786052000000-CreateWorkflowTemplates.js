"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateWorkflowTemplates1786052000000 = void 0;
class CreateWorkflowTemplates1786052000000 {
    name = 'CreateWorkflowTemplates1786052000000';
    async up(queryRunner) {
        await queryRunner.query("CREATE TABLE `workflow_templates` (`id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL, `name` varchar(100) NOT NULL, `description` varchar(500) NULL, `is_system` tinyint NOT NULL DEFAULT 0, PRIMARY KEY (`id`)) ENGINE=InnoDB DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_bin");
        await queryRunner.query("CREATE TABLE `workflow_statuses` (`id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL, `template_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL, `status_key` varchar(30) NOT NULL, `label` varchar(100) NOT NULL, `color` varchar(20) NOT NULL, `category` enum('TO_DO','IN_PROGRESS','DONE') NOT NULL, `sort_order` int NOT NULL, `enabled` tinyint NOT NULL DEFAULT 1, PRIMARY KEY (`id`), CONSTRAINT `FK_workflow_status_template` FOREIGN KEY (`template_id`) REFERENCES `workflow_templates`(`id`) ON DELETE CASCADE) ENGINE=InnoDB DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_bin");
        await queryRunner.query("CREATE TABLE `workflow_transitions` (`id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL, `template_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL, `from_key` varchar(30) NOT NULL, `to_key` varchar(30) NOT NULL, `allowed_roles` json NULL, PRIMARY KEY (`id`), UNIQUE INDEX `IDX_workflow_transition_unique` (`template_id`,`from_key`,`to_key`), CONSTRAINT `FK_workflow_transition_template` FOREIGN KEY (`template_id`) REFERENCES `workflow_templates`(`id`) ON DELETE CASCADE) ENGINE=InnoDB DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_bin");
    }
    async down(queryRunner) {
        await queryRunner.query('DROP TABLE `workflow_transitions`');
        await queryRunner.query('DROP TABLE `workflow_statuses`');
        await queryRunner.query('DROP TABLE `workflow_templates`');
    }
}
exports.CreateWorkflowTemplates1786052000000 = CreateWorkflowTemplates1786052000000;
//# sourceMappingURL=1786052000000-CreateWorkflowTemplates.js.map