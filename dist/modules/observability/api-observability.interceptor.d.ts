import { CallHandler, ExecutionContext, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { ObservabilityService } from './observability.service';
export declare class ApiObservabilityInterceptor implements NestInterceptor {
    private readonly observability;
    constructor(observability: ObservabilityService);
    intercept(context: ExecutionContext, next: CallHandler): Observable<unknown>;
}
