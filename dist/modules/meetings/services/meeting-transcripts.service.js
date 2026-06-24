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
Object.defineProperty(exports, "__esModule", { value: true });
exports.MeetingTranscriptsService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const project_access_service_1 = require("../../projects/services/project-access.service");
const workspace_access_service_1 = require("../../workspaces/services/workspace-access.service");
const meeting_transcript_schema_1 = require("../schemas/meeting-transcript.schema");
const meetings_repository_1 = require("../repositories/meetings.repository");
const meeting_access_service_1 = require("./meeting-access.service");
let MeetingTranscriptsService = class MeetingTranscriptsService {
    transcriptModel;
    meetingsRepository;
    meetingAccessService;
    workspaceAccessService;
    projectAccessService;
    constructor(transcriptModel, meetingsRepository, meetingAccessService, workspaceAccessService, projectAccessService) {
        this.transcriptModel = transcriptModel;
        this.meetingsRepository = meetingsRepository;
        this.meetingAccessService = meetingAccessService;
        this.workspaceAccessService = workspaceAccessService;
        this.projectAccessService = projectAccessService;
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
    getTranscriptModel() {
        if (!this.transcriptModel) {
            throw new common_1.ServiceUnavailableException('MongoDB is disabled');
        }
        return this.transcriptModel;
    }
    getTranscriptId(transcript) {
        return transcript._id.toString();
    }
    toTranscriptResponse(transcript) {
        const stampedTranscript = transcript;
        return {
            id: this.getTranscriptId(transcript),
            meetingId: transcript.meetingId,
            workspaceId: transcript.workspaceId,
            projectId: transcript.projectId,
            sprintId: transcript.sprintId ?? null,
            rawTranscript: transcript.rawTranscript,
            speakers: transcript.speakers ?? [],
            createdBy: transcript.createdBy,
            createdAt: stampedTranscript.createdAt,
            updatedAt: stampedTranscript.updatedAt,
        };
    }
};
exports.MeetingTranscriptsService = MeetingTranscriptsService;
exports.MeetingTranscriptsService = MeetingTranscriptsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Optional)()),
    __param(0, (0, mongoose_1.InjectModel)(meeting_transcript_schema_1.MeetingTranscript.name)),
    __metadata("design:paramtypes", [Object, meetings_repository_1.MeetingsRepository,
        meeting_access_service_1.MeetingAccessService,
        workspace_access_service_1.WorkspaceAccessService,
        project_access_service_1.ProjectAccessService])
], MeetingTranscriptsService);
//# sourceMappingURL=meeting-transcripts.service.js.map