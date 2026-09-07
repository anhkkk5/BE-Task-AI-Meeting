import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
  Optional,
  ServiceUnavailableException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as mammoth from 'mammoth';
import pdf from 'pdf-parse';
import iconv from 'iconv-lite';
import { spawn } from 'child_process';
import { mkdtemp, readFile, readdir, rm, writeFile } from 'fs/promises';
import { tmpdir } from 'os';
import { extname, join } from 'path';
import { GroqTranscriptionService } from '../../meetings/services/groq-transcription.service';
import { ProjectAccessService } from '../../projects/services/project-access.service';
import { AiProviderService } from './ai-provider.service';
import { MeetingSummaryInputData } from './ai-meeting-summary-data-builder.service';
import {
  MeetingImportJob,
  MeetingImportJobDocument,
  MeetingImportJobStatus,
} from '../schemas/meeting-import-job.schema';

type UploadedMeetingFile = Express.Multer.File;
const DOCUMENT_EXTENSIONS = new Set(['.pdf', '.docx', '.txt', '.md']);
const MEDIA_EXTENSIONS = new Set(['.mp3', '.wav', '.m4a', '.ogg', '.webm', '.mp4', '.mov', '.mkv']);
const MAX_DOCUMENT_BYTES = 25 * 1024 * 1024;
const MAX_MEDIA_BYTES = 200 * 1024 * 1024;
const DIRECT_TRANSCRIPTION_BYTES = 24 * 1024 * 1024;
const DIRECT_MEDIA_TYPES = new Set([
  'audio/webm', 'video/webm', 'audio/mp4', 'video/mp4', 'audio/mpeg',
  'audio/wav', 'audio/x-wav', 'audio/ogg', 'audio/x-m4a',
]);

@Injectable()
export class MeetingImportService {
  private readonly logger = new Logger(MeetingImportService.name);

  constructor(
    @Optional() @InjectModel(MeetingImportJob.name)
    private readonly jobModel: Model<MeetingImportJobDocument> | null,
    private readonly transcriptionService: GroqTranscriptionService,
    private readonly projectAccessService: ProjectAccessService,
    private readonly aiProviderService: AiProviderService,
  ) {}

  async createJob(userId: string, workspaceId: string, projectId: string, file?: UploadedMeetingFile) {
    const model = this.getModel();
    const project = await this.projectAccessService.assertProjectInWorkspace(projectId, workspaceId);
    const kind = this.validateFile(file);
    file!.originalname = this.normalizeFileName(file!.originalname);
    const job = await model.create({
      workspaceId, projectId, meetingId: null, createdBy: userId,
      fileName: file!.originalname, mimeType: file!.mimetype,
      fileSize: file!.size, kind, status: 'QUEUED', progress: 5,
      message: 'Đã tiếp nhận tệp, đang chờ xử lý',
    });
    const jobId = String(job._id);
    setImmediate(() => void this.process(jobId, userId, workspaceId, projectId, project, file!).catch((error) => {
      this.logger.error(`Meeting import ${jobId} failed`, error instanceof Error ? error.stack : String(error));
    }));
    return { success: true, message: 'Tệp đã được đưa vào hàng đợi xử lý', data: { job: this.toResponse(job) } };
  }

  async getJob(userId: string, workspaceId: string, projectId: string, jobId: string) {
    await this.projectAccessService.assertProjectInWorkspace(projectId, workspaceId);
    const job = await this.getModel().findOne({ _id: jobId, workspaceId, projectId, meetingId: null, createdBy: userId }).exec();
    if (!job) throw new NotFoundException('Không tìm thấy tiến trình xử lý tệp');
    return { success: true, message: 'Lấy trạng thái xử lý thành công', data: { job: this.toResponse(job) } };
  }

  async getLatestJob(userId: string, workspaceId: string, projectId: string) {
    await this.projectAccessService.assertProjectInWorkspace(projectId, workspaceId);
    const job = await this.getModel().findOne({ workspaceId, projectId, meetingId: null, createdBy: userId }).sort({ createdAt: -1 }).exec();
    return { success: true, message: 'Lấy tiến trình gần nhất thành công', data: { job: job ? this.toResponse(job) : null } };
  }

  async listJobs(userId: string, workspaceId: string, projectId: string) {
    await this.projectAccessService.assertProjectInWorkspace(projectId, workspaceId);
    const jobs = await this.getModel().find({ workspaceId, projectId, meetingId: null, createdBy: userId }).sort({ createdAt: -1 }).limit(30).exec();
    return { success: true, message: 'Lấy lịch sử phân tích thành công', data: { items: jobs.map((job) => this.toResponse(job)) } };
  }

  private async process(jobId: string, userId: string, workspaceId: string, projectId: string, project: { id: string; name: string; keyCode: string; status: string }, file: UploadedMeetingFile) {
    try {
      await this.update(jobId, 'EXTRACTING', 15, 'Đang đọc nội dung tệp');
      const kind = this.fileKind(file.originalname);
      const transcript = kind === 'DOCUMENT'
        ? await this.extractDocument(file)
        : await this.transcribeMedia(jobId, file);
      if (transcript.trim().length < 20) throw new BadRequestException('Không tìm thấy đủ nội dung để tóm tắt');

      await this.update(jobId, 'SUMMARIZING', 78, 'Đang tạo bản tóm tắt độc lập bằng AI');
      const now = new Date();
      const inputData: MeetingSummaryInputData = {
        workspace: { id: workspaceId },
        project: { id: project.id, name: project.name, keyCode: project.keyCode, status: project.status },
        meeting: { id: jobId, title: file.originalname, description: 'Tài liệu hoặc media được tải lên để phân tích độc lập', meetingType: 'IMPORTED_CONTENT', meetingDate: now.toISOString().slice(0, 10), status: 'COMPLETED', startTime: null, endTime: null },
        sprint: null, participants: [],
        transcript: { id: jobId, rawTranscript: transcript, normalizedTranscript: transcript, speakers: [] },
        generatedAt: now.toISOString(),
      };
      const prompt = JSON.stringify({
        instruction: 'Tóm tắt nội dung file độc lập. Không suy diễn đây là biên bản của một cuộc họp trong hệ thống. Trả về tiêu đề, tóm tắt, ý chính, quyết định, việc cần làm, rủi ro, câu hỏi mở và bước tiếp theo.',
        fileName: file.originalname,
        transcript,
      });
      const summaryResult = await this.aiProviderService.generateMeetingSummary(prompt, inputData);
      await this.getModel().findByIdAndUpdate(jobId, {
        status: 'COMPLETED', progress: 100, message: 'Đã phân tích và tóm tắt xong', error: null,
        transcript,
        summary: summaryResult.output,
      }).exec();
    } catch (error) {
      await this.getModel().findByIdAndUpdate(jobId, {
        status: 'FAILED', message: 'Xử lý tệp thất bại',
        error: error instanceof Error ? error.message : 'Lỗi không xác định',
      }).exec();
    }
  }

  private async extractDocument(file: UploadedMeetingFile) {
    const extension = extname(file.originalname).toLowerCase();
    if (extension === '.pdf') return (await pdf(file.buffer)).text;
    if (extension === '.docx') return (await mammoth.extractRawText({ buffer: file.buffer })).value;
    return file.buffer.toString('utf8');
  }

  private async transcribeMedia(jobId: string, file: UploadedMeetingFile) {
    await this.update(jobId, 'TRANSCRIBING', 30, 'Đang chuyển giọng nói thành văn bản');
    const mimeType = file.mimetype.split(';')[0].toLowerCase();
    if (file.size <= DIRECT_TRANSCRIPTION_BYTES && DIRECT_MEDIA_TYPES.has(mimeType)) {
      return (await this.transcriptionService.transcribe(file)).text;
    }
    const chunks = await this.splitMedia(file);
    try {
      const texts: string[] = [];
      for (let index = 0; index < chunks.files.length; index += 1) {
        const buffer = await readFile(chunks.files[index]);
        const result = await this.transcriptionService.transcribe({
          buffer, size: buffer.length, mimetype: 'audio/mpeg', originalname: `part-${index + 1}.mp3`,
        });
        if (result.text) texts.push(result.text);
        await this.update(jobId, 'TRANSCRIBING', 30 + Math.round(((index + 1) / chunks.files.length) * 42), `Đang phiên âm đoạn ${index + 1}/${chunks.files.length}`);
      }
      return texts.join('\n\n');
    } finally { await rm(chunks.directory, { recursive: true, force: true }); }
  }

  private async splitMedia(file: UploadedMeetingFile) {
    const directory = await mkdtemp(join(tmpdir(), 'agileflow-meeting-'));
    const input = join(directory, `input${extname(file.originalname) || '.mp4'}`);
    await writeFile(input, file.buffer);
    await new Promise<void>((resolve, reject) => {
      const command = spawn(process.env.FFMPEG_PATH || 'ffmpeg', [
        '-hide_banner', '-loglevel', 'error', '-i', input, '-vn', '-ac', '1', '-ar', '16000',
        '-f', 'segment', '-segment_time', '600', '-b:a', '48k', join(directory, 'part-%03d.mp3'),
      ], { windowsHide: true });
      let stderr = '';
      command.stderr.on('data', (data) => { stderr += String(data); });
      command.on('error', () => reject(new ServiceUnavailableException('Máy chủ chưa cài FFmpeg để xử lý video dài')));
      command.on('close', (code) => code === 0 ? resolve() : reject(new BadRequestException(stderr || 'Không thể tách âm thanh từ video')));
    });
    const files = (await readdir(directory)).filter((name) => name.startsWith('part-') && name.endsWith('.mp3')).sort().map((name) => join(directory, name));
    if (!files.length) { await rm(directory, { recursive: true, force: true }); throw new BadRequestException('Video không chứa âm thanh có thể xử lý'); }
    return { directory, files };
  }

  private validateFile(file?: UploadedMeetingFile) {
    if (!file?.buffer?.length) throw new BadRequestException('Vui lòng chọn tệp cuộc họp');
    const kind = this.fileKind(file.originalname);
    const limit = kind === 'DOCUMENT' ? MAX_DOCUMENT_BYTES : MAX_MEDIA_BYTES;
    if (file.size > limit) throw new BadRequestException(`Tệp vượt quá giới hạn ${limit / 1024 / 1024} MB`);
    return kind;
  }

  private fileKind(name: string): 'DOCUMENT' | 'MEDIA' {
    const extension = extname(name).toLowerCase();
    if (DOCUMENT_EXTENSIONS.has(extension)) return 'DOCUMENT';
    if (MEDIA_EXTENSIONS.has(extension)) return 'MEDIA';
    throw new BadRequestException('Chỉ hỗ trợ PDF, DOCX, TXT, MD, MP3, WAV, M4A, OGG, WEBM, MP4, MOV và MKV');
  }

  private normalizeFileName(name: string) {
    // Trinh duyet gui ten UTF-8, nhung Busboy co the doc header multipart theo
    // Windows-1252. Ma hoa nguoc ve byte roi giai ma UTF-8 de giu dung tieng Viet.
    if (!/[\u0080-\uFFFF]/.test(name)) return name;
    const decoded = iconv.decode(iconv.encode(name, 'windows-1252'), 'utf8');
    return decoded.includes('\uFFFD') ? name : decoded;
  }

  private update(id: string, status: MeetingImportJobStatus, progress: number, message: string) {
    return this.getModel().findByIdAndUpdate(id, { status, progress, message }).exec();
  }
  private getModel() {
    if (!this.jobModel) throw new ServiceUnavailableException('MongoDB chưa được cấu hình cho xử lý tệp');
    return this.jobModel;
  }
  private toResponse(job: MeetingImportJobDocument) {
    const item = job.toObject();
    return { ...item, id: String(job._id), _id: undefined, __v: undefined };
  }
}
