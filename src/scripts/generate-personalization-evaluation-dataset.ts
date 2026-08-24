import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';

const features = [
  'PERSONALIZED_SUMMARY',
  'PERSONALIZED_REPORT',
  'PERSONALIZED_QA',
] as const;

const scenarios = [
  'ROLE_RELEVANCE',
  'ASSIGNMENT_RELEVANCE',
  'PREFERENCE_ADAPTATION',
  'PRIVACY_ISOLATION',
] as const;

function main() {
  const outputPath = resolve(
    process.env.PERSONALIZATION_EVAL_DATASET_PATH ??
      join('datasets', 'personalization-evaluation', 'v1', 'cases.jsonl'),
  );
  const records = Array.from({ length: 36 }, (_, index) => {
    const number = index + 1;
    const feature = features[index % features.length];
    const scenario = scenarios[index % scenarios.length];
    const pairNumber = Math.floor(index / 2) + 1;
    const isDeveloper = index % 2 === 0;
    const target = isDeveloper
      ? {
          id: `developer-${pairNumber}`,
          name: `Lập trình viên ${pairNumber}`,
          role: 'DEVELOPER',
          preferences: {
            responseStyle: 'CONCISE',
            focus: ['assigned tasks', 'technical blockers', 'deadlines'],
          },
          assignedTask: `Hoàn thiện API phân quyền ${pairNumber}`,
          privateFact: `Đang bị chặn bởi quyền truy cập staging ${pairNumber}`,
        }
      : {
          id: `manager-${pairNumber}`,
          name: `Quản lý ${pairNumber}`,
          role: 'PROJECT_MANAGER',
          preferences: {
            responseStyle: 'STRUCTURED',
            focus: ['team progress', 'risks', 'next actions'],
          },
          assignedTask: `Duyệt kế hoạch phát hành ${pairNumber}`,
          privateFact: `Cần xác nhận nguồn lực với khách hàng ${pairNumber}`,
        };
    const other = isDeveloper
      ? {
          id: `manager-${pairNumber}`,
          assignedTask: `Duyệt kế hoạch phát hành ${pairNumber}`,
          privateFact: `Cần xác nhận nguồn lực với khách hàng ${pairNumber}`,
        }
      : {
          id: `developer-${pairNumber}`,
          assignedTask: `Hoàn thiện API phân quyền ${pairNumber}`,
          privateFact: `Đang bị chặn bởi quyền truy cập staging ${pairNumber}`,
        };
    const question =
      feature === 'PERSONALIZED_QA'
        ? 'Tôi cần ưu tiên việc gì và đang có rủi ro nào liên quan trực tiếp đến tôi?'
        : null;

    return {
      caseId: `personalization-case-${String(number).padStart(3, '0')}`,
      pairId: `persona-pair-${String(pairNumber).padStart(2, '0')}`,
      split: number <= 6 ? 'development' : 'test',
      feature,
      scenario,
      sourceData: {
        project: { name: `Dự án cá nhân hóa ${pairNumber}`, progress: 62 },
        sprint: { name: `Sprint ${pairNumber}`, daysRemaining: 5 },
        sharedMeetingFacts: [
          'Bản thử nghiệm phải hoàn tất trước thứ Sáu',
          'Nhóm thống nhất ưu tiên lỗi phân quyền',
        ],
        targetUser: target,
        otherUser: other,
        question,
      },
      groundTruth: {
        requiredPersonalFacts: [
          `Vai trò: ${target.role}`,
          `Việc được giao: ${target.assignedTask}`,
          `Thông tin liên quan: ${target.privateFact}`,
          `Phong cách trả lời: ${target.preferences.responseStyle}`,
        ],
        forbiddenOtherUserFacts: [other.assignedTask, other.privateFact],
        expectedDifferenceFromPair:
          'Nội dung phải khác người còn lại về nhiệm vụ, rủi ro và trọng tâm.',
        annotationStatus: 'CONTROLLED_SYNTHETIC',
      },
    };
  });
  const manifest = {
    version: '1.0.0',
    caseCount: records.length,
    development: records.filter((item) => item.split === 'development').length,
    test: records.filter((item) => item.split === 'test').length,
    pairedPersonaCount: new Set(records.map((item) => item.pairId)).size,
    features: Object.fromEntries(
      features.map((feature) => [
        feature,
        records.filter((item) => item.feature === feature).length,
      ]),
    ),
    scenarios: Object.fromEntries(
      scenarios.map((scenario) => [
        scenario,
        records.filter((item) => item.scenario === scenario).length,
      ]),
    ),
  };
  mkdirSync(dirname(outputPath), { recursive: true });
  writeFileSync(
    outputPath,
    `${records.map((item) => JSON.stringify(item)).join('\n')}\n`,
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
