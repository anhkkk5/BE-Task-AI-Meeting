"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const node_fs_1 = require("node:fs");
const node_path_1 = require("node:path");
const people = [
    ['Nguyễn Minh Anh', 'PROJECT_MANAGER'],
    ['Trần Quốc Bảo', 'SCRUM_MASTER'],
    ['Lê Thu Hà', 'DEVELOPER'],
    ['Phạm Đức Long', 'DEVELOPER'],
    ['Vũ Ngọc Mai', 'TESTER'],
    ['Đỗ Hoàng Nam', 'BUSINESS_ANALYST'],
    ['Bùi Thanh Hương', 'DESIGNER'],
];
const tasks = [
    'hoàn thiện API quản lý công việc',
    'bổ sung kiểm thử phân quyền workspace',
    'sửa lỗi hiển thị avatar trong backlog',
    'cập nhật tài liệu hướng dẫn người dùng',
    'kiểm tra luồng tạo và hoàn thành sprint',
    'tối ưu truy vấn danh sách cuộc họp',
    'đối chiếu số liệu báo cáo tiến độ',
    'thiết kế lại trạng thái rỗng của dashboard',
    'kiểm thử tải cho API trợ lý dự án',
    'rà soát cảnh báo công việc quá hạn',
    'chuẩn hóa dữ liệu transcript tiếng Việt',
    'xác nhận tiêu chí nghiệm thu với khách hàng',
];
const meetingTypes = [
    'DAILY_STANDUP',
    'SPRINT_PLANNING',
    'SPRINT_REVIEW',
    'RETROSPECTIVE',
    'TECHNICAL_DISCUSSION',
];
const stableId = (prefix, index) => `${prefix}-${String(index).padStart(3, '0')}`;
const isoDate = (offset) => new Date(Date.UTC(2026, 7, 1 + offset)).toISOString().slice(0, 10);
function buildRecord(index) {
    const meetingNumber = index + 1;
    const selected = Array.from({ length: 5 }, (_, offset) => {
        const personIndex = (index + offset) % people.length;
        return {
            userId: stableId('user', personIndex + 1),
            fullName: people[personIndex][0],
            role: people[personIndex][1],
        };
    });
    const segments = [];
    const actionItems = [];
    let second = 0;
    const addSegment = (speaker, text) => {
        const segmentId = stableId(`tr-${meetingNumber}-seg`, segments.length + 1);
        segments.push({
            segmentId,
            speakerName: speaker.fullName,
            userId: speaker.userId,
            text,
            startedAtSeconds: second,
            endedAtSeconds: second + 12,
        });
        second += 15;
        return segmentId;
    };
    addSegment(selected[0], `Chúng ta bắt đầu buổi ${meetingTypes[index % meetingTypes.length].toLowerCase()} của dự án. Mọi người chỉ báo cáo nội dung liên quan đến sprint hiện tại.`);
    for (let itemIndex = 0; itemIndex < 5; itemIndex += 1) {
        const speaker = selected[(itemIndex + 1) % selected.length];
        const task = tasks[(index * 3 + itemIndex) % tasks.length];
        const dueDate = itemIndex === 3 && index % 3 === 0
            ? null
            : isoDate(index + itemIndex + 2);
        const assignee = itemIndex === 4 && index % 4 === 0
            ? null
            : selected[(itemIndex + 2) % selected.length];
        let utterance;
        if (!assignee && !dueDate)
            utterance = `Việc ${task} đã được thống nhất là cần làm, nhưng nhóm chưa chốt người phụ trách và thời hạn.`;
        else if (!assignee)
            utterance = `Nhóm thống nhất cần ${task} trước ngày ${dueDate}, người phụ trách sẽ được phân công sau.`;
        else if (!dueDate)
            utterance = `${assignee.fullName} nhận việc ${task}. Thời hạn sẽ được chốt sau khi có phản hồi từ bên liên quan.`;
        else if (itemIndex % 2 === 0)
            utterance = `${assignee.fullName} sẽ ${task} và hoàn thành trước ngày ${dueDate}.`;
        else
            utterance = `Tôi giao cho ${assignee.fullName} phụ trách ${task}, hạn cuối là ${dueDate}.`;
        const evidenceId = addSegment(speaker, utterance);
        actionItems.push({
            actionItemId: stableId(`tr-${meetingNumber}-ai`, itemIndex + 1),
            text: task.charAt(0).toUpperCase() + task.slice(1),
            assigneeName: assignee?.fullName ?? null,
            assigneeUserId: assignee?.userId ?? null,
            dueDate,
            status: 'OPEN',
            source: utterance,
            evidenceSegmentIds: [evidenceId],
        });
        if (itemIndex === 1)
            addSegment(selected[4], 'Ngoài lề một chút, mọi người nhớ đăng ký kênh và theo dõi thông báo mới nhé.');
        if (itemIndex === 2)
            addSegment(selected[0], 'Phần vừa trao đổi mới chỉ là ý tưởng, chưa phải việc được giao nên không đưa vào danh sách công việc.');
    }
    addSegment(selected[0], 'Cuộc họp kết thúc. Nhóm xác nhận chỉ các công việc đã giao rõ trong biên bản mới được theo dõi.');
    return {
        datasetVersion: '1.0.0',
        transcriptId: stableId('transcript', meetingNumber),
        split: index < 12 ? 'development' : 'test',
        meetingType: meetingTypes[index % meetingTypes.length],
        meetingDate: isoDate(index),
        workspaceId: stableId('workspace', (index % 6) + 1),
        projectId: stableId('project', (index % 18) + 1),
        sprintId: stableId('sprint', (index % 36) + 1),
        participants: selected,
        transcript: {
            language: 'vi',
            rawTranscript: segments
                .map((segment) => `${segment.speakerName}: ${segment.text}`)
                .join('\n'),
            segments,
        },
        groundTruth: {
            actionItems,
            actionItemCount: actionItems.length,
            annotationStatus: 'SYNTHETIC_DRAFT',
            annotationNote: 'Nhãn được tạo theo kịch bản có kiểm soát; cần hai người kiểm tra độc lập trước khi dùng làm ground truth cuối cùng.',
        },
    };
}
const records = Array.from({ length: 60 }, (_, index) => buildRecord(index));
const directory = (0, node_path_1.join)(process.cwd(), 'datasets', 'action-item-evaluation', 'v1');
(0, node_fs_1.mkdirSync)(directory, { recursive: true });
(0, node_fs_1.writeFileSync)((0, node_path_1.join)(directory, 'transcripts.jsonl'), `${records.map((record) => JSON.stringify(record)).join('\n')}\n`, 'utf8');
const allActionItems = records.flatMap((record) => record.groundTruth.actionItems);
const manifest = {
    datasetVersion: '1.0.0',
    generatedAt: '2026-08-24T00:00:00.000Z',
    language: 'vi',
    transcriptCount: records.length,
    actionItemCount: allActionItems.length,
    split: { development: 12, test: 48 },
    coverage: {
        meetingTypes: meetingTypes.length,
        workspaces: 6,
        projects: 18,
        sprints: 36,
        missingAssignee: allActionItems.filter((item) => !item.assigneeUserId)
            .length,
        missingDueDate: allActionItems.filter((item) => !item.dueDate).length,
        noiseSegments: records.length,
        nonActionIdeaSegments: records.length,
    },
    annotationStatus: 'SYNTHETIC_DRAFT',
};
(0, node_fs_1.writeFileSync)((0, node_path_1.join)(directory, 'manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');
console.log(manifest);
//# sourceMappingURL=generate-action-item-evaluation-dataset.js.map