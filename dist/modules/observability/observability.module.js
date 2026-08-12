"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ObservabilityModule = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const typeorm_1 = require("@nestjs/typeorm");
const admin_audit_log_entity_1 = require("./entities/admin-audit-log.entity");
const observability_event_entity_1 = require("./entities/observability-event.entity");
const api_observability_interceptor_1 = require("./api-observability.interceptor");
const observability_service_1 = require("./observability.service");
let ObservabilityModule = class ObservabilityModule {
};
exports.ObservabilityModule = ObservabilityModule;
exports.ObservabilityModule = ObservabilityModule = __decorate([
    (0, common_1.Global)(),
    (0, common_1.Module)({ imports: [typeorm_1.TypeOrmModule.forFeature([admin_audit_log_entity_1.AdminAuditLog, observability_event_entity_1.ObservabilityEvent])], providers: [observability_service_1.ObservabilityService, { provide: core_1.APP_INTERCEPTOR, useClass: api_observability_interceptor_1.ApiObservabilityInterceptor }], exports: [observability_service_1.ObservabilityService] })
], ObservabilityModule);
//# sourceMappingURL=observability.module.js.map