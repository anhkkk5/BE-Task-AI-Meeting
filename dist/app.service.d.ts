import Redis from 'ioredis';
import { Connection } from 'mongoose';
import { DataSource } from 'typeorm';
export declare class AppService {
    private readonly dataSource;
    private readonly mongoConnection;
    private readonly redisClient;
    constructor(dataSource: DataSource, mongoConnection: Connection | null, redisClient: Redis);
    getHealth(): Promise<{
        success: boolean;
        message: string;
        data: {
            service: string;
            mysql: string;
            mongodb: string;
            redis: string;
        };
    }>;
    private getMongoStatus;
    private getRedisStatus;
}
