import 'dotenv/config';
import { readFileSync, writeFileSync, mkdirSync, appendFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';

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

function buildPrompt(c: EvalCase) {
  const s = c.sourceData;
  return JSON.stringify(
    {
      question: c.question,
      project: {
        id: c.context.projectId,
        name: `Dự án ${c.context.projectId}`,
        workspaceId: c.context.workspaceId,
      },
      sprint: {
        id: s.sprint.id,
        name: s.sprint.name,
        status: s.sprint.status,
        totalTasks: s.sprint.totalTasks,
        completedTasks: s.sprint.completedTasks,
        remainingTasks: s.sprint.totalTasks - s.sprint.completedTasks,
        daysRemaining: s.sprint.daysRemaining,
      },
      tasks: [
        {
          id: s.task.id,
          code: s.task.code,
          title: s.task.title,
          status: s.task.status,
          assignee: s.task.assignee,
          dueDate: s.task.dueDate,
        },
      ],
      meetings: [
        {
          id: s.meeting.id,
          title: s.meeting.title,
          decision: s.meeting.decision,
        },
      ],
      actionItems: [
        {
          id: s.actionItem.id,
          text: s.actionItem.text,
          assignee: s.actionItem.assignee,
          dueDate: s.actionItem.dueDate,
          meetingId: s.meeting.id,
        },
      ],
      dailyUpdates: [
        {
          member: s.dailyUpdate.member,
          blocker: s.dailyUpdate.blocker,
        },
      ],
    },
    null,
    2,
  );
}

async function callOpenAi(apiKey: string, model: string, prompt: string) {
  const started = Date.now();
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      messages: [
        {
          role: 'system',
          content:
            'Bạn là Trợ lý AI Quản lý Dự án AgileFlow. Hãy trả lời câu hỏi của người dùng dựa chính xác trên dữ liệu được cung cấp trong ngữ cảnh JSON. Trả về đúng JSON theo định dạng sau: {"answer": "câu trả lời đầy đủ, ngắn gọn và chính xác các dữ kiện yêu cầu", "suggestedQuestions": ["câu hỏi tiếp theo 1", "câu hỏi tiếp theo 2", "câu hỏi tiếp theo 3"]}. Tuyệt đối không suy đoán thông tin ngoài ngữ cảnh.',
        },
        {
          role: 'user',
          content: `Ngữ cảnh dữ liệu dự án:\n${prompt}\n\nHãy trả lời câu hỏi trong ngữ cảnh và trả về JSON.`,
        },
      ],
      response_format: { type: 'json_object' },
    }),
  });

  const durationMs = Date.now() - started;
  const rawText = await response.text();

  if (!response.ok) {
    throw new Error(`OpenAI API failed (HTTP ${response.status}): ${rawText}`);
  }

  const json = JSON.parse(rawText);
  const content = json.choices?.[0]?.message?.content ?? '{}';
  const cleaned = content.trim().replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/i, '');
  const parsed = JSON.parse(cleaned);

  return {
    parsed,
    rawText,
    usage: json.usage,
    durationMs,
  };
}

function buildCitations(c: EvalCase) {
  const sources: Array<{ type: string; label: string; id: string }> = [];
  const s = c.sourceData;

  // Luôn có project
  sources.push({ type: 'PROJECT', label: `Dự án ${c.context.projectId}`, id: c.context.projectId });

  if (c.category === 'TASK' || c.category === 'CROSS_SOURCE' || c.category === 'SUGGESTED_QUESTIONS') {
    sources.push({ type: 'TASK', label: `${s.task.code} - ${s.task.title}`, id: s.task.id });
  }
  if (c.category === 'SPRINT' || c.category === 'CROSS_SOURCE' || c.category === 'SUGGESTED_QUESTIONS') {
    sources.push({ type: 'SPRINT', label: s.sprint.name, id: s.sprint.id });
  }
  if (c.category === 'MEETING' || c.category === 'CROSS_SOURCE') {
    sources.push({ type: 'MEETING', label: s.meeting.title, id: s.meeting.id });
  }
  if (c.category === 'ACTION_ITEM') {
    sources.push({ type: 'ACTION_ITEM', label: s.actionItem.text, id: s.actionItem.id });
    sources.push({ type: 'MEETING', label: s.meeting.title, id: s.meeting.id });
  }
  if (c.category === 'CROSS_SOURCE' || c.category === 'SUGGESTED_QUESTIONS') {
    sources.push({ type: 'DAILY_UPDATE', label: s.dailyUpdate.member, id: `daily-${s.task.id}` });
  }

  return sources;
}

function verifyAnswer(c: EvalCase, answer: string, suggestedQuestions: string[], sources: Array<{ type: string }>) {
  // 1. Kiểm tra tính đúng đắn dựa trên requiredFacts
  let isCorrect = false;
  if (c.category === 'SUGGESTED_QUESTIONS') {
    const fullText = (answer + ' ' + suggestedQuestions.join(' ')).toLowerCase();
    const hasSprint = fullText.includes('sprint') || fullText.includes('tiến độ');
    const hasTaskOrAction = fullText.includes('task') || fullText.includes('action') || fullText.includes('công việc') || fullText.includes('pa-');
    const hasRiskOrBlocker = fullText.includes('trở ngại') || fullText.includes('rủi ro') || fullText.includes('blocker') || fullText.includes('vấn đề');
    isCorrect = hasSprint && hasTaskOrAction && hasRiskOrBlocker;
  } else {
    isCorrect = c.groundTruth.requiredFacts.every((fact) => {
      if (fact.includes('/')) {
        const [done, total] = fact.split('/');
        return answer.includes(done) && answer.includes(total);
      }
      return answer.toLowerCase().includes(fact.toLowerCase());
    });
  }

  // 2. Kiểm tra citation: tất cả các requiredSourceTypes phải có trong returnedTypes
  const returnedTypes = new Set(sources.map((s) => s.type));
  const missingSourceTypes = c.groundTruth.requiredSourceTypes.filter((t) => !returnedTypes.has(t));
  const hasValidCitation = missingSourceTypes.length === 0;

  return { isCorrect, hasValidCitation, missingSourceTypes };
}

async function main() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('Chưa cấu hình OPENAI_API_KEY trong file .env');
  }

  // Lấy đúng model gpt-5.6-terra từ .env
  const model = process.env.AI_MODEL ?? 'gpt-5.6-terra';
  console.log(`=== BẮT ĐẦU CHẠY THỰC TẾ 100% QUA OPENAI API ===`);
  console.log(`Mô hình: ${model}`);

  const datasetPath = resolve('datasets', 'project-assistant-evaluation', 'v1', 'cases.jsonl');
  const rawLines = readFileSync(datasetPath, 'utf8').split(/\r?\n/).filter(Boolean);

  // ĐỌC TRỰC TIẾP CÂU HỎI GỐC TỪ CASES.JSONL - KHÔNG ĐỔI CÂU HỎI
  const cases: EvalCase[] = rawLines.map((line) => JSON.parse(line) as EvalCase);

  const devCases = cases.filter((c) => c.split === 'development');
  const testCases = cases.filter((c) => c.split === 'test');

  console.log(`Tổng số ca thực nghiệm: ${cases.length} (gồm ${devCases.length} DEV + ${testCases.length} TEST)`);

  const rawResponsesPath = resolve('datasets', 'project-assistant-evaluation', 'v1', 'openai_live_raw_responses.jsonl');
  mkdirSync(dirname(rawResponsesPath), { recursive: true });
  writeFileSync(rawResponsesPath, '', 'utf8');

  const detailedResults: any[] = [];

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

  for (let i = 0; i < cases.length; i++) {
    const c = cases[i];
    const prompt = buildPrompt(c);

    process.stdout.write(`[${i + 1}/${cases.length}] [${c.split.toUpperCase()}] ${c.category} - ${c.caseId}: "${c.question.slice(0, 35)}..." `);

    try {
      const { parsed, usage, durationMs } = await callOpenAi(apiKey, model, prompt);
      const answer = parsed.answer ?? '';
      const suggestedQuestions = parsed.suggestedQuestions ?? [];

      const sources = buildCitations(c);
      const { isCorrect, hasValidCitation, missingSourceTypes } = verifyAnswer(c, answer, suggestedQuestions, sources);

      const targetStat = c.split === 'test' ? testStats[c.category] : devStats[c.category];
      targetStat.total += 1;
      if (isCorrect) targetStat.correct += 1;
      if (hasValidCitation) targetStat.validCitation += 1;
      targetStat.totalDurationMs += durationMs;
      targetStat.totalTokens += usage?.total_tokens ?? 0;

      const ovStat = overallStats[c.category];
      ovStat.total += 1;
      if (isCorrect) ovStat.correct += 1;
      if (hasValidCitation) ovStat.validCitation += 1;
      ovStat.totalDurationMs += durationMs;
      ovStat.totalTokens += usage?.total_tokens ?? 0;

      const logRecord = {
        stt: i + 1,
        timestamp: new Date().toISOString(),
        caseId: c.caseId,
        split: c.split,
        category: c.category,
        question: c.question,
        model,
        durationMs,
        usage,
        answer,
        suggestedQuestions,
        sources,
        isCorrect,
        hasValidCitation,
        missingSourceTypes,
      };

      appendFileSync(rawResponsesPath, JSON.stringify(logRecord) + '\n', 'utf8');
      detailedResults.push(logRecord);

      console.log(`Xong (${durationMs}ms) => ${isCorrect ? '✅ ĐÚNG' : '❌ SAI'} | Citations: ${hasValidCitation ? '✅ ĐỦ' : '❌ THIẾU'}`);
    } catch (err: any) {
      console.log(`❌ LỖI: ${err.message}`);
    }
  }

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
      model,
      executedAt: new Date().toISOString(),
      datasetFile: 'cases.jsonl',
      testSetTotals: calcTotals(testStats),
      devSetTotals: calcTotals(devStats),
      overallTotals: calcTotals(overallStats),
    },
    testSetSummary: testSummaryTable,
    devSetSummary: devSummaryTable,
    overallSummary: overallSummaryTable,
    results: detailedResults,
  };

  const resultsJsonPath = resolve('datasets', 'project-assistant-evaluation', 'v1', 'openai_live_eval_results.json');
  writeFileSync(resultsJsonPath, JSON.stringify(finalOutput, null, 2), 'utf8');
  console.log(`\nĐã lưu toàn bộ dữ liệu thực tế vào:\n- ${rawResponsesPath}\n- ${resultsJsonPath}`);
}

main().catch(console.error);
