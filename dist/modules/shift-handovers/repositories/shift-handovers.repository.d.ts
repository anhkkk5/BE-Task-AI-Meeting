import { DataSource, Repository } from 'typeorm';
import { GetHandoversQueryDto } from '../dto/get-handovers-query.dto';
import { ShiftHandover } from '../entities/shift-handover.entity';
export declare class ShiftHandoversRepository {
    private readonly handovers;
    private readonly dataSource;
    constructor(handovers: Repository<ShiftHandover>, dataSource: DataSource);
    createHandover(data: Partial<ShiftHandover>): Promise<ShiftHandover | null>;
    findHandoverById(handoverId: string, projectId: string): Promise<ShiftHandover | null>;
    findOpenByTask(taskId: string): Promise<ShiftHandover | null>;
    findHandovers(projectId: string, query: GetHandoversQueryDto): Promise<{
        items: ShiftHandover[];
        total: number;
        page: number;
        limit: number;
    }>;
    updateHandover(handover: ShiftHandover, data: Partial<ShiftHandover>): Promise<ShiftHandover>;
    softDeleteHandover(handover: ShiftHandover): Promise<ShiftHandover>;
    acceptAndTransferTask(handover: ShiftHandover): Promise<boolean>;
}
