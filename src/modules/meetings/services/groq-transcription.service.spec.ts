import {
  BadRequestException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { GroqTranscriptionService } from './groq-transcription.service';

/** Doan am thanh gia lap phai vuot nguong toi thieu de khong bi chan som. */
function createAudioBuffer() {
  return Buffer.alloc(8 * 1024, 1);
}

describe('GroqTranscriptionService', () => {
  const originalEnv = process.env;
  let service: GroqTranscriptionService;

  beforeEach(() => {
    process.env = {
      ...originalEnv,
      GROQ_API_KEY: 'test-key',
      GROQ_TRANSCRIPTION_MODEL: 'whisper-large-v3-turbo',
    };
    service = new GroqTranscriptionService();
  });

  afterEach(() => {
    process.env = originalEnv;
    jest.restoreAllMocks();
  });

  it('sends the audio file to Groq transcription API', async () => {
    const fetchMock = jest.spyOn(global, 'fetch').mockResolvedValue(
      new Response(
        JSON.stringify({
          text: 'Hom nay em da hoan thanh API.',
          language: 'vi',
          duration: 12,
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } },
      ),
    );

    const result = await service.transcribe({
      buffer: createAudioBuffer(),
      mimetype: 'audio/webm',
      originalname: 'chunk.webm',
    });

    expect(fetchMock).toHaveBeenCalledWith(
      'https://api.groq.com/openai/v1/audio/transcriptions',
      expect.objectContaining({ method: 'POST' }),
    );
    expect(result.text).toBe('Hom nay em da hoan thanh API.');
  });

  it('drops advertisement style hallucinations', async () => {
    jest.spyOn(global, 'fetch').mockResolvedValue(
      new Response(
        JSON.stringify({
          text: 'Hãy đăng ký kênh để ủng hộ kênh của mình nhé!',
          language: 'vi',
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } },
      ),
    );

    const result = await service.transcribe({
      buffer: createAudioBuffer(),
      mimetype: 'audio/webm',
    });

    expect(result.text).toBe('');
  });

  it('drops low confidence segments', async () => {
    jest.spyOn(global, 'fetch').mockResolvedValue(
      new Response(
        JSON.stringify({
          text: 'Cam on cac ban da theo doi. Em da xong task API.',
          segments: [
            {
              text: 'Cam on cac ban da theo doi.',
              no_speech_prob: 0.9,
              avg_logprob: -0.2,
              compression_ratio: 1.2,
            },
            {
              text: 'Em da xong task API.',
              no_speech_prob: 0.05,
              avg_logprob: -0.2,
              compression_ratio: 1.2,
            },
          ],
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } },
      ),
    );

    const result = await service.transcribe({
      buffer: createAudioBuffer(),
      mimetype: 'audio/webm',
    });

    expect(result.text).toBe('Em da xong task API.');
  });

  it('passes participant names as vocabulary hints', async () => {
    const fetchMock = jest.spyOn(global, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ text: 'Toi ten Nguyen Tuan Anh.' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    );

    await service.transcribe(
      { buffer: createAudioBuffer(), mimetype: 'audio/webm' },
      { vocabularyHints: ['Nguyễn Tuấn Anh'] },
    );

    const requestInit = fetchMock.mock.calls[0][1] as { body: FormData };
    expect(String(requestInit.body.get('prompt'))).toContain('Nguyễn Tuấn Anh');
  });

  it('rejects unsupported files before calling Groq', async () => {
    const fetchMock = jest.spyOn(global, 'fetch');

    await expect(
      service.transcribe({
        buffer: createAudioBuffer(),
        mimetype: 'text/plain',
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('reports missing Groq credentials clearly', async () => {
    delete process.env.GROQ_API_KEY;
    delete process.env.AI_API_KEY;

    await expect(
      service.transcribe({
        buffer: createAudioBuffer(),
        mimetype: 'audio/webm',
      }),
    ).rejects.toBeInstanceOf(ServiceUnavailableException);
  });
});
