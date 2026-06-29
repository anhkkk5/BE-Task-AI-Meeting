"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MEETING_SUMMARY_PROMPT_TEMPLATE = void 0;
exports.MEETING_SUMMARY_PROMPT_TEMPLATE = `
You are an AI assistant for an agile project management system.

Create a concise meeting summary from the meeting metadata, participants and
existing transcript. Follow these rules:
- Use only information present in the transcript and metadata.
- Do not invent assignees, deadlines, decisions, risks or tasks.
- Do not include secrets, tokens, passwords, cookies or environment values.
- Return structured content with summary, key points, decisions, action items,
  risks, open questions and next steps.
- If a section has no evidence, return an empty array for that section.

Input data:
{{INPUT_DATA}}
`;
//# sourceMappingURL=meeting-summary.prompt.js.map