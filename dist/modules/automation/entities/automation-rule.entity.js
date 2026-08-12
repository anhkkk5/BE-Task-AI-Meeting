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
exports.AutomationRule = void 0;
const typeorm_1 = require("typeorm");
let AutomationRule = class AutomationRule {
    id;
    workspaceId;
    projectId;
    name;
    enabled;
    trigger;
    conditions;
    actions;
    dryRunAt;
    createdBy;
    createdAt;
    updatedAt;
};
exports.AutomationRule = AutomationRule;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], AutomationRule.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Index)(),
    (0, typeorm_1.Column)({ name: 'workspace_id', type: 'char', length: 36 }),
    __metadata("design:type", String)
], AutomationRule.prototype, "workspaceId", void 0);
__decorate([
    (0, typeorm_1.Index)(),
    (0, typeorm_1.Column)({ name: 'project_id', type: 'char', length: 36 }),
    __metadata("design:type", String)
], AutomationRule.prototype, "projectId", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 160 }),
    __metadata("design:type", String)
], AutomationRule.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'tinyint', width: 1, default: 0 }),
    __metadata("design:type", Boolean)
], AutomationRule.prototype, "enabled", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'json' }),
    __metadata("design:type", Object)
], AutomationRule.prototype, "trigger", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'json' }),
    __metadata("design:type", Array)
], AutomationRule.prototype, "conditions", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'json' }),
    __metadata("design:type", Array)
], AutomationRule.prototype, "actions", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'dry_run_at', type: 'datetime', nullable: true }),
    __metadata("design:type", Object)
], AutomationRule.prototype, "dryRunAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'created_by', type: 'char', length: 36 }),
    __metadata("design:type", String)
], AutomationRule.prototype, "createdBy", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], AutomationRule.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], AutomationRule.prototype, "updatedAt", void 0);
exports.AutomationRule = AutomationRule = __decorate([
    (0, typeorm_1.Entity)('automation_rules')
], AutomationRule);
//# sourceMappingURL=automation-rule.entity.js.map