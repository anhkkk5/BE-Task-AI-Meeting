"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var MeetingTranscriptsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MeetingTranscriptsService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const project_access_service_1 = require("../../projects/services/project-access.service");
const workspace_access_service_1 = require("../../workspaces/services/workspace-access.service");
const transcript_noise_util_1 = require("../../../common/utils/transcript-noise.util");
const meeting_transcript_schema_1 = require("../schemas/meeting-transcript.schema");
const meetings_repository_1 = require("../repositories/meetings.repository");
const meeting_participants_repository_1 = require("../repositories/meeting-participants.repository");
const meeting_access_service_1 = require("./meeting-access.service");
const groq_transcription_service_1 = require("./groq-transcription.service");
let MeetingTranscriptsService = MeetingTranscriptsService_1 = class MeetingTranscriptsService {
    transcriptModel;
    meetingsRepository;
    meetingParticipantsRepository;
    meetingAccessService;
    workspaceAccessService;
    projectAccessService;
    groqTranscriptionService;
    logger = new common_1.Logger(MeetingTranscriptsService_1.name);
    constructor(transcriptModel, meetingsRepository, meetingParticipantsRepository, meetingAccessService, workspaceAccessService, projectAccessService, groqTranscriptionService) {
        this.transcriptModel = transcriptModel;
        this.meetingsRepository = meetingsRepository;
        this.meetingParticipantsRepository = meetingParticipantsRepository;
        this.meetingAccessService = meetingAccessService;
        this.workspaceAccessService = workspaceAccessService;
        this.projectAccessService = projectAccessService;
        this.groqTranscriptionService = groqTranscriptionService;
    }
    async saveTranscript(currentUserId, workspaceId, projectId, meetingId, dto) {
        const transcriptModel = this.getTranscriptModel();
        await this.workspaceAccessService.assertWorkspaceActive(workspaceId);
        await this.meetingAccessService.assertUserCanManageMeeting(currentUserId, workspaceId);
        await this.projectAccessService.assertProjectInWorkspace(projectId, workspaceId);
        const meeting = await this.meetingAccessService.assertMeetingInProject(meetingId, projectId);
        this.meetingAccessService.assertMeetingEditable(meeting);
        const payload = {
            meetingId,
            workspaceId,
            projectId,
            sprintId: meeting.sprintId,
            rawTranscript: dto.rawTranscript.trim(),
            speakers: dto.speakers?.map((speaker) => ({
                speakerName: speaker.speakerName?.trim() || undefined,
                text: speaker.text.trim(),
                userId: speaker.userId,
            })) ?? [],
            liveSegments: [],
            createdBy: currentUserId,
        };
        let transcript = null;
        if (meeting.mongoTranscriptId) {
            transcript = await transcriptModel
                .findByIdAndUpdate(meeting.mongoTranscriptId, payload, {
                new: true,
            })
                .exec();
        }
        if (!transcript) {
            transcript = await transcriptModel.create(payload);
        }
        const transcriptId = this.getTranscriptId(transcript);
        if (meeting.mongoTranscriptId !== transcriptId) {
            await this.meetingsRepository.updateTranscriptId(meeting, transcriptId);
        }
        return {
            success: true,
            message: 'Save meeting transcript successfully',
            data: {
                transcript: this.toTranscriptResponse(transcript),
            },
        };
    }
    async getTranscript(currentUserId, workspaceId, projectId, meetingId) {
        const transcriptModel = this.getTranscriptModel();
        await this.meetingAccessService.assertUserCanViewMeeting(currentUserId, workspaceId);
        await this.projectAccessService.assertProjectInWorkspace(projectId, workspaceId);
        const meeting = await this.meetingAccessService.assertMeetingInProject(meetingId, projectId);
        if (!meeting.mongoTranscriptId) {
            throw new common_1.NotFoundException('Meeting transcript not found');
        }
        const transcript = await transcriptModel
            .findById(meeting.mongoTranscriptId)
            .exec();
        if (!transcript) {
            throw new common_1.NotFoundException('Meeting transcript not found');
        }
        return {
            success: true,
            message: 'Get meeting transcript successfully',
            data: {
                transcript: this.toTranscriptResponse(transcript),
            },
        };
    }
    async appendLiveSegment(currentUserId, workspaceId, projectId, meetingId, dto) {
        const { meeting, speakerName } = await this.getAppendContext(currentUserId, workspaceId, projectId, meetingId);
        const segment = {
            userId: currentUserId,
            speakerName,
            text: dto.text.trim(),
            startedAt: dto.startedAt ? new Date(dto.startedAt) : new Date(),
            endedAt: dto.endedAt ? new Date(dto.endedAt) : null,
            confidence: dto.confidence ?? null,
            source: dto.source?.trim() || 'browser-speech',
        };
        const transcript = await this.persistSegment(meeting, currentUserId, workspaceId, projectId, segment);
        return {
            success: true,
            message: 'Append live transcript segment successfully',
            data: {
                segment,
                transcript: this.toTranscriptResponse(transcript),
            },
        };
    }
    async appendAudioChunk(currentUserId, workspaceId, projectId, meetingId, audio, dto) {
        const { meeting, speakerName, participantNames } = await this.getAppendContext(currentUserId, workspaceId, projectId, meetingId);
        const transcriptModel = this.getTranscriptModel();
        let existingTranscript = null;
        if (meeting.mongoTranscriptId) {
            existingTranscript = await transcriptModel
                .findById(meeting.mongoTranscriptId)
                .exec();
            const existingSegment = existingTranscript?.liveSegments?.find((segment) => segment.userId === currentUserId && segment.chunkId === dto.chunkId);
            if (existingSegment && existingTranscript) {
                return {
                    success: true,
                    message: 'Doan am thanh da duoc xu ly truoc do',
                    data: {
                        segment: existingSegment,
                        transcript: this.toTranscriptResponse(existingTranscript),
                    },
                };
            }
        }
        const transcription = await this.groqTranscriptionService.transcribe(audio, { vocabularyHints: participantNames });
        if (!transcription.text || (0, transcript_noise_util_1.isNoiseTranscript)(transcription.text)) {
            this.logger.warn(transcription.text
                ? `Bo doan ${dto.chunkId} vi bi coi la nhieu: "${transcription.text}"`
                : `Bo doan ${dto.chunkId} vi Whisper khong nhan ra loi noi nao`);
            const currentTranscript = existingTranscript ??
                (meeting.mongoTranscriptId
                    ? await transcriptModel.findById(meeting.mongoTranscriptId).exec()
                    : null);
            return {
                success: true,
                message: 'Doan am thanh khong co loi noi nen duoc bo qua',
                data: {
                    segment: null,
                    transcript: currentTranscript
                        ? this.toTranscriptResponse(currentTranscript)
                        : null,
                },
            };
        }
        const segment = {
            chunkId: dto.chunkId,
            userId: currentUserId,
            speakerName,
            text: transcription.text,
            startedAt: dto.startedAt ? new Date(dto.startedAt) : new Date(),
            endedAt: dto.endedAt ? new Date(dto.endedAt) : null,
            confidence: null,
            source: `groq:${transcription.model}`,
        };
        const transcript = await this.persistSegment(meeting, currentUserId, workspaceId, projectId, segment, existingTranscript);
        return {
            success: true,
            message: 'Chuyen am thanh thanh transcript thanh cong',
            data: {
                segment,
                transcript: this.toTranscriptResponse(transcript),
            },
        };
    }
    async findTranscriptForMeeting(meeting) {
        const transcriptModel = this.getTranscriptModel();
        if (!meeting.mongoTranscriptId) {
            throw new common_1.NotFoundException('Meeting transcript not found');
        }
        const transcript = await transcriptModel
            .findById(meeting.mongoTranscriptId)
            .exec();
        if (!transcript) {
            throw new common_1.NotFoundException('Meeting transcript not found');
        }
        return transcript;
    }
    getTranscriptModel() {
        if (!this.transcriptModel) {
            throw new common_1.ServiceUnavailableException('MongoDB is disabled');
        }
        return this.transcriptModel;
    }
    async getAppendContext(currentUserId, workspaceId, projectId, meetingId) {
        this.getTranscriptModel();
        await this.meetingAccessService.assertUserCanViewMeeting(currentUserId, workspaceId);
        await this.projectAccessService.assertProjectInWorkspace(projectId, workspaceId);
        const meeting = await this.meetingAccessService.assertMeetingInProject(meetingId, projectId);
        if (meeting.workspaceId !== workspaceId) {
            throw new common_1.NotFoundException('Meeting transcript not found');
        }
        const participants = await this.meetingParticipantsRepository.findByMeeting(meetingId);
        const participant = participants.find((item) => item.userId === currentUserId);
        return {
            meeting,
            speakerName: this.resolveSpeakerName(participant),
            participantNames: participants
                .map((item) => item.user?.fullName?.trim())
                .filter((name) => Boolean(name)),
        };
    }
    resolveSpeakerName(participant) {
        const fullName = participant?.user?.fullName?.trim();
        if (fullName)
            return fullName;
        const email = participant?.user?.email?.trim();
        if (email)
            return email.split('@')[0];
        return 'Thành viên';
    }
    async persistSegment(meeting, currentUserId, workspaceId, projectId, segment, loadedTranscript = null) {
        const transcriptModel = this.getTranscriptModel();
        let transcript = loadedTranscript;
        if (!transcript && meeting.mongoTranscriptId) {
            transcript = await transcriptModel
                .findById(meeting.mongoTranscriptId)
                .exec();
        }
        if (!transcript) {
            transcript = await transcriptModel.create({
                meetingId: meeting.id,
                workspaceId,
                projectId,
                sprintId: meeting.sprintId,
                rawTranscript: this.buildRawTranscript([segment]),
                speakers: this.buildSpeakersFromSegments([segment]),
                liveSegments: [segment],
                createdBy: currentUserId,
            });
            await this.meetingsRepository.updateTranscriptId(meeting, this.getTranscriptId(transcript));
        }
        else {
            transcript.liveSegments = [
                ...(transcript.liveSegments ?? []).filter((item) => !(0, transcript_noise_util_1.isNoiseTranscript)(item.text)),
                segment,
            ].slice(-1000);
            transcript.speakers = this.buildSpeakersFromSegments(transcript.liveSegments);
            transcript.rawTranscript = this.buildRawTranscript(transcript.liveSegments);
            await transcript.save();
        }
        return transcript;
    }
    getTranscriptId(transcript) {
        return transcript._id.toString();
    }
    toTranscriptResponse(transcript) {
        const stampedTranscript = transcript;
        const cleanSegments = (transcript.liveSegments ?? []).filter((segment) => !(0, transcript_noise_util_1.isNoiseTranscript)(segment.text));
        return {
            id: this.getTranscriptId(transcript),
            meetingId: transcript.meetingId,
            workspaceId: transcript.workspaceId,
            projectId: transcript.projectId,
            sprintId: transcript.sprintId ?? null,
            rawTranscript: (0, transcript_noise_util_1.cleanTranscriptLines)((transcript.rawTranscript ?? '').split(/\r?\n/)).join('\n'),
            speakers: (transcript.speakers ?? []).filter((speaker) => !(0, transcript_noise_util_1.isNoiseTranscript)(speaker.text)),
            liveSegments: cleanSegments,
            createdBy: transcript.createdBy,
            createdAt: stampedTranscript.createdAt,
            updatedAt: stampedTranscript.updatedAt,
        };
    }
    buildSpeakerTurns(segments) {
        const sortedSegments = segments
            .slice()
            .sort((left, right) => new Date(left.startedAt).getTime() -
            new Date(right.startedAt).getTime())
            .filter((segment) => !(0, transcript_noise_util_1.isNoiseTranscript)(segment.text));
        const turns = [];
        for (const segment of sortedSegments) {
            const spokenText = segment.text.trim();
            const lastTurn = turns[turns.length - 1];
            if (lastTurn && lastTurn.userId === segment.userId) {
                const normalizedNew = (0, transcript_noise_util_1.normalizeTranscriptText)(spokenText);
                const normalizedLast = (0, transcript_noise_util_1.normalizeTranscriptText)(lastTurn.text);
                if (normalizedNew &&
                    (normalizedLast === normalizedNew ||
                        normalizedLast.endsWith(normalizedNew))) {
                    continue;
                }
                lastTurn.text = `${lastTurn.text} ${spokenText}`.trim();
                continue;
            }
            turns.push({
                userId: segment.userId,
                speakerName: segment.speakerName,
                text: spokenText,
            });
        }
        return turns;
    }
    buildSpeakersFromSegments(segments) {
        return this.buildSpeakerTurns(segments);
    }
    buildRawTranscript(segments) {
        const lines = this.buildSpeakerTurns(segments).map((turn) => [turn.speakerName || 'Thành viên', turn.text].filter(Boolean).join(': '));
        return (0, transcript_noise_util_1.cleanTranscriptLines)(lines).join('\n');
    }
};
exports.MeetingTranscriptsService = MeetingTranscriptsService;
exports.MeetingTranscriptsService = MeetingTranscriptsService = MeetingTranscriptsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Optional)()),
    __param(0, (0, mongoose_1.InjectModel)(meeting_transcript_schema_1.MeetingTranscript.name)),
    __metadata("design:paramtypes", [Object, meetings_repository_1.MeetingsRepository,
        meeting_participants_repository_1.MeetingParticipantsRepository,
        meeting_access_service_1.MeetingAccessService,
        workspace_access_service_1.WorkspaceAccessService,
        project_access_service_1.ProjectAccessService,
        groq_transcription_service_1.GroqTranscriptionService])
], MeetingTranscriptsService);
//# sourceMappingURL=meeting-transcripts.service.js.map