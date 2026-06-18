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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const typeorm_1 = require("@nestjs/typeorm");
const ioredis_1 = __importDefault(require("ioredis"));
const typeorm_2 = require("typeorm");
const redis_constants_1 = require("./database/redis/redis.constants");
let AppService = class AppService {
    dataSource;
    mongoConnection;
    redisClient;
    constructor(dataSource, mongoConnection, redisClient) {
        this.dataSource = dataSource;
        this.mongoConnection = mongoConnection;
        this.redisClient = redisClient;
    }
    async getHealth() {
        const redisStatus = await this.getRedisStatus();
        return {
            success: true,
            message: 'API is running',
            data: {
                service: 'agile-ai-backend',
                mysql: this.dataSource.isInitialized ? 'connected' : 'disconnected',
                mongodb: this.getMongoStatus(),
                redis: redisStatus,
            },
        };
    }
    getMongoStatus() {
        if (!this.mongoConnection) {
            return 'disabled';
        }
        return Number(this.mongoConnection.readyState) === 1
            ? 'connected'
            : 'disconnected';
    }
    async getRedisStatus() {
        try {
            const response = await this.redisClient.ping();
            return response === 'PONG' ? 'connected' : 'disconnected';
        }
        catch {
            return 'disconnected';
        }
    }
};
exports.AppService = AppService;
exports.AppService = AppService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectDataSource)()),
    __param(1, (0, common_1.Optional)()),
    __param(1, (0, mongoose_1.InjectConnection)()),
    __param(2, (0, common_1.Inject)(redis_constants_1.REDIS_CLIENT)),
    __metadata("design:paramtypes", [typeorm_2.DataSource, Object, ioredis_1.default])
], AppService);
//# sourceMappingURL=app.service.js.map