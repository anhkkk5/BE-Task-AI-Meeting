"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_AI_USER_PREFERENCES = void 0;
const ai_focus_area_enum_1 = require("../enums/ai-focus-area.enum");
const ai_response_style_enum_1 = require("../enums/ai-response-style.enum");
const ai_tone_enum_1 = require("../enums/ai-tone.enum");
exports.DEFAULT_AI_USER_PREFERENCES = {
    responseStyle: ai_response_style_enum_1.AiResponseStyle.Balanced,
    tone: ai_tone_enum_1.AiTone.Professional,
    focusAreas: [
        ai_focus_area_enum_1.AiFocusArea.Progress,
        ai_focus_area_enum_1.AiFocusArea.Blockers,
        ai_focus_area_enum_1.AiFocusArea.Decisions,
        ai_focus_area_enum_1.AiFocusArea.ActionItems,
    ],
};
//# sourceMappingURL=ai-user-preferences.type.js.map