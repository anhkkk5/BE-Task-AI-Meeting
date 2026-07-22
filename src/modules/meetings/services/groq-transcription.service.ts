import {
  BadGatewayException,
  BadRequestException,
  Injectable,
  RequestTimeoutException,
  ServiceUnavailableException,
} from '@nestjs/common';

export type MeetingAudioFile = {
  buffer: Buffer;
  mimetype: string;
  originalname?: string;
  size?: number;
};

type GroqTranscriptionResponse = {
  text?: string;
  language?: string;
  duration?: number;
};

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

@Injectable()
export class GroqTranscriptionService {
  async transcribe(file: MeetingAudioFile) {
    this.validateAudio(file);

    const apiKey = process.env.GROQ_API_KEY || process.env.AI_API_KEY;

    if (!apiKey) {
      throw new ServiceUnavailableException(
        'Chua cau hinh GROQ_API_KEY cho chuyen am thanh thanh van ban',
      );
    }

    const model =
      process.env.GROQ_TRANSCRIPTION_MODEL || 'whisper-large-v3-turbo';
    const timeoutMs = Number(
      process.env.GROQ_TRANSCRIPTION_TIMEOUT_MS || 45000,
    );
    const formData = new FormData();
    formData.append(
      'file',
      new Blob([new Uint8Array(file.buffer)], { type: file.mimetype }),
      file.originalname || `meeting-audio-${Date.now()}.webm`,
    );
    formData.append('model', model);
    formData.append(
      'language',
      process.env.GROQ_TRANSCRIPTION_LANGUAGE || 'vi',
    );
    formData.append('response_format', 'verbose_json');
    formData.append('temperature', '0');

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(
        'https://api.groq.com/openai/v1/audio/transcriptions',
        {
          method: 'POST',
          headers: { Authorization: `Bearer ${apiKey}` },
          body: formData,
          signal: controller.signal,
        },
      );
      const payload = (await response
        .json()
        .catch(() => ({}))) as GroqTranscriptionResponse & {
        error?: { message?: string };
      };

      if (!response.ok) {
        throw new BadGatewayException(
          payload.error?.message || 'Groq khong the xu ly doan am thanh',
        );
      }

      const text = payload.text?.trim();

      if (!text) {
        throw new BadRequestException(
          'Khong nhan dien duoc loi noi trong doan am thanh',
        );
      }

      return {
        text,
        model,
        language: payload.language,
        duration: payload.duration,
      };
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw new RequestTimeoutException(
          'Groq xu ly am thanh qua thoi gian cho phep',
        );
      }

      throw error;
    } finally {
      clearTimeout(timeout);
    }
  }

  private validateAudio(file?: MeetingAudioFile) {
    if (!file?.buffer?.length) {
      throw new BadRequestException('Vui long gui tep am thanh');
    }

    if ((file.size ?? file.buffer.length) > MAX_AUDIO_SIZE_BYTES) {
      throw new BadRequestException('Doan am thanh khong duoc vuot qua 10 MB');
    }

    const mimeType = file.mimetype?.split(';')[0].toLowerCase();

    if (!SUPPORTED_AUDIO_TYPES.has(mimeType)) {
      throw new BadRequestException(
        'Dinh dang am thanh khong duoc ho tro',
      );
    }
  }
}
