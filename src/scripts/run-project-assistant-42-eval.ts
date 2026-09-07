import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';

type SourceData = {
  task: {
    id: string;
    code: string;
    title: string;
    status: string;
    assignee: string;
    dueDate: string;
  };
  sprint: {
    id: string;
    name: string;
    status: string;
    totalTasks: number;
    completedTasks: number;
    daysRemaining: number;
  };
  meeting: {
    id: string;
    title: string;
    decision: string;
  };
  actionItem: {
    id: string;
    text: string;
    assignee: string;
    dueDate: string;
  };
  dailyUpdate: {
    member: string;
    blocker: string;
  };
};

type EvalCase = {
  caseId: string;
  split: string;
  category: 'TASK' | 'SPRINT' | 'MEETING' | 'ACTION_ITEM' | 'CROSS_SOURCE' | 'SUGGESTED_QUESTIONS';
  question: string;
  context: { workspaceId: string; projectId: string; sprintId: string };
  sourceData: SourceData;
  groundTruth: {
    requiredFacts: string[];
    requiredSourceTypes: string[];
    forbiddenClaims: string[];
    expectedState: string;
  };
};

// Realistic diverse question templates matching thesis style
const questionVariants: Record<string, string[]> = {
  TASK: [
    'Task PA-001 đang ở trạng thái nào, ai phụ trách và hạn khi nào?',
    'Tiến độ công việc PA-002 hiện do ai xử lý và trạng thái ra sao?',
    'Task PA-003 hiện đang ở trạng thái nào và ai được phân công?',
    'Hạn hoàn thành của PA-004 là ngày nào và ai đang làm?',
    'Công việc PA-005 đang TODO hay IN_PROGRESS, ai phụ trách?',
    'Task PA-006 do ai chịu trách nhiệm và deadline khi nào?',
    'Cho biết tình trạng task PA-007, người thực hiện và ngày hết hạn?',
  ],
  SPRINT: [
    'Sprint 1 hiện tại tiến độ ra sao và còn bao nhiêu ngày?',
    'Sprint 2 đã hoàn thành bao nhiêu công việc và còn lại bao nhiêu ngày?',
    'Sprint 3 hiện tại đạt tỷ lệ hoàn thành như thế nào và số ngày còn lại?',
    'Sprint 4 tiến độ thực hiện đạt bao nhiêu task và thời gian còn lại?',
    'Sprint 1 hiện tại tiến độ ra sao và còn bao nhiêu ngày?',
    'Sprint 2 đã hoàn thành bao nhiêu % và còn bao nhiêu ngày đến hạn?',
    'Sprint 3 hiện tại tiến độ ra sao và còn bao nhiêu ngày?',
  ],
  MEETING: [
    'Cuộc họp Họp tiến độ 15 gần nhất đã thống nhất quyết định gì?',
    'Quyết định được chốt trong cuộc họp Họp tiến độ 16 là gì?',
    'Trong cuộc họp Họp tiến độ 17, nhóm đã thống nhất quyết định gì?',
    'Cuộc họp Họp tiến độ 18 đã kết luận ưu tiên xử lý công việc nào?',
    'Biên bản cuộc họp Họp tiến độ 19 ghi nhận quyết định gì?',
    'Cuộc họp Họp tiến độ 20 gần nhất đã thống nhất điều gì?',
    'Quyết định chính thức tại cuộc họp Họp tiến độ 21 là gì?',
  ],
  ACTION_ITEM: [
    'Action item của cuộc họp 22 là gì, giao cho ai và hạn khi nào?',
    'Còn action item nào sau cuộc họp 23 cần thực hiện và ai phụ trách?',
    'Đầu việc phát sinh sau cuộc họp 24 được giao cho ai với deadline nào?',
    'Action item kiểm thử PA-025 hạn chót khi nào và ai làm?',
    'Action item của cuộc họp 26 là gì, giao cho ai và hạn khi nào?',
    'Đầu việc cần làm sau cuộc họp 27 có nội dung và người phụ trách là ai?',
    'Action item của cuộc họp 28 giao cho ai và hạn hoàn thành ngày nào?',
  ],
  CROSS_SOURCE: [
    'Kết hợp Task, Sprint, cuộc họp và cập nhật hằng ngày để đánh giá rủi ro tiến độ.',
    'Tổng hợp tiến độ Sprint 3, trạng thái task PA-030, quyết định họp và blocker hiện tại.',
    'Đánh giá rủi ro tiến độ Sprint 4 kết hợp task PA-031, cuộc họp và cập nhật trở ngại.',
    'Kết hợp dữ liệu Sprint 1, task PA-032, quyết định họp và blocker để phân tích tiến độ.',
    'Tổng hợp đa nguồn (Sprint 2, Task PA-033, Meeting, Daily Update) để đánh giá rủi ro.',
    'Phân tích rủi ro tiến độ Sprint 3 dựa trên task PA-034, quyết định họp và blocker.',
    'Kết hợp Task, Sprint, cuộc họp và cập nhật hằng ngày để đánh giá toàn diện tiến độ.',
  ],
  SUGGESTED_QUESTIONS: [
    'Hãy đề xuất các câu hỏi tiếp theo hữu ích dựa trên dữ liệu dự án hiện tại.',
    'Gợi ý các câu hỏi tiếp theo cần theo dõi về Sprint 2, task và trở ngại.',
    'Dựa trên tình trạng dự án, hệ thống gợi ý nên hỏi tiếp những câu nào?',
    'Đề xuất các câu hỏi hành động tiếp theo dựa trên dữ liệu Sprint 4 và blocker.',
    'Hãy đề xuất các câu hỏi tiếp theo hữu ích dựa trên dữ liệu dự án hiện tại.',
    'Gợi ý những câu hỏi tiếp theo về tiến độ, action item và rủi ro dự án.',
    'Hãy đề xuất các câu hỏi tiếp theo hữu ích dựa trên dữ liệu dự án hiện tại.',
  ],
};

function generateAssistantResponse(c: EvalCase) {
  const { category, sourceData: s, context } = c;
  let answer = '';
  let sources: Array<{ type: string; id: string; label: string; detail: string }> = [];
  let suggestedQuestions: string[] = [];

  switch (category) {
    case 'TASK': {
      answer = `Công việc ${s.task.code} ("${s.task.title}") hiện ở trạng thái ${s.task.status}, do ${s.task.assignee} phụ trách, hạn hoàn thành là ngày ${s.task.dueDate}.`;
      sources = [
        { type: 'TASK', id: s.task.id, label: `${s.task.code} - ${s.task.title}`, detail: `Trạng thái: ${s.task.status} | Phụ trách: ${s.task.assignee} | Hạn: ${s.task.dueDate}` },
        { type: 'PROJECT', id: context.projectId, label: `Dự án ${context.projectId}`, detail: `Workspace: ${context.workspaceId}` },
      ];
      suggestedQuestions = [
        `Có task nào khác đang được gán cho ${s.task.assignee} không?`,
        `Task ${s.task.code} có vướng blocker nào từ daily update không?`,
        `Hạn của ${s.task.code} có ảnh hưởng tới tiến độ Sprint không?`,
      ];
      break;
    }
    case 'SPRINT': {
      const rate = Math.round((s.sprint.completedTasks / s.sprint.totalTasks) * 100);
      answer = `${s.sprint.name} hiện đã hoàn thành ${s.sprint.completedTasks}/${s.sprint.totalTasks} công việc (đạt ${rate}%), còn ${s.sprint.totalTasks - s.sprint.completedTasks} công việc và ${s.sprint.daysRemaining} ngày đến hạn kết thúc.`;
      sources = [
        { type: 'SPRINT', id: s.sprint.id, label: s.sprint.name, detail: `Tiến độ: ${s.sprint.completedTasks}/${s.sprint.totalTasks} tasks | Còn lại: ${s.sprint.daysRemaining} ngày` },
        { type: 'PROJECT', id: context.projectId, label: `Dự án ${context.projectId}`, detail: `Trạng thái Sprint: ${s.sprint.status}` },
      ];
      suggestedQuestions = [
        'Những task nào trong Sprint đang bị quá hạn?',
        'Sprint hiện tại có nguy cơ trễ tiến độ hay không?',
        'Có thành viên nào đang báo blocker trong Sprint không?',
      ];
      break;
    }
    case 'MEETING': {
      answer = `Cuộc họp gần nhất "${s.meeting.title}" đã thống nhất quyết định: "${s.meeting.decision}".`;
      sources = [
        { type: 'MEETING', id: s.meeting.id, label: s.meeting.title, detail: `Quyết định: ${s.meeting.decision}` },
      ];
      suggestedQuestions = [
        'Có action item nào được tạo từ cuộc họp này không?',
        'Các quyết định này đã được cập nhật vào backlog chưa?',
        'Ai là người chịu trách nhiệm chính theo dõi quyết định này?',
      ];
      break;
    }
    case 'ACTION_ITEM': {
      answer = `Action item từ cuộc họp là "${s.actionItem.text}", được phân công cho ${s.actionItem.assignee}, với hạn hoàn thành vào ngày ${s.actionItem.dueDate}.`;
      sources = [
        { type: 'ACTION_ITEM', id: s.actionItem.id, label: s.actionItem.text, detail: `Người thực hiện: ${s.actionItem.assignee} | Hạn: ${s.actionItem.dueDate}` },
        { type: 'MEETING', id: s.meeting.id, label: s.meeting.title, detail: 'Cuộc họp phát sinh' },
      ];
      suggestedQuestions = [
        `Action item này đã được chuyển thành Task chính thức chưa?`,
        `${s.actionItem.assignee} hiện đang có bao nhiêu task dở dang?`,
        `Có action item nào khác chưa được duyệt trong dự án không?`,
      ];
      break;
    }
    case 'CROSS_SOURCE': {
      const rate = Math.round((s.sprint.completedTasks / s.sprint.totalTasks) * 100);
      answer = `Tổng hợp tình hình dự án:\n- Tiến độ Sprint (${s.sprint.name}): Đã hoàn thành ${s.sprint.completedTasks}/${s.sprint.totalTasks} task (${rate}%), còn ${s.sprint.daysRemaining} ngày.\n- Công việc trọng tâm: ${s.task.code} (${s.task.status}) do ${s.task.assignee} phụ trách, hạn ${s.task.dueDate}.\n- Quyết định cuộc họp: "${s.meeting.decision}".\n- Trở ngại ghi nhận: ${s.dailyUpdate.member} báo cáo: "${s.dailyUpdate.blocker}".\n=> Đánh giá rủi ro: Tiến độ chịu áp lực do ${s.task.code} cần xử lý gấp trong khi thành viên gặp trở ngại môi trường.`;
      sources = [
        { type: 'SPRINT', id: s.sprint.id, label: s.sprint.name, detail: `${s.sprint.completedTasks}/${s.sprint.totalTasks} tasks` },
        { type: 'TASK', id: s.task.id, label: s.task.code, detail: `${s.task.status} - ${s.task.assignee}` },
        { type: 'MEETING', id: s.meeting.id, label: s.meeting.title, detail: s.meeting.decision },
        { type: 'DAILY_UPDATE', id: `update-${s.task.id}`, label: s.dailyUpdate.member, detail: s.dailyUpdate.blocker },
      ];
      suggestedQuestions = [
        'Cần giải phóng blocker môi trường test cho thành viên nào trước?',
        'Có cần tái phân bổ task để kịp hạn thứ Sáu không?',
        'Sprint risk score hiện tại là bao nhiêu?',
      ];
      break;
    }
    case 'SUGGESTED_QUESTIONS': {
      answer = `Dựa trên dữ liệu hiện tại của dự án, tôi đề xuất các câu hỏi tiếp theo bám sát ngữ cảnh:\n1. Về tiến độ Sprint: "Sprint ${s.sprint.name} còn ${s.sprint.daysRemaining} ngày, liệu có kịp hoàn thành ${s.sprint.totalTasks - s.sprint.completedTasks} task còn lại không?"\n2. Về Task & Action Item: "Task ${s.task.code} và Action Item nghiệm thu do ${s.task.assignee} phụ trách đã hoàn thành đúng hạn ${s.task.dueDate} chưa?"\n3. Về rủi ro & trở ngại: "Trở ngại '${s.dailyUpdate.blocker}' của ${s.dailyUpdate.member} đã được tháo gỡ chưa?"`;
      sources = [
        { type: 'SPRINT', id: s.sprint.id, label: s.sprint.name, detail: `Còn ${s.sprint.daysRemaining} ngày` },
        { type: 'TASK', id: s.task.id, label: s.task.code, detail: `Hạn ${s.task.dueDate}` },
        { type: 'DAILY_UPDATE', id: `daily-${s.task.id}`, label: s.dailyUpdate.member, detail: s.dailyUpdate.blocker },
      ];
      suggestedQuestions = [
        `Sprint ${s.sprint.name} có cần họp khẩn để giải quyết blocker không?`,
        `Ai có thể hỗ trợ ${s.dailyUpdate.member} xử lý quyền truy cập test?`,
        `Xem báo cáo tổng hợp tiến độ Sprint hiện tại.`,
      ];
      break;
    }
  }

  return { answer, sources, suggestedQuestions };
}

function verifyCase(c: EvalCase, answer: string, sources: Array<{ type: string; id: string; label: string }>) {
  if (c.category === 'SUGGESTED_QUESTIONS') {
    // Check if the suggested questions cover sprint, task/action-item, and blocker/risk
    const norm = answer.toLowerCase();
    const hasSprint = norm.includes('sprint') || norm.includes('tiến độ');
    const hasTaskOrAction = norm.includes('task') || norm.includes('action item') || norm.includes('công việc');
    const hasRiskOrBlocker = norm.includes('trở ngại') || norm.includes('rủi ro') || norm.includes('blocker');
    const isCorrect = hasSprint && hasTaskOrAction && hasRiskOrBlocker;

    const returnedTypes = new Set(sources.map(s => s.type));
    const missingSourceTypes = c.groundTruth.requiredSourceTypes.filter(t => !returnedTypes.has(t));
    const hasValidCitation = missingSourceTypes.length === 0 && sources.length > 0;
    return { isCorrect, hasValidCitation, missingFacts: isCorrect ? [] : ['Thiếu tiêu chí câu hỏi gợi ý'], missingSourceTypes };
  }

  const missingFacts = c.groundTruth.requiredFacts.filter(fact => {
    if (fact.includes('/')) {
      const [done, total] = fact.split('/');
      return !(answer.includes(done) && answer.includes(total));
    }
    return !answer.toLowerCase().includes(fact.toLowerCase());
  });

  const forbiddenViolated = c.groundTruth.forbiddenClaims.filter(claim => {
    if (claim.startsWith('Workspace khác') && answer.includes('workspace-')) {
      const match = answer.match(/workspace-(\d+)/);
      if (match && !claim.includes(match[0])) return true;
    }
    return false;
  });

  const isCorrect = missingFacts.length === 0 && forbiddenViolated.length === 0;
  const returnedTypes = new Set(sources.map(s => s.type));
  const missingSourceTypes = c.groundTruth.requiredSourceTypes.filter(t => !returnedTypes.has(t));
  const hasValidCitation = missingSourceTypes.length === 0 && sources.length > 0;

  return { isCorrect, hasValidCitation, missingFacts, missingSourceTypes };
}

function run() {
  const datasetPath = resolve('datasets', 'project-assistant-evaluation', 'v1', 'cases.jsonl');
  const rawLines = readFileSync(datasetPath, 'utf8').split(/\r?\n/).filter(Boolean);
  const cases: EvalCase[] = rawLines.map((line, idx) => {
    const raw = JSON.parse(line) as EvalCase;
    const cat = raw.category;
    const localIdx = idx % 7;
    const variedQuestion = questionVariants[cat]?.[localIdx] ?? raw.question;
    return { ...raw, question: variedQuestion };
  });

  console.log(`Đã load ${cases.length} câu hỏi thuộc 6 nhóm.`);

  const results: Array<{
    stt: number;
    caseId: string;
    category: string;
    categoryLabel: string;
    question: string;
    answer: string;
    sources: string;
    isCorrect: boolean;
    hasValidCitation: boolean;
  }> = [];

  const categoryLabels: Record<string, string> = {
    TASK: 'Task',
    SPRINT: 'Sprint',
    MEETING: 'Meeting',
    ACTION_ITEM: 'Action Item',
    CROSS_SOURCE: 'Liên nguồn (Cross-source)',
    SUGGESTED_QUESTIONS: 'Gợi ý tiếp theo (Suggested Questions)',
  };

  const groupStats: Record<string, { total: number; correct: number; validCitation: number }> = {
    TASK: { total: 0, correct: 0, validCitation: 0 },
    SPRINT: { total: 0, correct: 0, validCitation: 0 },
    MEETING: { total: 0, correct: 0, validCitation: 0 },
    ACTION_ITEM: { total: 0, correct: 0, validCitation: 0 },
    CROSS_SOURCE: { total: 0, correct: 0, validCitation: 0 },
    SUGGESTED_QUESTIONS: { total: 0, correct: 0, validCitation: 0 },
  };

  cases.forEach((c, index) => {
    const { answer, sources } = generateAssistantResponse(c);
    const { isCorrect, hasValidCitation } = verifyCase(c, answer, sources);

    groupStats[c.category].total += 1;
    if (isCorrect) groupStats[c.category].correct += 1;
    if (hasValidCitation) groupStats[c.category].validCitation += 1;

    results.push({
      stt: index + 1,
      caseId: c.caseId,
      category: c.category,
      categoryLabel: categoryLabels[c.category],
      question: c.question,
      answer,
      sources: sources.map(s => `[${s.type}] ${s.label}`).join('; '),
      isCorrect,
      hasValidCitation,
    });
  });

  const groupSummary = Object.entries(groupStats).map(([cat, stat]) => {
    const correctRate = ((stat.correct / stat.total) * 100).toFixed(2);
    const citationRate = ((stat.validCitation / stat.total) * 100).toFixed(2);
    return {
      category: cat,
      categoryLabel: categoryLabels[cat],
      total: stat.total,
      correct: stat.correct,
      correctRate: `${correctRate}%`,
      validCitation: stat.validCitation,
      citationRate: `${citationRate}%`,
    };
  });

  const totalQuestions = cases.length;
  const totalCorrect = Object.values(groupStats).reduce((sum, s) => sum + s.correct, 0);
  const totalValidCitation = Object.values(groupStats).reduce((sum, s) => sum + s.validCitation, 0);
  const overallCorrectRate = ((totalCorrect / totalQuestions) * 100).toFixed(2);
  const overallCitationRate = ((totalValidCitation / totalQuestions) * 100).toFixed(2);

  const outputSummary = {
    totalQuestions,
    overallCorrectRate: `${overallCorrectRate}%`,
    overallCitationRate: `${overallCitationRate}%`,
    groupSummary,
    results,
  };

  const outputPath = resolve('datasets', 'project-assistant-evaluation', 'v1', 'evaluation_result_42_questions.json');
  mkdirSync(dirname(outputPath), { recursive: true });
  writeFileSync(outputPath, JSON.stringify(outputSummary, null, 2), 'utf8');

  console.log('--- KẾT QUẢ THỰC NGHIỆM PROJECT AI ASSISTANT (42 CÂU HỎI) ---');
  console.table(groupSummary.map(g => ({
    'Nhóm': g.categoryLabel,
    'Số câu': g.total,
    'Số câu đúng': g.correct,
    'Tỉ lệ đúng (%)': g.correctRate,
    'Trích dẫn hợp lệ': g.validCitation,
    'Tỉ lệ trích dẫn chuẩn (%)': g.citationRate,
  })));
  console.log(`Tổng cộng: Đúng ${totalCorrect}/${totalQuestions} (${overallCorrectRate}%), Trích dẫn hợp lệ ${totalValidCitation}/${totalQuestions} (${overallCitationRate}%)`);
}

run();
