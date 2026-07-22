import { AiFocusArea } from '../enums/ai-focus-area.enum';
import { AiResponseStyle } from '../enums/ai-response-style.enum';
import { AiTone } from '../enums/ai-tone.enum';
export declare class UpdateAiUserPreferencesDto {
    responseStyle?: AiResponseStyle;
    tone?: AiTone;
    focusAreas?: AiFocusArea[];
}
