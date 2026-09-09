import {
  BadRequestException,
  NotFoundException,
  PayloadTooLargeException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { MeetingImportService } from './meeting-import.service';

describe('MeetingImportService', () => {
  const project = {
    id: 'project-id',
    name: 'Project AI',
    keyCode: 'AI',
    status: 'ACTIVE',
  };
  const queuedJob = {
    _id: 'job-id',
    workspaceId: 'workspace-id',
    projectId: 'project-id',
    meetingId: null,
    createdBy: 'owner-id',
    fileName: 'hop-nhom.txt',
    mimeType: 'text/plain',
    fileSize: 64,
    kind: 'DOCUMENT',
    status: 'QUEUED',
    progress: 5,
    message: 'Đã tiếp nhận tệp, đang chờ xử lý',
    toObject() {
      return { ...this };
    },
  };

  const createMocks = () => {
    const exec = jest.fn().mockResolvedValue(null);
    const jobModel = {
      create: jest.fn().mockResolvedValue(queuedJob),
      findByIdAndUpdate: jest.fn().mockReturnValue({ exec }),
      findOne: jest.fn(),
    };
    const transcriptionService = {
      transcribe: jest.fn().mockResolvedValue({ text: 'Nội dung phiên âm hợp lệ của cuộc họp.' }),
    };
    const projectAccessService = {
      assertProjectInWorkspace: jest.fn().mockResolvedValue(project),
    };
    const aiProviderService = {
      generateMeetingSummary: jest.fn().mockResolvedValue({
        model: 'mock-meeting-summary',
        output: {
          title: 'Tóm tắt',
          summary: 'Nội dung tóm tắt',
          keyPoints: [],
          decisions: [],
          actionItems: [],
          risks: [],
          openQuestions: [],
          nextSteps: [],
        },
      }),
    };
    const service = new MeetingImportService(
      jobModel as never,
      transcriptionService as never,
      projectAccessService as never,
      aiProviderService as never,
    );
    return {
      service,
      jobModel,
      transcriptionService,
      projectAccessService,
      aiProviderService,
      exec,
    };
  };

  const textFile = (overrides: Partial<Express.Multer.File> = {}) =>
    ({
      buffer: Buffer.from('Nội dung cuộc họp đủ dài để hệ thống tạo bản tóm tắt.'),
      size: 64,
      mimetype: 'text/plain',
      originalname: 'hop-nhom.txt',
      ...overrides,
    }) as Express.Multer.File;

  afterEach(() => jest.restoreAllMocks());

  it('creates an isolated queued analysis job for a valid document', async () => {
    const { service, jobModel } = createMocks();
    jest
      .spyOn(global, 'setImmediate')
      .mockImplementation(() => ({}) as NodeJS.Immediate);

    const result = await service.createJob(
      'owner-id',
      'workspace-id',
      'project-id',
      textFile(),
    );

    expect(jobModel.create).toHaveBeenCalledWith(
      expect.objectContaining({
        meetingId: null,
        createdBy: 'owner-id',
        kind: 'DOCUMENT',
        status: 'QUEUED',
      }),
    );
    expect(result.success).toBe(true);
    expect(result.data.job.id).toBe('job-id');
  });

  it('rejects a missing or unsupported file with 400', async () => {
    const { service } = createMocks();

    await expect(
      service.createJob('owner-id', 'workspace-id', 'project-id'),
    ).rejects.toBeInstanceOf(BadRequestException);
    await expect(
      service.createJob(
        'owner-id',
        'workspace-id',
        'project-id',
        textFile({ originalname: 'malware.exe' }),
      ),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('rejects an oversized document with 413', async () => {
    const { service } = createMocks();

    await expect(
      service.createJob(
        'owner-id',
        'workspace-id',
        'project-id',
        textFile({ size: 25 * 1024 * 1024 + 1 }),
      ),
    ).rejects.toBeInstanceOf(PayloadTooLargeException);
  });

  it('extracts and summarizes a document without updating a meeting', async () => {
    const { service, jobModel, aiProviderService } = createMocks();

    await (service as unknown as { process: (...args: unknown[]) => Promise<void> }).process(
      'job-id',
      'owner-id',
      'workspace-id',
      'project-id',
      project,
      textFile(),
    );

    expect(aiProviderService.generateMeetingSummary).toHaveBeenCalledWith(
      expect.stringContaining('Không suy diễn đây là biên bản'),
      expect.objectContaining({
        meeting: expect.objectContaining({
          id: 'job-id',
          meetingType: 'IMPORTED_CONTENT',
        }),
      }),
    );
    expect(jobModel.findByIdAndUpdate).toHaveBeenLastCalledWith(
      'job-id',
      expect.objectContaining({ status: 'COMPLETED', progress: 100 }),
    );
  });

  it('marks the job as failed when extracted content is insufficient', async () => {
    const { service, jobModel, aiProviderService } = createMocks();

    await (service as unknown as { process: (...args: unknown[]) => Promise<void> }).process(
      'job-id',
      'owner-id',
      'workspace-id',
      'project-id',
      project,
      textFile({ buffer: Buffer.from('ngắn'), size: 5 }),
    );

    expect(aiProviderService.generateMeetingSummary).not.toHaveBeenCalled();
    expect(jobModel.findByIdAndUpdate).toHaveBeenLastCalledWith(
      'job-id',
      expect.objectContaining({
        status: 'FAILED',
        error: 'Không tìm thấy đủ nội dung để tóm tắt',
      }),
    );
  });

  it('returns 404 for another user job and 503 when MongoDB is disabled', async () => {
    const { service, jobModel } = createMocks();
    jobModel.findOne.mockReturnValue({
      exec: jest.fn().mockResolvedValue(null),
    });

    await expect(
      service.getJob('other-user', 'workspace-id', 'project-id', 'job-id'),
    ).rejects.toBeInstanceOf(NotFoundException);

    const disabledService = new MeetingImportService(
      null,
      {} as never,
      {} as never,
      {} as never,
    );
    await expect(
      disabledService.createJob(
        'owner-id',
        'workspace-id',
        'project-id',
        textFile(),
      ),
    ).rejects.toBeInstanceOf(ServiceUnavailableException);
  });
});
