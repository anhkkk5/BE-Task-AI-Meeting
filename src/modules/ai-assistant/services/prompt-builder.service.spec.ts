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
    expect(prompt).not.toContain('{{PERSONALIZATION}}');
  });

  it('uses defaults for a personalized meeting summary', () => {
    const prompt = service.buildPersonalizedMeetingSummaryPrompt({} as never);

    expect(prompt).toContain('Cân bằng');
    expect(prompt).toContain('Chuyên nghiệp');
    expect(prompt).not.toContain('{{PERSONALIZATION}}');
  });
});
