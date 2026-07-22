import { AiFocusArea } from '../enums/ai-focus-area.enum';
import { AiResponseStyle } from '../enums/ai-response-style.enum';
import { AiTone } from '../enums/ai-tone.enum';

export type ResolvedAiUserPreferences = {
  responseStyle: AiResponseStyle;
  tone: AiTone;
  focusAreas: AiFocusArea[];
};

export const DEFAULT_AI_USER_PREFERENCES: ResolvedAiUserPreferences = {
  responseStyle: AiResponseStyle.Balanced,
  tone: AiTone.Professional,
  focusAreas: [
    AiFocusArea.Progress,
    AiFocusArea.Blockers,
    AiFocusArea.Decisions,
    AiFocusArea.ActionItems,
  ],
};
