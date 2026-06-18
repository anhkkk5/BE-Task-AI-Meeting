import { Inject, Injectable, Optional } from '@nestjs/common';
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
    @Optional()
    @InjectConnection()
    private readonly mongoConnection: Connection | null,
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
        mongodb: this.getMongoStatus(),
        redis: redisStatus,
      },
    };
  }

  private getMongoStatus() {
    if (!this.mongoConnection) {
      return 'disabled';
    }

    return Number(this.mongoConnection.readyState) === 1
      ? 'connected'
      : 'disconnected';
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
