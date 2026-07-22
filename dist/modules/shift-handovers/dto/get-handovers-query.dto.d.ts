import { HandoverStatus } from '../../../common/enums/handover-status.enum';
export declare class GetHandoversQueryDto {
    status?: HandoverStatus;
    memberId?: string;
    taskId?: string;
    page?: number;
    limit?: number;
}
