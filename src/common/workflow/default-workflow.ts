import { TaskStatus } from '../enums/task-status.enum';

export type WorkflowStatusConfig = { key: TaskStatus; label: string; color: string; category: 'TO_DO' | 'IN_PROGRESS' | 'DONE'; order: number; enabled: boolean };
export type WorkflowTransitionConfig = { from: TaskStatus; to: TaskStatus };

export const DEFAULT_WORKFLOW_STATUSES: WorkflowStatusConfig[] = [
  { key: TaskStatus.Backlog, label: 'Backlog', color: '#6b778c', category: 'TO_DO', order: 0, enabled: true },
  { key: TaskStatus.Todo, label: 'Cần làm', color: '#0c66e4', category: 'TO_DO', order: 1, enabled: true },
  { key: TaskStatus.InProgress, label: 'Đang làm', color: '#e56910', category: 'IN_PROGRESS', order: 2, enabled: true },
  { key: TaskStatus.Review, label: 'Review', color: '#7e4ec8', category: 'IN_PROGRESS', order: 3, enabled: true },
  { key: TaskStatus.Done, label: 'Hoàn thành', color: '#22a06b', category: 'DONE', order: 4, enabled: true },
  { key: TaskStatus.Cancelled, label: 'Đã hủy', color: '#c9372c', category: 'DONE', order: 5, enabled: true },
];
export const DEFAULT_WORKFLOW_TRANSITIONS: WorkflowTransitionConfig[] = [
  { from: TaskStatus.Backlog, to: TaskStatus.Todo }, { from: TaskStatus.Todo, to: TaskStatus.Backlog },
  { from: TaskStatus.Todo, to: TaskStatus.InProgress }, { from: TaskStatus.InProgress, to: TaskStatus.Todo },
  { from: TaskStatus.InProgress, to: TaskStatus.Review }, { from: TaskStatus.Review, to: TaskStatus.InProgress },
  { from: TaskStatus.Review, to: TaskStatus.Done }, { from: TaskStatus.Done, to: TaskStatus.InProgress },
];
