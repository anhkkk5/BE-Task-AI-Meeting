export type ReportCitation = {
  type: 'TASK' | 'DAILY_UPDATE' | 'MEETING' | 'HANDOVER';
  id: string;
  label: string;
  href: string;
};
export type ReportClaim = { id: string; text: string; kind: 'FACT' | 'INFERENCE' | 'RECOMMENDATION'; category: 'PROGRESS' | 'BLOCKER' | 'RISK' | 'DECISION' | 'OPEN_QUESTION' | 'RECOMMENDATION'; sourceIds: string[] };

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

export function buildReportClaims(output: Record<string, any>, input: Record<string, any>): ReportClaim[] {
  const citations = buildReportCitations(input); const claims: ReportClaim[] = [];
  const sourceIds = (text: string) => { const wanted = wordSet(text); const ranked = citations.map((source) => ({ source, score: [...wanted].filter((word) => wordSet(source.label).has(word)).length })).filter((item) => item.score > 0).sort((a, b) => b.score - a.score); const selected = ranked.slice(0, 3).map(({ source }) => `${source.type}:${source.id}`); if (selected.length) return selected; const types = /block|vuong|tro ngai/iu.test(normalize(text)) ? ['DAILY_UPDATE', 'HANDOVER'] : ['TASK']; return citations.filter((source) => types.includes(source.type)).slice(0, 3).map((source) => `${source.type}:${source.id}`); };
  const add = (items: unknown, kind: ReportClaim['kind'], category: ReportClaim['category']) => { (Array.isArray(items) ? items : []).filter((item): item is string => typeof item === 'string' && Boolean(item.trim())).forEach((text) => claims.push({ id: `${category}-${claims.length}`, text, kind, category, sourceIds: sourceIds(text) })); };
  add(output.completedTasks ?? output.completedWork, 'FACT', 'PROGRESS'); add(output.inProgressTasks ?? output.todayFocus, 'FACT', 'PROGRESS'); add(output.blockers, 'FACT', 'BLOCKER'); add(output.risks, 'INFERENCE', 'RISK'); add(output.decisions, 'FACT', 'DECISION'); add(output.openQuestions, 'FACT', 'OPEN_QUESTION'); add(output.recommendations ?? output.nextSteps, 'RECOMMENDATION', 'RECOMMENDATION'); return claims;
}
function normalize(value: string) { return value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, ' ').trim(); }
function wordSet(value: string) { return new Set(normalize(value).split(' ').filter((word) => word.length >= 3)); }
