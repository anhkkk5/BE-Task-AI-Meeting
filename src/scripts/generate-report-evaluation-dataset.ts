import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';

const scenarios = [
  'NORMAL_PROGRESS',
  'OVERDUE_TASKS',
  'TEAM_BLOCKERS',
  'MISSING_DAILY_UPDATES',
  'HANDOVER_RISK',
  'MEETING_DECISIONS',
] as const;

function main() {
  const outputPath = resolve(
    process.env.REPORT_EVAL_DATASET_PATH ??
      join('datasets', 'report-evaluation', 'v1', 'cases.jsonl'),
  );
  const records = Array.from({ length: 30 }, (_, index) => {
    const number = index + 1;
    const scenario = scenarios[index % scenarios.length];
    const total = 12 + (index % 5);
    const done = 4 + (index % 6);
    const overdue = scenario === 'OVERDUE_TASKS' ? 2 + (index % 3) : 0;
    const blockerCount = scenario === 'TEAM_BLOCKERS' ? 2 : 0;
    const missingUpdates =
      scenario === 'MISSING_DAILY_UPDATES' ? ['user-04', 'user-05'] : [];
    const pendingHandovers = scenario === 'HANDOVER_RISK' ? 2 : 0;
    const decisions =
      scenario === 'MEETING_DECISIONS'
        ? [
            'Chốt phát hành bản thử nghiệm vào thứ Sáu',
            'Ưu tiên sửa lỗi đăng nhập trước',
          ]
        : [];
    return {
      caseId: `report-case-${String(number).padStart(3, '0')}`,
      split: number <= 6 ? 'development' : 'test',
      scenario,
      reportDate: `2026-08-${String((number % 20) + 1).padStart(2, '0')}`,
      sourceData: {
        project: {
          id: `project-${(index % 3) + 1}`,
          name: `Dự án mẫu ${(index % 3) + 1}`,
        },
        sprint: { name: `Sprint ${(index % 4) + 1}`, status: 'ACTIVE' },
        members: 5,
        taskStats: {
          total,
          done,
          inProgress: total - done - 2,
          todo: 2,
          overdue,
        },
        blockers:
          blockerCount > 0
            ? [
                'Không truy cập được môi trường staging',
                'Thiếu xác nhận yêu cầu từ khách hàng',
              ]
            : [],
        missingDailyUpdateMembers: missingUpdates,
        handoverStats: { total: pendingHandovers, pending: pendingHandovers },
        meetingDecisions: decisions,
      },
      groundTruth: {
        requiredFacts: [
          `Tổng số công việc: ${total}`,
          `Công việc hoàn thành: ${done}`,
          `Công việc quá hạn: ${overdue}`,
          `Số vướng mắc: ${blockerCount}`,
          `Thành viên thiếu cập nhật: ${missingUpdates.length}`,
          `Bàn giao đang chờ: ${pendingHandovers}`,
          ...decisions,
        ],
        forbiddenClaims: [
          overdue === 0
            ? 'Dự án có công việc quá hạn'
            : 'Dự án không có công việc quá hạn',
          blockerCount === 0
            ? 'Nhóm đang có vướng mắc'
            : 'Nhóm không có vướng mắc',
        ],
        annotationStatus: 'CONTROLLED_SYNTHETIC',
      },
    };
  });
  const manifest = {
    version: '1.0.0',
    caseCount: records.length,
    development: records.filter((record) => record.split === 'development')
      .length,
    test: records.filter((record) => record.split === 'test').length,
    scenarios: Object.fromEntries(
      scenarios.map((scenario) => [
        scenario,
        records.filter((record) => record.scenario === scenario).length,
      ]),
    ),
  };
  mkdirSync(dirname(outputPath), { recursive: true });
  writeFileSync(
    outputPath,
    `${records.map((record) => JSON.stringify(record)).join('\n')}\n`,
    'utf8',
  );
  writeFileSync(
    join(dirname(outputPath), 'manifest.json'),
    `${JSON.stringify(manifest, null, 2)}\n`,
    'utf8',
  );
  console.log(JSON.stringify(manifest, null, 2));
}

main();
