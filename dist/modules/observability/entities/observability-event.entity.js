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
exports.ObservabilityEvent = void 0;
const typeorm_1 = require("typeorm");
let ObservabilityEvent = class ObservabilityEvent {
    id;
    kind;
    status;
    operation;
    durationMs;
    inputTokens;
    outputTokens;
    estimatedCostUsd;
    error;
    metadata;
    createdAt;
};
exports.ObservabilityEvent = ObservabilityEvent;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], ObservabilityEvent.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Index)(),
    (0, typeorm_1.Column)({ length: 20 }),
    __metadata("design:type", String)
], ObservabilityEvent.prototype, "kind", void 0);
__decorate([
    (0, typeorm_1.Index)(),
    (0, typeorm_1.Column)({ length: 30 }),
    __metadata("design:type", String)
], ObservabilityEvent.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Index)(),
    (0, typeorm_1.Column)({ length: 160 }),
    __metadata("design:type", String)
], ObservabilityEvent.prototype, "operation", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'duration_ms', type: 'int', nullable: true }),
    __metadata("design:type", Object)
], ObservabilityEvent.prototype, "durationMs", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'input_tokens', type: 'int', nullable: true }),
    __metadata("design:type", Object)
], ObservabilityEvent.prototype, "inputTokens", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'output_tokens', type: 'int', nullable: true }),
    __metadata("design:type", Object)
], ObservabilityEvent.prototype, "outputTokens", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'estimated_cost_usd',
        type: 'decimal',
        precision: 12,
        scale: 6,
        nullable: true,
    }),
    __metadata("design:type", Object)
], ObservabilityEvent.prototype, "estimatedCostUsd", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", Object)
], ObservabilityEvent.prototype, "error", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'json', nullable: true }),
    __metadata("design:type", Object)
], ObservabilityEvent.prototype, "metadata", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], ObservabilityEvent.prototype, "createdAt", void 0);
exports.ObservabilityEvent = ObservabilityEvent = __decorate([
    (0, typeorm_1.Entity)('observability_events')
], ObservabilityEvent);
//# sourceMappingURL=observability-event.entity.js.map