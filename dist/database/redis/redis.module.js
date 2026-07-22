"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RedisModule = void 0;
const common_1 = require("@nestjs/common");
const ioredis_1 = __importDefault(require("ioredis"));
const redis_config_1 = require("../../config/redis.config");
const redis_constants_1 = require("./redis.constants");
let RedisModule = class RedisModule {
};
exports.RedisModule = RedisModule;
exports.RedisModule = RedisModule = __decorate([
    (0, common_1.Global)(),
    (0, common_1.Module)({
        providers: [
            {
                provide: redis_constants_1.REDIS_CLIENT,
                useFactory: () => {
                    const config = (0, redis_config_1.redisConfig)();
                    const client = new ioredis_1.default({
                        host: config.host,
                        port: config.port,
                        username: config.username,
                        password: config.password,
                        tls: config.tls ? {} : undefined,
                        maxRetriesPerRequest: 3,
                    });
                    client.on('error', () => undefined);
                    return client;
                },
            },
        ],
        exports: [redis_constants_1.REDIS_CLIENT],
    })
], RedisModule);
//# sourceMappingURL=redis.module.js.map