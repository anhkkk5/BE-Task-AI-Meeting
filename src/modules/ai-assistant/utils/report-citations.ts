export type ReportCitation = {
  type: 'TASK' | 'DAILY_UPDATE' | 'MEETING' | 'HANDOVER';
  id: string;
  label: string;
  href: string;
};

export function buildReportCitations(input: Record<string, any>): ReportCitation[] {
  const workspaceId = input.workspace?.id;
  const projectId = input.project?.id;
  if (!workspaceId || !projectId) return [];
  const base = `/workspaces/${workspaceId}/projects/${projectId}`;
  const citations: ReportCitation[] = [];
  for (const task of input.tasks ?? []) citations.push({ type: 'TASK', id: task.id, label: `${task.taskCode} · ${task.title}`, href: `${base}/tasks/${task.id}` });
  const dailyUpdates = input.dailyUpdate ? [input.dailyUpdate] : input.dailyUpdates ?? [];
  for (const update of dailyUpdates) citations.push({ type: 'DAILY_UPDATE', id: update.id, label: `Cập nhật ngày ${update.updateDate}${update.fullName ? ` · ${update.fullName}` : ''}`, href: `${base}/daily-updates/${update.id}` });
  for (const meeting of input.meetingNotes ?? []) citations.push({ type: 'MEETING', id: meeting.meetingId, label: meeting.title, href: `${base}/meetings/${meeting.meetingId}/summary` });
  const handovers = Array.isArray(input.handovers) ? input.handovers : [...(input.handovers?.given ?? []), ...(input.handovers?.received ?? [])];
  for (const handover of handovers) citations.push({ type: 'HANDOVER', id: handover.id, label: handover.taskCode ? `Bàn giao ${handover.taskCode}` : 'Bàn giao công việc', href: `${base}/shift-handovers` });
  return [...new Map(citations.map((citation) => [`${citation.type}:${citation.id}`, citation])).values()].slice(0, 50);
}
