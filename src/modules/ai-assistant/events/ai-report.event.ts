/**
 * Su kien vong doi bao cao AI.
 *
 * Hien chi co mot loai (duyet bao cao giao ban) nhung van dung union de sau nay
 * them su kien khac ma khong pha vo listener dang co.
 */
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
