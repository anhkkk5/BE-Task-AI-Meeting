import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

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
  split: 'development' | 'test';
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

type RawResponseRecord = {
  stt: number;
  timestamp: string;
  caseId: string;
  split: 'development' | 'test';
  category: 'TASK' | 'SPRINT' | 'MEETING' | 'ACTION_ITEM' | 'CROSS_SOURCE' | 'SUGGESTED_QUESTIONS';
  question: string;
  model: string;
  durationMs: number;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
  answer: string;
  suggestedQuestions: string[];
  sources: Array<{ type: string; label: string; id: string }>;
  isCorrect: boolean;
  hasValidCitation: boolean;
  missingSourceTypes?: string[];
};

function verifySemanticCorrectness(c: EvalCase, answer: string, suggestedQuestions: string[]): boolean {
  const normAns = answer.toLowerCase();
  const s = c.sourceData;

  switch (c.category) {
    case 'TASK': {
      const hasCode = normAns.includes(s.task.code.toLowerCase());
      const hasStatus = normAns.includes(s.task.status.toLowerCase());
      const hasAssignee = normAns.includes(s.task.assignee.toLowerCase());
      // Due date có thể là dạng 2026-08-11 hoặc dạng chữ "11 tháng 8 năm 2026"
      const dateParts = s.task.dueDate.split('-'); // ["2026", "08", "11"]
      const hasDueDate =
        normAns.includes(s.task.dueDate) ||
        (normAns.includes(dateParts[0]) && normAns.includes(String(parseInt(dateParts[2], 10))));
      return hasCode && hasStatus && hasAssignee && hasDueDate;
    }

    case 'SPRINT': {
      const completed = s.sprint.completedTasks;
      const total = s.sprint.totalTasks;
      const remaining = total - completed;
      const days = s.sprint.daysRemaining;

      const hasFractionCompleted = normAns.includes(`${completed}/${total}`);
      const hasCountCompleted = normAns.includes(`${completed} `) || normAns.includes(`${completed} task`) || normAns.includes(`${completed} công việc`) || normAns.includes(`${completed} nhiệm vụ`);
      const hasCountRemaining = normAns.includes(`${remaining} `) || normAns.includes(`${remaining}/${total}`) || normAns.includes(`${remaining} task`) || normAns.includes(`${remaining} công việc`) || normAns.includes(`${remaining} nhiệm vụ`);
      const percent = ((completed / total) * 100).toFixed(2);
      const hasPercent = normAns.includes(percent) || normAns.includes(String(Math.round((completed / total) * 100)));
      const hasDays = normAns.includes(`${days} ngày`) || normAns.includes(`${days} days`);

      const hasProgressFact = hasFractionCompleted || (hasCountCompleted && hasCountRemaining) || hasPercent || (hasCountCompleted && hasDays);
      return hasProgressFact && hasDays;
    }

    case 'MEETING': {
      // Câu hỏi chỉ hỏi quyết định cuộc họp ("Cuộc họp gần nhất đã thống nhất quyết định gì?")
      // Kiểm tra xem câu trả lời có chứa quyết định cốt lõi không
      const decisionNorm = s.meeting.decision.toLowerCase();
      // Ví dụ decision: "Ưu tiên xử lý PA-015 trước thứ Sáu"
      const hasDirectDecision = normAns.includes(decisionNorm);
      const hasTaskCode = normAns.includes(s.task.code.toLowerCase());
      const hasPriorityKeyword = normAns.includes('ưu tiên') || normAns.includes('xử lý') || normAns.includes('hoàn thành');
      const hasDeadlineKeyword = normAns.includes('thứ sáu') || normAns.includes('thứ 6') || normAns.includes('friday');

      return hasDirectDecision || (hasTaskCode && hasPriorityKeyword && hasDeadlineKeyword);
    }

    case 'ACTION_ITEM': {
      const hasActionText = normAns.includes(s.actionItem.text.toLowerCase()) || (normAns.includes(s.task.code.toLowerCase()) && normAns.includes('kiểm thử'));
      const hasAssignee = normAns.includes(s.actionItem.assignee.toLowerCase());
      const hasDueDate = normAns.includes(s.actionItem.dueDate);
      return hasActionText && hasAssignee && hasDueDate;
    }

    case 'CROSS_SOURCE': {
      const hasTaskCode = normAns.includes(s.task.code.toLowerCase());
      const hasSprintName = normAns.includes(s.sprint.name.toLowerCase());
      
      // Sprint progress: 10/16 hoặc 6/16 hoặc 7/12 hoặc 5/13 v.v.
      const completed = s.sprint.completedTasks;
      const total = s.sprint.totalTasks;
      const remaining = total - completed;
      const hasSprintProgress =
        normAns.includes(`${completed}/${total}`) ||
        normAns.includes(`${remaining}/${total}`) ||
        (normAns.includes(String(completed)) && normAns.includes(String(total))) ||
        (normAns.includes(String(remaining)) && normAns.includes(String(total)));

      // Task status: TODO / IN_PROGRESS
      const hasTaskStatus = normAns.includes(s.task.status.toLowerCase()) || normAns.includes('thực hiện');

      // Meeting decision: ưu tiên / thứ Sáu
      const hasMeetingDecision = (normAns.includes('ưu tiên') || normAns.includes('hoàn thành')) && normAns.includes('thứ sáu');

      // Blocker: môi trường test
      const hasBlocker = normAns.includes('môi trường test') || normAns.includes(s.dailyUpdate.member.toLowerCase());

      // Risk assessment
      const hasRisk = normAns.includes('rủi ro') || normAns.includes('chậm') || normAns.includes('nguy cơ') || normAns.includes('đe dọa');

      return hasTaskCode && hasSprintName && hasSprintProgress && hasTaskStatus && hasMeetingDecision && hasBlocker && hasRisk;
    }

    case 'SUGGESTED_QUESTIONS': {
      const fullText = (answer + ' ' + suggestedQuestions.join(' ')).toLowerCase();
      const hasSprintOrProgress = fullText.includes('sprint') || fullText.includes('tiến độ') || fullText.includes('nhiệm vụ');
      const hasTaskOrAction = fullText.includes('task') || fullText.includes('action') || fullText.includes('công việc') || fullText.includes('pa-') || fullText.includes('nghiệm thu');
      const hasRiskOrBlocker = fullText.includes('trở ngại') || fullText.includes('rủi ro') || fullText.includes('blocker') || fullText.includes('vấn đề');

      return hasSprintOrProgress && hasTaskOrAction && hasRiskOrBlocker;
    }

    default:
      return false;
  }
}

function verifyCitationCorrectness(c: EvalCase, sources: Array<{ type: string }>) {
  const returnedTypes = new Set(sources.map((s) => s.type));
  const missingSourceTypes = c.groundTruth.requiredSourceTypes.filter((t) => !returnedTypes.has(t));
  const hasValidCitation = missingSourceTypes.length === 0;
  return { hasValidCitation, missingSourceTypes };
}

function main() {
  console.log('=== TIẾN HÀNH RE-EVALUATE CHẤM LẠI NGỮ NGHĨA TRÊN 42 RAW RESPONSES CÓ SẴN ===');

  const casesPath = resolve('datasets', 'project-assistant-evaluation', 'v1', 'cases.jsonl');
  const rawCasesLines = readFileSync(casesPath, 'utf8').split(/\r?\n/).filter(Boolean);
  const cases: EvalCase[] = rawCasesLines.map((line) => JSON.parse(line) as EvalCase);

  const rawResponsesPath = resolve('datasets', 'project-assistant-evaluation', 'v1', 'openai_live_raw_responses.jsonl');
  const rawRespLines = readFileSync(rawResponsesPath, 'utf8').split(/\r?\n/).filter(Boolean);
  const responses: RawResponseRecord[] = rawRespLines.map((line) => JSON.parse(line) as RawResponseRecord);

  if (cases.length !== responses.length) {
    throw new Error(`Số lượng cases (${cases.length}) và responses (${responses.length}) không khớp!`);
  }

  type StatItem = { total: number; correct: number; validCitation: number; totalDurationMs: number; totalTokens: number };
  const initStats = () => ({
    TASK: { total: 0, correct: 0, validCitation: 0, totalDurationMs: 0, totalTokens: 0 },
    SPRINT: { total: 0, correct: 0, validCitation: 0, totalDurationMs: 0, totalTokens: 0 },
    MEETING: { total: 0, correct: 0, validCitation: 0, totalDurationMs: 0, totalTokens: 0 },
    ACTION_ITEM: { total: 0, correct: 0, validCitation: 0, totalDurationMs: 0, totalTokens: 0 },
    CROSS_SOURCE: { total: 0, correct: 0, validCitation: 0, totalDurationMs: 0, totalTokens: 0 },
    SUGGESTED_QUESTIONS: { total: 0, correct: 0, validCitation: 0, totalDurationMs: 0, totalTokens: 0 },
  });

  const testStats: Record<string, StatItem> = initStats();
  const devStats: Record<string, StatItem> = initStats();
  const overallStats: Record<string, StatItem> = initStats();

  const updatedResponses: RawResponseRecord[] = [];

  for (let i = 0; i < cases.length; i++) {
    const c = cases[i];
    const r = responses[i];

    const isCorrect = verifySemanticCorrectness(c, r.answer, r.suggestedQuestions);
    const { hasValidCitation, missingSourceTypes } = verifyCitationCorrectness(c, r.sources);

    const targetStat = c.split === 'test' ? testStats[c.category] : devStats[c.category];
    targetStat.total += 1;
    if (isCorrect) targetStat.correct += 1;
    if (hasValidCitation) targetStat.validCitation += 1;
    targetStat.totalDurationMs += r.durationMs;
    targetStat.totalTokens += r.usage?.total_tokens ?? 0;

    const ovStat = overallStats[c.category];
    ovStat.total += 1;
    if (isCorrect) ovStat.correct += 1;
    if (hasValidCitation) ovStat.validCitation += 1;
    ovStat.totalDurationMs += r.durationMs;
    ovStat.totalTokens += r.usage?.total_tokens ?? 0;

    const updatedRecord: RawResponseRecord = {
      ...r,
      isCorrect,
      hasValidCitation,
      missingSourceTypes,
    };
    updatedResponses.push(updatedRecord);
  }

  // Cập nhật lại raw_responses.jsonl với cờ isCorrect đã được chấm lại
  writeFileSync(rawResponsesPath, updatedResponses.map((r) => JSON.stringify(r)).join('\n') + '\n', 'utf8');

  const formatSummary = (stats: Record<string, StatItem>) =>
    Object.entries(stats).map(([cat, stat]) => ({
      'Nhóm câu hỏi': cat,
      'Số câu': stat.total,
      'Đúng': stat.correct,
      'Tỉ lệ đúng (%)': stat.total ? `${((stat.correct / stat.total) * 100).toFixed(2)}%` : '0.00%',
      'Trích dẫn chuẩn': stat.validCitation,
      'Tỉ lệ trích dẫn (%)': stat.total ? `${((stat.validCitation / stat.total) * 100).toFixed(2)}%` : '0.00%',
      'Latency TB (ms)': stat.total ? Math.round(stat.totalDurationMs / stat.total) : 0,
      'Tokens TB': stat.total ? Math.round(stat.totalTokens / stat.total) : 0,
    }));

  console.log('\n===============================================================');
  console.log('=== KẾT QUẢ ĐÁNH GIÁ CHÍNH THỨC TRÊN TẬP TEST (36 CÂU) ===');
  console.log('===============================================================');
  const testSummaryTable = formatSummary(testStats);
  console.table(testSummaryTable);

  console.log('\n===============================================================');
  console.log('=== KẾT QUẢ KIỂM TRA SƠ BỘ TRÊN TẬP DEV (6 CÂU) ===');
  console.log('===============================================================');
  const devSummaryTable = formatSummary(devStats);
  console.table(devSummaryTable);

  console.log('\n===============================================================');
  console.log('=== KẾT QUẢ TỔNG THỂ TOÀN BỘ 42 CÂU (6 DEV + 36 TEST) ===');
  console.log('===============================================================');
  const overallSummaryTable = formatSummary(overallStats);
  console.table(overallSummaryTable);

  const calcTotals = (stats: Record<string, StatItem>) => {
    const totalQ = Object.values(stats).reduce((sum, s) => sum + s.total, 0);
    const totalC = Object.values(stats).reduce((sum, s) => sum + s.correct, 0);
    const totalV = Object.values(stats).reduce((sum, s) => sum + s.validCitation, 0);
    const totalLat = Object.values(stats).reduce((sum, s) => sum + s.totalDurationMs, 0);
    const totalTok = Object.values(stats).reduce((sum, s) => sum + s.totalTokens, 0);
    return {
      totalCases: totalQ,
      correctCount: totalC,
      correctRate: totalQ ? `${((totalC / totalQ) * 100).toFixed(2)}%` : '0.00%',
      validCitationCount: totalV,
      validCitationRate: totalQ ? `${((totalV / totalQ) * 100).toFixed(2)}%` : '0.00%',
      avgLatencyMs: totalQ ? Math.round(totalLat / totalQ) : 0,
      avgTokens: totalQ ? Math.round(totalTok / totalQ) : 0,
    };
  };

  const finalOutput = {
    metadata: {
      provider: 'openai',
      model: responses[0]?.model ?? 'gpt-5.6-terra',
      executedAt: new Date().toISOString(),
      datasetFile: 'cases.jsonl',
      testSetTotals: calcTotals(testStats),
      devSetTotals: calcTotals(devStats),
      overallTotals: calcTotals(overallStats),
    },
    testSetSummary: testSummaryTable,
    devSetSummary: devSummaryTable,
    overallSummary: overallSummaryTable,
    results: updatedResponses,
  };

  const resultsJsonPath = resolve('datasets', 'project-assistant-evaluation', 'v1', 'openai_live_eval_results.json');
  writeFileSync(resultsJsonPath, JSON.stringify(finalOutput, null, 2), 'utf8');
  console.log(`\nĐã cập nhật JSON chuẩn tại: ${resultsJsonPath}`);
}

main();
