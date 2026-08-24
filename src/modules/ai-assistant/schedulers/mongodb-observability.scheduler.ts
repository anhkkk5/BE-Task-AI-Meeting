import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectConnection } from '@nestjs/mongoose';
import type { Connection } from 'mongoose';
import { ObservabilityService } from '../../observability/observability.service';

@Injectable()
export class MongodbObservabilityScheduler {
  constructor(
    @InjectConnection() private connection: Connection,
    private observability: ObservabilityService,
  ) {}
  @Cron('0 */5 * * * *')
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
    } catch (error) {
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
}
