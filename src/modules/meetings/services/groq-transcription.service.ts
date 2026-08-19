import {
  BadGatewayException,
  BadRequestException,
  Injectable,
  Logger,
  RequestTimeoutException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { isNoiseTranscript } from '../../../common/utils/transcript-noise.util';

export type MeetingAudioFile = {
  buffer: Buffer;
  mimetype: string;
  originalname?: string;
  size?: number;
};

export type TranscribeOptions = {
  /**
   * Ten thanh vien dung lam tu dien rieng cho Whisper de nhan dien dung
   * chinh ta ten rieng tieng Viet.
   */
  vocabularyHints?: string[];
};

type GroqTranscriptionSegment = {
  text?: string;
  no_speech_prob?: number;
  avg_logprob?: number;
  compression_ratio?: number;
};

type GroqTranscriptionResponse = {
  text?: string;
  language?: string;
  duration?: number;
  segments?: GroqTranscriptionSegment[];
};

const MAX_AUDIO_SIZE_BYTES = 25 * 1024 * 1024;
const MIN_AUDIO_SIZE_BYTES = 2 * 1024;
/**
 * Nguong tin cay. Da siet lai so voi mac dinh vi Whisper rat hay "doan" ra cau
 * quang cao YouTube khi dau vao chi la tieng on: nhung segment do gan nhu luon
 * co no_speech_prob cao va avg_logprob thap.
 */
const NO_SPEECH_PROB_LIMIT = 0.35;
const AVG_LOGPROB_LIMIT = -0.7;
const COMPRESSION_RATIO_LIMIT = 2.2;
/** Whisper chi doc toi da 224 token prompt, phan vuot se bi bo am tham. */
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
/** Whisper suy ra codec mot phan tu phan mo rong nen phai dat ten dung dinh dang. */
const AUDIO_EXTENSIONS: Record<string, string> = {
  'audio/webm': 'webm',
  'video/webm': 'webm',
  'audio/mp4': 'm4a',
  'audio/x-m4a': 'm4a',
  'audio/mpeg': 'mp3',
  'audio/wav': 'wav',
  'audio/x-wav': 'wav',
  'audio/ogg': 'ogg',
};

@Injectable()
export class GroqTranscriptionService {
  private readonly logger = new Logger(GroqTranscriptionService.name);

  async transcribe(file: MeetingAudioFile, options: TranscribeOptions = {}) {
    this.validateAudio(file);

    const useOpenAi = process.env.AI_PROVIDER === 'openai';
    const apiKey = useOpenAi
      ? process.env.OPENAI_API_KEY
      : process.env.GROQ_API_KEY || process.env.AI_API_KEY;

    if (!apiKey) {
      throw new ServiceUnavailableException(
        useOpenAi
          ? 'Chua cau hinh OPENAI_API_KEY cho chuyen am thanh thanh van ban'
          : 'Chua cau hinh GROQ_API_KEY cho chuyen am thanh thanh van ban',
      );
    }

    const model = useOpenAi
      ? process.env.OPENAI_TRANSCRIPTION_MODEL || 'gpt-4o-mini-transcribe'
      : process.env.GROQ_TRANSCRIPTION_MODEL || 'whisper-large-v3';
    const timeoutMs = Number(process.env.AI_TRANSCRIPTION_TIMEOUT_MS || 45000);
    const formData = new FormData();
    const mimeType = file.mimetype?.split(';')[0].toLowerCase();
    const extension = AUDIO_EXTENSIONS[mimeType] ?? 'webm';
    formData.append(
      'file',
      new Blob([new Uint8Array(file.buffer)], { type: mimeType }),
      file.originalname || `meeting-audio-${Date.now()}.${extension}`,
    );
    formData.append('model', model);
    formData.append(
      'language',
      process.env.AI_TRANSCRIPTION_LANGUAGE || 'vi',
    );

    // Chi gui prompt khi that su co ten rieng can giu dung chinh ta. Prompt
    // rong giup Whisper bam sat am thanh thay vi "doan" theo van phong prompt.
    const prompt = this.buildPrompt(options);

    if (prompt) formData.append('prompt', prompt);

    formData.append('response_format', useOpenAi ? 'json' : 'verbose_json');
    // temperature = 0 va tat fallback: Whisper khong duoc tu suy dien khi
    // khong chac chan, tra ve rong con hon tra ve cau bia.
    formData.append('temperature', '0');

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(
        useOpenAi
          ? 'https://api.openai.com/v1/audio/transcriptions'
          : 'https://api.groq.com/openai/v1/audio/transcriptions',
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
          payload.error?.message ||
            `${useOpenAi ? 'OpenAI' : 'Groq'} khong the xu ly doan am thanh`,
        );
      }

      return {
        text: this.extractConfidentText(payload),
        model,
        language: payload.language,
        duration: payload.duration,
      };
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw new RequestTimeoutException(
          `${useOpenAi ? 'OpenAI' : 'Groq'} xu ly am thanh qua thoi gian cho phep`,
        );
      }

      throw error;
    } finally {
      clearTimeout(timeout);
    }
  }

  /**
   * Prompt CHI chua ten rieng cua thanh vien, khong chua cau mo ta nao.
   *
   * Whisper coi prompt nhu "van ban dung ngay truoc doan am thanh" va se bat
   * chuoc van phong cua no. Truoc day ta gui mot cau mo ta kieu "Bien ban hop
   * du an bang tieng Viet..." - voi dau vao la tieng on, Whisper khong co gi de
   * phien am nen no viet tiep theo van phong duoc goi y, va van phong "cau
   * tieng Viet tron tru" pho bien nhat trong du lieu huan luyen chinh la phu de
   * YouTube. Do la ly do sinh ra "Hay subscribe cho kenh La La School".
   *
   * Tuong tu, viec dua van ban da nhan dien truoc do vao prompt tao ra vong lap
   * tu khuech dai: mot cau bia lot qua se thanh goi y cho cac doan sau, nen cau
   * do lap lai lien tuc.
   */
  private buildPrompt(options: TranscribeOptions) {
    const hints = (options.vocabularyHints ?? [])
      .map((hint) => hint.trim())
      .filter(Boolean)
      .slice(0, 20);

    if (!hints.length) return '';

    // Chi la danh sach ten, khong phai cau van, nen khong tao van phong de
    // Whisper bat chuoc.
    return hints.join(', ').slice(0, MAX_PROMPT_CHARS);
  }

  /**
   * Bo cac segment co dau hieu hallucination (khoang lang, lap ky tu) va cac
   * cau quang cao YouTube ma Whisper hay tu sinh ra khi khong co loi noi.
   */
  private extractConfidentText(payload: GroqTranscriptionResponse) {
    const segments = payload.segments ?? [];

    if (!segments.length) {
      const fallbackText = payload.text?.trim() ?? '';

      return !fallbackText || isNoiseTranscript(fallbackText)
        ? ''
        : fallbackText;
    }

    const keptSegments = segments.filter((segment) => {
      const segmentText = segment.text?.trim();

      if (!segmentText || isNoiseTranscript(segmentText)) return false;

      if ((segment.no_speech_prob ?? 0) > NO_SPEECH_PROB_LIMIT) return false;

      if ((segment.avg_logprob ?? 0) < AVG_LOGPROB_LIMIT) return false;

      if ((segment.compression_ratio ?? 0) > COMPRESSION_RATIO_LIMIT) {
        return false;
      }

      return true;
    });

    if (!keptSegments.length) {
      this.logger.debug(
        `Bo qua ${segments.length} segment vi khong du tin cay hoac la nhieu.`,
      );
    }

    return keptSegments
      .map((segment) => segment.text?.trim())
      .filter(Boolean)
      .join(' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  private validateAudio(file?: MeetingAudioFile) {
    if (!file?.buffer?.length) {
      throw new BadRequestException('Vui long gui tep am thanh');
    }

    if ((file.size ?? file.buffer.length) > MAX_AUDIO_SIZE_BYTES) {
      throw new BadRequestException('Doan am thanh khong duoc vuot qua 25 MB');
    }

    if ((file.size ?? file.buffer.length) < MIN_AUDIO_SIZE_BYTES) {
      throw new BadRequestException('Doan am thanh qua ngan de nhan dien');
    }

    const mimeType = file.mimetype?.split(';')[0].toLowerCase();

    if (!SUPPORTED_AUDIO_TYPES.has(mimeType)) {
      throw new BadRequestException('Dinh dang am thanh khong duoc ho tro');
    }
  }
}
