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
exports.ApiObservabilityInterceptor = void 0;
const common_1 = require("@nestjs/common");
const rxjs_1 = require("rxjs");
const observability_service_1 = require("./observability.service");
let ApiObservabilityInterceptor = class ApiObservabilityInterceptor {
    observability;
    constructor(observability) {
        this.observability = observability;
    }
    intercept(context, next) {
        const request = context
            .switchToHttp()
            .getRequest();
        const started = Date.now();
        const operation = `${request.method} ${request.route?.path ?? request.url.split('?')[0]}`;
        return next.handle().pipe((0, rxjs_1.tap)(() => {
            const durationMs = Date.now() - started;
            if (durationMs >= 1000)
                void this.observability.record({
                    kind: 'API',
                    status: 'SLOW',
                    operation,
                    durationMs,
                    error: null,
                    metadata: null,
                });
        }), (0, rxjs_1.catchError)((error) => {
            void this.observability.record({
                kind: 'API',
                status: 'FAILED',
                operation,
                durationMs: Date.now() - started,
                error: error instanceof Error ? error.message : String(error),
                metadata: null,
            });
            return (0, rxjs_1.throwError)(() => error);
        }));
    }
};
exports.ApiObservabilityInterceptor = ApiObservabilityInterceptor;
exports.ApiObservabilityInterceptor = ApiObservabilityInterceptor = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [observability_service_1.ObservabilityService])
], ApiObservabilityInterceptor);
//# sourceMappingURL=api-observability.interceptor.js.map