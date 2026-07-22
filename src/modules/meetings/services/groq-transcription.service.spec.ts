import {
  BadRequestException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { GroqTranscriptionService } from './groq-transcription.service';

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
      buffer: Buffer.from('audio-data'),
      mimetype: 'audio/webm',
      originalname: 'chunk.webm',
    });

    expect(fetchMock).toHaveBeenCalledWith(
      'https://api.groq.com/openai/v1/audio/transcriptions',
      expect.objectContaining({ method: 'POST' }),
    );
    expect(result.text).toBe('Hom nay em da hoan thanh API.');
  });

  it('rejects unsupported files before calling Groq', async () => {
    const fetchMock = jest.spyOn(global, 'fetch');

    await expect(
      service.transcribe({
        buffer: Buffer.from('not-audio'),
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
        buffer: Buffer.from('audio-data'),
        mimetype: 'audio/webm',
      }),
    ).rejects.toBeInstanceOf(ServiceUnavailableException);
  });
});
