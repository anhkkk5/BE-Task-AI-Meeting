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
exports.MongodbObservabilityScheduler = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const mongoose_1 = require("@nestjs/mongoose");
const observability_service_1 = require("../../observability/observability.service");
let MongodbObservabilityScheduler = class MongodbObservabilityScheduler {
    connection;
    observability;
    constructor(connection, observability) {
        this.connection = connection;
        this.observability = observability;
    }
    async check() {
        const started = Date.now();
        try {
            if (!this.connection.db)
                throw new Error('MongoDB connection is not ready');
            await this.connection.db.admin().ping();
            await this.observability.record({
                kind: 'MONGODB',
                status: 'SUCCESS',
                operation: 'mongodb.ping',
                durationMs: Date.now() - started,
                error: null,
                metadata: { readyState: this.connection.readyState },
            });
        }
        catch (error) {
            await this.observability.record({
                kind: 'MONGODB',
                status: 'FAILED',
                operation: 'mongodb.ping',
                durationMs: Date.now() - started,
                error: error instanceof Error ? error.message : String(error),
                metadata: { readyState: this.connection.readyState },
            });
        }
    }
};
exports.MongodbObservabilityScheduler = MongodbObservabilityScheduler;
__decorate([
    (0, schedule_1.Cron)('0 */5 * * * *'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], MongodbObservabilityScheduler.prototype, "check", null);
exports.MongodbObservabilityScheduler = MongodbObservabilityScheduler = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectConnection)()),
    __metadata("design:paramtypes", [Function, observability_service_1.ObservabilityService])
], MongodbObservabilityScheduler);
//# sourceMappingURL=mongodb-observability.scheduler.js.map