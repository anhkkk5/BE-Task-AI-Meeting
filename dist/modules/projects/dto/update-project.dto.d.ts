export declare class UpdateProjectDto {
    workflowStatuses?: Array<{
        key: string;
        label: string;
        color: string;
        category: string;
        order: number;
        enabled: boolean;
    }>;
    workflowTransitions?: Array<{
        from: string;
        to: string;
        roles?: string[];
    }>;
    name?: string;
    description?: string;
    startDate?: string;
    endDate?: string;
}
