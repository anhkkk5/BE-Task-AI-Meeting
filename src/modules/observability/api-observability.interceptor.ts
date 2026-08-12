import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { catchError, Observable, tap, throwError } from 'rxjs';
import { ObservabilityService } from './observability.service';

@Injectable()
export class ApiObservabilityInterceptor implements NestInterceptor {
  constructor(private readonly observability: ObservabilityService) {}
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> { const request = context.switchToHttp().getRequest<{ method: string; route?: { path?: string }; url: string }>(); const started = Date.now(); const operation = `${request.method} ${request.route?.path ?? request.url.split('?')[0]}`; return next.handle().pipe(tap(() => { const durationMs = Date.now() - started; if (durationMs >= 1000) void this.observability.record({ kind: 'API', status: 'SLOW', operation, durationMs, error: null, metadata: null }); }), catchError((error: unknown) => { void this.observability.record({ kind: 'API', status: 'FAILED', operation, durationMs: Date.now() - started, error: error instanceof Error ? error.message : String(error), metadata: null }); return throwError(() => error); })); }
}
