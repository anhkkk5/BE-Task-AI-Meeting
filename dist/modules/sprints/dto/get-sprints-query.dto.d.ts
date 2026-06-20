import { SprintStatus } from '../../../common/enums/sprint-status.enum';
export declare class GetSprintsQueryDto {
    status?: SprintStatus;
    keyword?: string;
    page?: number;
    limit?: number;
}
