"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GroqTranscriptionService = void 0;
const common_1 = require("@nestjs/common");
const MAX_AUDIO_SIZE_BYTES = 10 * 1024 * 1024;
const SUPPORTED_AUDIO_TYPES = new Set([
    'audio/webm',
    'video/webm',
    'audio/mp4',
    'audio/mpeg',
    'audio/wav',
    'audio/x-wav',
    'audio/ogg',
    'audio/x-m4a',
]);
let GroqTranscriptionService = class GroqTranscriptionService {
    async transcribe(file) {
        this.validateAudio(file);
        const apiKey = process.env.GROQ_API_KEY || process.env.AI_API_KEY;
        if (!apiKey) {
            throw new common_1.ServiceUnavailableException('Chua cau hinh GROQ_API_KEY cho chuyen am thanh thanh van ban');
        }
        const model = process.env.GROQ_TRANSCRIPTION_MODEL || 'whisper-large-v3';
        const prompt = process.env.GROQ_TRANSCRIPTION_PROMPT?.trim() ||
            'Cuộc họp công việc bằng tiếng Việt. Viết đúng chính tả tiếng Việt có dấu; giữ nguyên tên riêng, mã công việc và các thuật ngữ Agile, Scrum, Sprint, Backlog, API.';
        const timeoutMs = Number(process.env.GROQ_TRANSCRIPTION_TIMEOUT_MS || 45000);
        const formData = new FormData();
        formData.append('file', new Blob([new Uint8Array(file.buffer)], { type: file.mimetype }), file.originalname || `meeting-audio-${Date.now()}.webm`);
        formData.append('model', model);
        formData.append('language', process.env.GROQ_TRANSCRIPTION_LANGUAGE || 'vi');
        formData.append('prompt', prompt);
        formData.append('response_format', 'verbose_json');
        formData.append('temperature', '0');
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), timeoutMs);
        try {
            const response = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
                method: 'POST',
                headers: { Authorization: `Bearer ${apiKey}` },
                body: formData,
                signal: controller.signal,
            });
            const payload = (await response
                .json()
                .catch(() => ({})));
            if (!response.ok) {
                throw new common_1.BadGatewayException(payload.error?.message || 'Groq khong the xu ly doan am thanh');
            }
            const text = payload.text?.trim();
            if (!text) {
                throw new common_1.BadRequestException('Khong nhan dien duoc loi noi trong doan am thanh');
            }
            return {
                text,
                model,
                language: payload.language,
                duration: payload.duration,
            };
        }
        catch (error) {
            if (error instanceof Error && error.name === 'AbortError') {
                throw new common_1.RequestTimeoutException('Groq xu ly am thanh qua thoi gian cho phep');
            }
            throw error;
        }
        finally {
            clearTimeout(timeout);
        }
    }
    validateAudio(file) {
        if (!file?.buffer?.length) {
            throw new common_1.BadRequestException('Vui long gui tep am thanh');
        }
        if ((file.size ?? file.buffer.length) > MAX_AUDIO_SIZE_BYTES) {
            throw new common_1.BadRequestException('Doan am thanh khong duoc vuot qua 10 MB');
        }
        const mimeType = file.mimetype?.split(';')[0].toLowerCase();
        if (!SUPPORTED_AUDIO_TYPES.has(mimeType)) {
            throw new common_1.BadRequestException('Dinh dang am thanh khong duoc ho tro');
        }
    }
};
exports.GroqTranscriptionService = GroqTranscriptionService;
exports.GroqTranscriptionService = GroqTranscriptionService = __decorate([
    (0, common_1.Injectable)()
], GroqTranscriptionService);
//# sourceMappingURL=groq-transcription.service.js.map