import { AppService } from './app.service';
export declare class AppController {
    private readonly appService;
    constructor(appService: AppService);
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
}
