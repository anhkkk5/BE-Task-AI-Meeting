import { Global, Module } from '@nestjs/common';
import Redis from 'ioredis';
import { redisConfig } from '../../config/redis.config';
import { REDIS_CLIENT } from './redis.constants';

@Global()
@Module({
  providers: [
    {
      provide: REDIS_CLIENT,
      useFactory: () => {
        const config = redisConfig();

        const client = new Redis({
          host: config.host,
          port: config.port,
          password: config.password,
          maxRetriesPerRequest: 3,
        });

        client.on('error', () => undefined);

        return client;
      },
    },
  ],
  exports: [REDIS_CLIENT],
})
export class RedisModule {}
