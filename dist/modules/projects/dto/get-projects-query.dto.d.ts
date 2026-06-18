import { ProjectStatus } from '../../../common/enums/project-status.enum';
export declare class GetProjectsQueryDto {
    status?: ProjectStatus;
    keyword?: string;
    page?: number;
    limit?: number;
}
