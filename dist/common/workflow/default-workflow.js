"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_WORKFLOW_TRANSITIONS = exports.DEFAULT_WORKFLOW_STATUSES = void 0;
const task_status_enum_1 = require("../enums/task-status.enum");
exports.DEFAULT_WORKFLOW_STATUSES = [
    {
        key: task_status_enum_1.TaskStatus.Backlog,
        label: 'Backlog',
        color: '#6b778c',
        category: 'TO_DO',
        order: 0,
        enabled: true,
    },
    {
        key: task_status_enum_1.TaskStatus.Todo,
        label: 'Cần làm',
        color: '#0c66e4',
        category: 'TO_DO',
        order: 1,
        enabled: true,
    },
    {
        key: task_status_enum_1.TaskStatus.InProgress,
        label: 'Đang làm',
        color: '#e56910',
        category: 'IN_PROGRESS',
        order: 2,
        enabled: true,
    },
    {
        key: task_status_enum_1.TaskStatus.Review,
        label: 'Review',
        color: '#7e4ec8',
        category: 'IN_PROGRESS',
        order: 3,
        enabled: true,
    },
    {
        key: task_status_enum_1.TaskStatus.Done,
        label: 'Hoàn thành',
        color: '#22a06b',
        category: 'DONE',
        order: 4,
        enabled: true,
    },
    {
        key: task_status_enum_1.TaskStatus.Cancelled,
        label: 'Đã hủy',
        color: '#c9372c',
        category: 'DONE',
        order: 5,
        enabled: true,
    },
];
exports.DEFAULT_WORKFLOW_TRANSITIONS = [
    { from: task_status_enum_1.TaskStatus.Backlog, to: task_status_enum_1.TaskStatus.Todo },
    { from: task_status_enum_1.TaskStatus.Todo, to: task_status_enum_1.TaskStatus.Backlog },
    { from: task_status_enum_1.TaskStatus.Todo, to: task_status_enum_1.TaskStatus.InProgress },
    { from: task_status_enum_1.TaskStatus.InProgress, to: task_status_enum_1.TaskStatus.Todo },
    { from: task_status_enum_1.TaskStatus.InProgress, to: task_status_enum_1.TaskStatus.Review },
    { from: task_status_enum_1.TaskStatus.Review, to: task_status_enum_1.TaskStatus.InProgress },
    { from: task_status_enum_1.TaskStatus.Review, to: task_status_enum_1.TaskStatus.Done },
    { from: task_status_enum_1.TaskStatus.Done, to: task_status_enum_1.TaskStatus.InProgress },
];
//# sourceMappingURL=default-workflow.js.map