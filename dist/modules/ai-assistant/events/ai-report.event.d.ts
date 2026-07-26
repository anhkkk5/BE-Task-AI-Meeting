export type AiReportEvent = {
    type: 'team_report_approved';
    reportId: string;
    workspaceId: string;
    projectId: string;
    reportDate: string;
    approvedBy: string;
    title: string | null;
    summary: string | null;
};
