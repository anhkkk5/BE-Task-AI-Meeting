import { Global, Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminAuditLog } from './entities/admin-audit-log.entity';
import { ObservabilityEvent } from './entities/observability-event.entity';
import { ApiObservabilityInterceptor } from './api-observability.interceptor';
import { ObservabilityService } from './observability.service';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([AdminAuditLog, ObservabilityEvent])],
  providers: [
    ObservabilityService,
    { provide: APP_INTERCEPTOR, useClass: ApiObservabilityInterceptor },
  ],
  exports: [ObservabilityService],
})
export class ObservabilityModule {}
