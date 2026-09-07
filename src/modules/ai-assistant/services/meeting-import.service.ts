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
import { MeetingTranscriptsService } from '../../meetings/services/meeting-transcripts.service';
import { GroqTranscriptionService } from '../../meetings/services/groq-transcription.service';
import { AiMeetingSummaryService } from './ai-meeting-summary.service';
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
    private readonly transcriptsService: MeetingTranscriptsService,
    private readonly transcriptionService: GroqTranscriptionService,
    private readonly summaryService: AiMeetingSummaryService,
  ) {}

  async createJob(userId: string, workspaceId: string, projectId: string, meetingId: string, file?: UploadedMeetingFile) {
    const model = this.getModel();
    const kind = this.validateFile(file);
    file!.originalname = this.normalizeFileName(file!.originalname);
    const job = await model.create({
      workspaceId, projectId, meetingId, createdBy: userId,
      fileName: file!.originalname, mimeType: file!.mimetype,
      fileSize: file!.size, kind, status: 'QUEUED', progress: 5,
      message: 'Đã tiếp nhận tệp, đang chờ xử lý',
    });
    const jobId = String(job._id);
    setImmediate(() => void this.process(jobId, userId, workspaceId, projectId, meetingId, file!).catch((error) => {
      this.logger.error(`Meeting import ${jobId} failed`, error instanceof Error ? error.stack : String(error));
    }));
    return { success: true, message: 'Tệp đã được đưa vào hàng đợi xử lý', data: { job: this.toResponse(job) } };
  }

  async getJob(userId: string, workspaceId: string, projectId: string, meetingId: string, jobId: string) {
    const job = await this.getModel().findOne({ _id: jobId, workspaceId, projectId, meetingId, createdBy: userId }).exec();
    if (!job) throw new NotFoundException('Không tìm thấy tiến trình xử lý tệp');
    return { success: true, message: 'Lấy trạng thái xử lý thành công', data: { job: this.toResponse(job) } };
  }

  async getLatestJob(userId: string, workspaceId: string, projectId: string, meetingId: string) {
    const job = await this.getModel().findOne({ workspaceId, projectId, meetingId, createdBy: userId }).sort({ createdAt: -1 }).exec();
    return { success: true, message: 'Lấy tiến trình gần nhất thành công', data: { job: job ? this.toResponse(job) : null } };
  }

  private async process(jobId: string, userId: string, workspaceId: string, projectId: string, meetingId: string, file: UploadedMeetingFile) {
    try {
      await this.update(jobId, 'EXTRACTING', 15, 'Đang đọc nội dung tệp');
      const kind = this.fileKind(file.originalname);
      const transcript = kind === 'DOCUMENT'
        ? await this.extractDocument(file)
        : await this.transcribeMedia(jobId, file);
      if (transcript.trim().length < 20) throw new BadRequestException('Không tìm thấy đủ nội dung để tóm tắt');

      await this.update(jobId, 'SUMMARIZING', 78, 'Đang tạo transcript và tóm tắt bằng AI');
      const transcriptResult = await this.transcriptsService.saveTranscript(userId, workspaceId, projectId, meetingId, {
        rawTranscript: transcript,
        speakers: [],
      });
      const summaryResult = await this.summaryService.generateMeetingSummary(userId, workspaceId, projectId, meetingId, { forceRegenerate: true });
      await this.getModel().findByIdAndUpdate(jobId, {
        status: 'COMPLETED', progress: 100, message: 'Đã phân tích và tóm tắt xong', error: null,
        transcriptId: transcriptResult.data.transcript.id,
        summaryId: summaryResult.data.summary.id,
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
