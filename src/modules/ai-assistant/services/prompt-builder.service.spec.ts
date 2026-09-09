import { AiFocusArea } from '../../users/enums/ai-focus-area.enum';
import { AiResponseStyle } from '../../users/enums/ai-response-style.enum';
import { AiTone } from '../../users/enums/ai-tone.enum';
import { PromptBuilderService } from './prompt-builder.service';

describe('PromptBuilderService personalization', () => {
  const service = new PromptBuilderService();

  it('adds the selected style, tone and focus areas to a personal report prompt', () => {
    const prompt = service.buildPersonalDailyReportPrompt({} as never, {
      responseStyle: AiResponseStyle.Concise,
      tone: AiTone.Direct,
      focusAreas: [AiFocusArea.Blockers, AiFocusArea.Deadlines],
    });

    expect(prompt).toContain('Ngắn gọn');
    expect(prompt).toContain('Thẳng vào vấn đề');
    expect(prompt).toContain('vướng mắc, thời hạn');
    expect(prompt).toContain('Bạn là trợ lý AI');
    expect(prompt).toContain('Chưa có dữ liệu');
    expect(prompt).toContain('tiếng Việt có dấu');
    expect(prompt).not.toContain('Ban la tro ly AI');
    expect(prompt).not.toContain('{{PERSONALIZATION}}');
  });

  it('uses defaults for a personalized meeting summary', () => {
    const prompt = service.buildPersonalizedMeetingSummaryPrompt({} as never);

    expect(prompt).toContain('Cân bằng');
    expect(prompt).toContain('Chuyên nghiệp');
    expect(prompt).not.toContain('{{PERSONALIZATION}}');
  });

  it('builds team and meeting prompts with accented Vietnamese instructions', () => {
    const teamPrompt = service.buildTeamDailyReportPrompt({} as never);
    const meetingPrompt = service.buildMeetingSummaryPrompt({} as never);

    expect(teamPrompt).toContain('báo cáo bàn giao công việc');
    expect(teamPrompt).toContain('tiếng Việt có dấu');
    expect(teamPrompt).not.toContain('Bao cao bang tieng Viet');
    expect(meetingPrompt).toContain('summary chỉ 1 câu kết luận ngắn');
    expect(meetingPrompt).toContain('tiếng Việt có dấu');
  });
});
