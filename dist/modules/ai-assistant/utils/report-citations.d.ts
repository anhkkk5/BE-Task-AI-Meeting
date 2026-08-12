export type ReportCitation = {
    type: 'TASK' | 'DAILY_UPDATE' | 'MEETING' | 'HANDOVER';
    id: string;
    label: string;
    href: string;
};
export declare function buildReportCitations(input: Record<string, any>): ReportCitation[];
