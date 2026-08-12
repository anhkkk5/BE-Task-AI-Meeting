export type ReportCitation = {
    type: 'TASK' | 'DAILY_UPDATE' | 'MEETING' | 'HANDOVER';
    id: string;
    label: string;
    href: string;
};
export type ReportClaim = {
    id: string;
    text: string;
    kind: 'FACT' | 'INFERENCE' | 'RECOMMENDATION';
    category: 'PROGRESS' | 'BLOCKER' | 'RISK' | 'DECISION' | 'OPEN_QUESTION' | 'RECOMMENDATION';
    sourceIds: string[];
};
export declare function buildReportCitations(input: Record<string, any>): ReportCitation[];
export declare function buildReportClaims(output: Record<string, any>, input: Record<string, any>): ReportClaim[];
