import { Inject, Injectable } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { InjectDataSource } from '@nestjs/typeorm';
import Redis from 'ioredis';
import { Connection } from 'mongoose';
import { DataSource } from 'typeorm';
import { REDIS_CLIENT } from './database/redis/redis.constants';

@Injectable()
export class AppService {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
    @InjectConnection()
    private readonly mongoConnection: Connection,
    @Inject(REDIS_CLIENT)
    private readonly redisClient: Redis,
  ) {}

  async getHealth() {
    const redisStatus = await this.getRedisStatus();

    return {
      success: true,
      message: 'API is running',
      data: {
        service: 'agile-ai-backend',
        mysql: this.dataSource.isInitialized ? 'connected' : 'disconnected',
        mongodb: this.isMongoConnected() ? 'connected' : 'disconnected',
        redis: redisStatus,
      },
    };
  }

  private isMongoConnected() {
    return Number(this.mongoConnection.readyState) === 1;
  }

  private async getRedisStatus() {
    try {
      const response = await this.redisClient.ping();
      return response === 'PONG' ? 'connected' : 'disconnected';
    } catch {
      return 'disconnected';
    }
  }
}
