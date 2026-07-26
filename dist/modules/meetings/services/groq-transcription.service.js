"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var GroqTranscriptionService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.GroqTranscriptionService = void 0;
const common_1 = require("@nestjs/common");
const transcript_noise_util_1 = require("../../../common/utils/transcript-noise.util");
const MAX_AUDIO_SIZE_BYTES = 25 * 1024 * 1024;
const MIN_AUDIO_SIZE_BYTES = 2 * 1024;
const NO_SPEECH_PROB_LIMIT = 0.35;
const AVG_LOGPROB_LIMIT = -0.7;
const COMPRESSION_RATIO_LIMIT = 2.2;
const MAX_PROMPT_CHARS = 600;
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
const AUDIO_EXTENSIONS = {
    'audio/webm': 'webm',
    'video/webm': 'webm',
    'audio/mp4': 'm4a',
    'audio/x-m4a': 'm4a',
    'audio/mpeg': 'mp3',
    'audio/wav': 'wav',
    'audio/x-wav': 'wav',
    'audio/ogg': 'ogg',
};
let GroqTranscriptionService = GroqTranscriptionService_1 = class GroqTranscriptionService {
    logger = new common_1.Logger(GroqTranscriptionService_1.name);
    async transcribe(file, options = {}) {
        this.validateAudio(file);
        const apiKey = process.env.GROQ_API_KEY || process.env.AI_API_KEY;
        if (!apiKey) {
            throw new common_1.ServiceUnavailableException('Chua cau hinh GROQ_API_KEY cho chuyen am thanh thanh van ban');
        }
        const model = process.env.GROQ_TRANSCRIPTION_MODEL || 'whisper-large-v3';
        const timeoutMs = Number(process.env.GROQ_TRANSCRIPTION_TIMEOUT_MS || 45000);
        const formData = new FormData();
        const mimeType = file.mimetype?.split(';')[0].toLowerCase();
        const extension = AUDIO_EXTENSIONS[mimeType] ?? 'webm';
        formData.append('file', new Blob([new Uint8Array(file.buffer)], { type: mimeType }), file.originalname || `meeting-audio-${Date.now()}.${extension}`);
        formData.append('model', model);
        formData.append('language', process.env.GROQ_TRANSCRIPTION_LANGUAGE || 'vi');
        const prompt = this.buildPrompt(options);
        if (prompt)
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
            return {
                text: this.extractConfidentText(payload),
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
    buildPrompt(options) {
        const hints = (options.vocabularyHints ?? [])
            .map((hint) => hint.trim())
            .filter(Boolean)
            .slice(0, 20);
        if (!hints.length)
            return '';
        return hints.join(', ').slice(0, MAX_PROMPT_CHARS);
    }
    extractConfidentText(payload) {
        const segments = payload.segments ?? [];
        if (!segments.length) {
            const fallbackText = payload.text?.trim() ?? '';
            return !fallbackText || (0, transcript_noise_util_1.isNoiseTranscript)(fallbackText)
                ? ''
                : fallbackText;
        }
        const keptSegments = segments.filter((segment) => {
            const segmentText = segment.text?.trim();
            if (!segmentText || (0, transcript_noise_util_1.isNoiseTranscript)(segmentText))
                return false;
            if ((segment.no_speech_prob ?? 0) > NO_SPEECH_PROB_LIMIT)
                return false;
            if ((segment.avg_logprob ?? 0) < AVG_LOGPROB_LIMIT)
                return false;
            if ((segment.compression_ratio ?? 0) > COMPRESSION_RATIO_LIMIT) {
                return false;
            }
            return true;
        });
        if (!keptSegments.length) {
            this.logger.debug(`Bo qua ${segments.length} segment vi khong du tin cay hoac la nhieu.`);
        }
        return keptSegments
            .map((segment) => segment.text?.trim())
            .filter(Boolean)
            .join(' ')
            .replace(/\s+/g, ' ')
            .trim();
    }
    validateAudio(file) {
        if (!file?.buffer?.length) {
            throw new common_1.BadRequestException('Vui long gui tep am thanh');
        }
        if ((file.size ?? file.buffer.length) > MAX_AUDIO_SIZE_BYTES) {
            throw new common_1.BadRequestException('Doan am thanh khong duoc vuot qua 25 MB');
        }
        if ((file.size ?? file.buffer.length) < MIN_AUDIO_SIZE_BYTES) {
            throw new common_1.BadRequestException('Doan am thanh qua ngan de nhan dien');
        }
        const mimeType = file.mimetype?.split(';')[0].toLowerCase();
        if (!SUPPORTED_AUDIO_TYPES.has(mimeType)) {
            throw new common_1.BadRequestException('Dinh dang am thanh khong duoc ho tro');
        }
    }
};
exports.GroqTranscriptionService = GroqTranscriptionService;
exports.GroqTranscriptionService = GroqTranscriptionService = GroqTranscriptionService_1 = __decorate([
    (0, common_1.Injectable)()
], GroqTranscriptionService);
//# sourceMappingURL=groq-transcription.service.js.map