"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const node_fs_1 = require("node:fs");
const node_path_1 = require("node:path");
const categories = [
    'TASK',
    'SPRINT',
    'MEETING',
    'ACTION_ITEM',
    'CROSS_SOURCE',
    'SUGGESTED_QUESTIONS',
];
function buildCase(category, sequence) {
    const workspaceId = `workspace-${(sequence % 3) + 1}`;
    const projectId = `project-${(sequence % 4) + 1}`;
    const sprintId = `sprint-${(sequence % 2) + 1}`;
    const taskCode = `PA-${String(sequence).padStart(3, '0')}`;
    const sources = {
        task: {
            id: `task-${sequence}`,
            code: taskCode,
            title: `Hoàn thiện chức năng ${sequence}`,
            status: sequence % 2 === 0 ? 'IN_PROGRESS' : 'TODO',
            assignee: `Thành viên ${(sequence % 5) + 1}`,
            dueDate: `2026-08-${String((sequence % 18) + 10).padStart(2, '0')}`,
        },
        sprint: {
            id: sprintId,
            name: `Sprint ${(sequence % 4) + 1}`,
            status: 'ACTIVE',
            totalTasks: 12 + (sequence % 5),
            completedTasks: 5 + (sequence % 4),
            daysRemaining: 3 + (sequence % 5),
        },
        meeting: {
            id: `meeting-${sequence}`,
            title: `Họp tiến độ ${sequence}`,
            decision: `Ưu tiên xử lý ${taskCode} trước thứ Sáu`,
        },
        actionItem: {
            id: `action-${sequence}`,
            text: `Kiểm thử và nghiệm thu ${taskCode}`,
            assignee: `Thành viên ${(sequence % 5) + 1}`,
            dueDate: `2026-08-${String((sequence % 18) + 11).padStart(2, '0')}`,
        },
        dailyUpdate: {
            member: `Thành viên ${(sequence % 5) + 1}`,
            blocker: `Chưa có quyền truy cập môi trường test ${sequence}`,
        },
    };
    const questionByCategory = {
        TASK: `${taskCode} đang ở trạng thái nào, ai phụ trách và hạn khi nào?`,
        SPRINT: `Sprint hiện tại tiến độ ra sao và còn bao nhiêu ngày?`,
        MEETING: `Cuộc họp gần nhất đã thống nhất quyết định gì?`,
        ACTION_ITEM: `Action item của cuộc họp là gì, giao cho ai và hạn khi nào?`,
        CROSS_SOURCE: 'Kết hợp Task, Sprint, cuộc họp và cập nhật hằng ngày để đánh giá rủi ro tiến độ.',
        SUGGESTED_QUESTIONS: 'Hãy đề xuất các câu hỏi tiếp theo hữu ích dựa trên dữ liệu dự án hiện tại.',
    };
    const requiredByCategory = {
        TASK: [
            taskCode,
            sources.task.status,
            sources.task.assignee,
            sources.task.dueDate,
        ],
        SPRINT: [
            sources.sprint.name,
            `${sources.sprint.completedTasks}/${sources.sprint.totalTasks}`,
            `${sources.sprint.daysRemaining} ngày`,
        ],
        MEETING: [sources.meeting.title, sources.meeting.decision],
        ACTION_ITEM: [
            sources.actionItem.text,
            sources.actionItem.assignee,
            sources.actionItem.dueDate,
        ],
        CROSS_SOURCE: [
            `${sources.sprint.completedTasks}/${sources.sprint.totalTasks}`,
            sources.meeting.decision,
            sources.dailyUpdate.blocker,
            taskCode,
        ],
        SUGGESTED_QUESTIONS: [
            'Ít nhất một câu về tiến độ Sprint',
            'Ít nhất một câu về Task hoặc Action Item',
            'Ít nhất một câu về rủi ro hoặc trở ngại',
        ],
    };
    return {
        category,
        question: questionByCategory[category],
        context: { workspaceId, projectId, sprintId },
        sourceData: sources,
        groundTruth: {
            requiredFacts: requiredByCategory[category],
            requiredSourceTypes: category === 'CROSS_SOURCE'
                ? ['TASK', 'SPRINT', 'MEETING', 'DAILY_UPDATE']
                : category === 'SUGGESTED_QUESTIONS'
                    ? ['TASK', 'SPRINT', 'DAILY_UPDATE']
                    : [category],
            forbiddenClaims: [
                `Workspace khác ${workspaceId}`,
                `Project khác ${projectId}`,
                'Thông tin không tồn tại trong sourceData',
            ],
            expectedState: 'READY',
            annotationStatus: 'CONTROLLED_SYNTHETIC',
        },
    };
}
function main() {
    const outputPath = (0, node_path_1.resolve)(process.env.PROJECT_ASSISTANT_EVAL_DATASET_PATH ??
        (0, node_path_1.join)('datasets', 'project-assistant-evaluation', 'v1', 'cases.jsonl'));
    const records = categories.flatMap((category, categoryIndex) => Array.from({ length: 7 }, (_, localIndex) => {
        const sequence = categoryIndex * 7 + localIndex + 1;
        return {
            caseId: `assistant-case-${String(sequence).padStart(3, '0')}`,
            split: localIndex === 0 ? 'development' : 'test',
            ...buildCase(category, sequence),
        };
    }));
    const manifest = {
        version: '1.0.0',
        caseCount: records.length,
        development: records.filter((item) => item.split === 'development').length,
        test: records.filter((item) => item.split === 'test').length,
        categories: Object.fromEntries(categories.map((category) => [
            category,
            records.filter((item) => item.category === category).length,
        ])),
    };
    (0, node_fs_1.mkdirSync)((0, node_path_1.dirname)(outputPath), { recursive: true });
    (0, node_fs_1.writeFileSync)(outputPath, `${records.map((item) => JSON.stringify(item)).join('\n')}\n`, 'utf8');
    (0, node_fs_1.writeFileSync)((0, node_path_1.join)((0, node_path_1.dirname)(outputPath), 'manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');
    console.log(JSON.stringify(manifest, null, 2));
}
main();
//# sourceMappingURL=generate-project-assistant-evaluation-dataset.js.map