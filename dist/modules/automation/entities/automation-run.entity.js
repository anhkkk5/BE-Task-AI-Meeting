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
exports.AutomationRun = void 0;
const typeorm_1 = require("typeorm");
let AutomationRun = class AutomationRun {
    id;
    ruleId;
    taskId;
    executionKey;
    status;
    result;
    error;
    retryCount;
    createdAt;
};
exports.AutomationRun = AutomationRun;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], AutomationRun.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Index)(),
    (0, typeorm_1.Column)({ name: 'rule_id', type: 'char', length: 36 }),
    __metadata("design:type", String)
], AutomationRun.prototype, "ruleId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'task_id', type: 'char', length: 36, nullable: true }),
    __metadata("design:type", Object)
], AutomationRun.prototype, "taskId", void 0);
__decorate([
    (0, typeorm_1.Index)({ unique: true }),
    (0, typeorm_1.Column)({ name: 'execution_key', length: 220 }),
    __metadata("design:type", String)
], AutomationRun.prototype, "executionKey", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 20 }),
    __metadata("design:type", String)
], AutomationRun.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'json', nullable: true }),
    __metadata("design:type", Object)
], AutomationRun.prototype, "result", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", Object)
], AutomationRun.prototype, "error", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'retry_count', type: 'int', default: 0 }),
    __metadata("design:type", Number)
], AutomationRun.prototype, "retryCount", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], AutomationRun.prototype, "createdAt", void 0);
exports.AutomationRun = AutomationRun = __decorate([
    (0, typeorm_1.Entity)('automation_runs')
], AutomationRun);
//# sourceMappingURL=automation-run.entity.js.map