"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var MeetingImportService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MeetingImportService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mammoth = __importStar(require("mammoth"));
const pdf_parse_1 = __importDefault(require("pdf-parse"));
const iconv_lite_1 = __importDefault(require("iconv-lite"));
const child_process_1 = require("child_process");
const promises_1 = require("fs/promises");
const os_1 = require("os");
const path_1 = require("path");
const meeting_transcripts_service_1 = require("../../meetings/services/meeting-transcripts.service");
const groq_transcription_service_1 = require("../../meetings/services/groq-transcription.service");
const ai_meeting_summary_service_1 = require("./ai-meeting-summary.service");
const meeting_import_job_schema_1 = require("../schemas/meeting-import-job.schema");
const DOCUMENT_EXTENSIONS = new Set(['.pdf', '.docx', '.txt', '.md']);
const MEDIA_EXTENSIONS = new Set(['.mp3', '.wav', '.m4a', '.ogg', '.webm', '.mp4', '.mov', '.mkv']);
const MAX_DOCUMENT_BYTES = 25 * 1024 * 1024;
const MAX_MEDIA_BYTES = 200 * 1024 * 1024;
const DIRECT_TRANSCRIPTION_BYTES = 24 * 1024 * 1024;
const DIRECT_MEDIA_TYPES = new Set([
    'audio/webm', 'video/webm', 'audio/mp4', 'video/mp4', 'audio/mpeg',
    'audio/wav', 'audio/x-wav', 'audio/ogg', 'audio/x-m4a',
]);
let MeetingImportService = MeetingImportService_1 = class MeetingImportService {
    jobModel;
    transcriptsService;
    transcriptionService;
    summaryService;
    logger = new common_1.Logger(MeetingImportService_1.name);
    constructor(jobModel, transcriptsService, transcriptionService, summaryService) {
        this.jobModel = jobModel;
        this.transcriptsService = transcriptsService;
        this.transcriptionService = transcriptionService;
        this.summaryService = summaryService;
    }
    async createJob(userId, workspaceId, projectId, meetingId, file) {
        const model = this.getModel();
        const kind = this.validateFile(file);
        file.originalname = this.normalizeFileName(file.originalname);
        const job = await model.create({
            workspaceId, projectId, meetingId, createdBy: userId,
            fileName: file.originalname, mimeType: file.mimetype,
            fileSize: file.size, kind, status: 'QUEUED', progress: 5,
            message: 'Đã tiếp nhận tệp, đang chờ xử lý',
        });
        const jobId = String(job._id);
        setImmediate(() => void this.process(jobId, userId, workspaceId, projectId, meetingId, file).catch((error) => {
            this.logger.error(`Meeting import ${jobId} failed`, error instanceof Error ? error.stack : String(error));
        }));
        return { success: true, message: 'Tệp đã được đưa vào hàng đợi xử lý', data: { job: this.toResponse(job) } };
    }
    async getJob(userId, workspaceId, projectId, meetingId, jobId) {
        const job = await this.getModel().findOne({ _id: jobId, workspaceId, projectId, meetingId, createdBy: userId }).exec();
        if (!job)
            throw new common_1.NotFoundException('Không tìm thấy tiến trình xử lý tệp');
        return { success: true, message: 'Lấy trạng thái xử lý thành công', data: { job: this.toResponse(job) } };
    }
    async getLatestJob(userId, workspaceId, projectId, meetingId) {
        const job = await this.getModel().findOne({ workspaceId, projectId, meetingId, createdBy: userId }).sort({ createdAt: -1 }).exec();
        return { success: true, message: 'Lấy tiến trình gần nhất thành công', data: { job: job ? this.toResponse(job) : null } };
    }
    async process(jobId, userId, workspaceId, projectId, meetingId, file) {
        try {
            await this.update(jobId, 'EXTRACTING', 15, 'Đang đọc nội dung tệp');
            const kind = this.fileKind(file.originalname);
            const transcript = kind === 'DOCUMENT'
                ? await this.extractDocument(file)
                : await this.transcribeMedia(jobId, file);
            if (transcript.trim().length < 20)
                throw new common_1.BadRequestException('Không tìm thấy đủ nội dung để tóm tắt');
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
        }
        catch (error) {
            await this.getModel().findByIdAndUpdate(jobId, {
                status: 'FAILED', message: 'Xử lý tệp thất bại',
                error: error instanceof Error ? error.message : 'Lỗi không xác định',
            }).exec();
        }
    }
    async extractDocument(file) {
        const extension = (0, path_1.extname)(file.originalname).toLowerCase();
        if (extension === '.pdf')
            return (await (0, pdf_parse_1.default)(file.buffer)).text;
        if (extension === '.docx')
            return (await mammoth.extractRawText({ buffer: file.buffer })).value;
        return file.buffer.toString('utf8');
    }
    async transcribeMedia(jobId, file) {
        await this.update(jobId, 'TRANSCRIBING', 30, 'Đang chuyển giọng nói thành văn bản');
        const mimeType = file.mimetype.split(';')[0].toLowerCase();
        if (file.size <= DIRECT_TRANSCRIPTION_BYTES && DIRECT_MEDIA_TYPES.has(mimeType)) {
            return (await this.transcriptionService.transcribe(file)).text;
        }
        const chunks = await this.splitMedia(file);
        try {
            const texts = [];
            for (let index = 0; index < chunks.files.length; index += 1) {
                const buffer = await (0, promises_1.readFile)(chunks.files[index]);
                const result = await this.transcriptionService.transcribe({
                    buffer, size: buffer.length, mimetype: 'audio/mpeg', originalname: `part-${index + 1}.mp3`,
                });
                if (result.text)
                    texts.push(result.text);
                await this.update(jobId, 'TRANSCRIBING', 30 + Math.round(((index + 1) / chunks.files.length) * 42), `Đang phiên âm đoạn ${index + 1}/${chunks.files.length}`);
            }
            return texts.join('\n\n');
        }
        finally {
            await (0, promises_1.rm)(chunks.directory, { recursive: true, force: true });
        }
    }
    async splitMedia(file) {
        const directory = await (0, promises_1.mkdtemp)((0, path_1.join)((0, os_1.tmpdir)(), 'agileflow-meeting-'));
        const input = (0, path_1.join)(directory, `input${(0, path_1.extname)(file.originalname) || '.mp4'}`);
        await (0, promises_1.writeFile)(input, file.buffer);
        await new Promise((resolve, reject) => {
            const command = (0, child_process_1.spawn)(process.env.FFMPEG_PATH || 'ffmpeg', [
                '-hide_banner', '-loglevel', 'error', '-i', input, '-vn', '-ac', '1', '-ar', '16000',
                '-f', 'segment', '-segment_time', '600', '-b:a', '48k', (0, path_1.join)(directory, 'part-%03d.mp3'),
            ], { windowsHide: true });
            let stderr = '';
            command.stderr.on('data', (data) => { stderr += String(data); });
            command.on('error', () => reject(new common_1.ServiceUnavailableException('Máy chủ chưa cài FFmpeg để xử lý video dài')));
            command.on('close', (code) => code === 0 ? resolve() : reject(new common_1.BadRequestException(stderr || 'Không thể tách âm thanh từ video')));
        });
        const files = (await (0, promises_1.readdir)(directory)).filter((name) => name.startsWith('part-') && name.endsWith('.mp3')).sort().map((name) => (0, path_1.join)(directory, name));
        if (!files.length) {
            await (0, promises_1.rm)(directory, { recursive: true, force: true });
            throw new common_1.BadRequestException('Video không chứa âm thanh có thể xử lý');
        }
        return { directory, files };
    }
    validateFile(file) {
        if (!file?.buffer?.length)
            throw new common_1.BadRequestException('Vui lòng chọn tệp cuộc họp');
        const kind = this.fileKind(file.originalname);
        const limit = kind === 'DOCUMENT' ? MAX_DOCUMENT_BYTES : MAX_MEDIA_BYTES;
        if (file.size > limit)
            throw new common_1.BadRequestException(`Tệp vượt quá giới hạn ${limit / 1024 / 1024} MB`);
        return kind;
    }
    fileKind(name) {
        const extension = (0, path_1.extname)(name).toLowerCase();
        if (DOCUMENT_EXTENSIONS.has(extension))
            return 'DOCUMENT';
        if (MEDIA_EXTENSIONS.has(extension))
            return 'MEDIA';
        throw new common_1.BadRequestException('Chỉ hỗ trợ PDF, DOCX, TXT, MD, MP3, WAV, M4A, OGG, WEBM, MP4, MOV và MKV');
    }
    normalizeFileName(name) {
        if (!/[\u0080-\uFFFF]/.test(name))
            return name;
        const decoded = iconv_lite_1.default.decode(iconv_lite_1.default.encode(name, 'windows-1252'), 'utf8');
        return decoded.includes('\uFFFD') ? name : decoded;
    }
    update(id, status, progress, message) {
        return this.getModel().findByIdAndUpdate(id, { status, progress, message }).exec();
    }
    getModel() {
        if (!this.jobModel)
            throw new common_1.ServiceUnavailableException('MongoDB chưa được cấu hình cho xử lý tệp');
        return this.jobModel;
    }
    toResponse(job) {
        const item = job.toObject();
        return { ...item, id: String(job._id), _id: undefined, __v: undefined };
    }
};
exports.MeetingImportService = MeetingImportService;
exports.MeetingImportService = MeetingImportService = MeetingImportService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Optional)()),
    __param(0, (0, mongoose_1.InjectModel)(meeting_import_job_schema_1.MeetingImportJob.name)),
    __metadata("design:paramtypes", [Object, meeting_transcripts_service_1.MeetingTranscriptsService,
        groq_transcription_service_1.GroqTranscriptionService,
        ai_meeting_summary_service_1.AiMeetingSummaryService])
], MeetingImportService);
//# sourceMappingURL=meeting-import.service.js.map