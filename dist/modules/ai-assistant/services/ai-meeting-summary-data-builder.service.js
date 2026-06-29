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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AiMeetingSummaryDataBuilderService = void 0;
const common_1 = require("@nestjs/common");
const meeting_participants_repository_1 = require("../../meetings/repositories/meeting-participants.repository");
const meeting_transcripts_service_1 = require("../../meetings/services/meeting-transcripts.service");
const project_access_service_1 = require("../../projects/services/project-access.service");
let AiMeetingSummaryDataBuilderService = class AiMeetingSummaryDataBuilderService {
    meetingParticipantsRepository;
    meetingTranscriptsService;
    projectAccessService;
    constructor(meetingParticipantsRepository, meetingTranscriptsService, projectAccessService) {
        this.meetingParticipantsRepository = meetingParticipantsRepository;
        this.meetingTranscriptsService = meetingTranscriptsService;
        this.projectAccessService = projectAccessService;
    }
    async buildMeetingSummaryInput(params) {
        const [project, participants, transcript] = await Promise.all([
            this.projectAccessService.assertProjectInWorkspace(params.projectId, params.workspaceId),
            this.meetingParticipantsRepository.findByMeeting(params.meeting.id),
            this.meetingTranscriptsService.findTranscriptForMeeting(params.meeting),
        ]);
        return {
            workspace: {
                id: params.workspaceId,
            },
            project: {
                id: project.id,
                name: project.name,
                keyCode: project.keyCode,
                status: project.status,
            },
            meeting: {
                id: params.meeting.id,
                title: params.meeting.title,
                description: params.meeting.description,
                meetingType: params.meeting.meetingType,
                meetingDate: params.meeting.meetingDate,
                status: params.meeting.status,
                startTime: params.meeting.startTime,
                endTime: params.meeting.endTime,
            },
            sprint: params.meeting.sprint
                ? {
                    id: params.meeting.sprint.id,
                    name: params.meeting.sprint.name,
                    status: params.meeting.sprint.status,
                    startDate: params.meeting.sprint.startDate,
                    endDate: params.meeting.sprint.endDate,
                }
                : null,
            participants: participants.map((participant) => ({
                userId: participant.userId,
                fullName: participant.user?.fullName ?? null,
                email: participant.user?.email ?? null,
                role: participant.role,
                attended: participant.attended,
            })),
            transcript: {
                id: transcript._id.toString(),
                rawTranscript: transcript.rawTranscript,
                normalizedTranscript: this.normalizeTranscript(transcript.rawTranscript),
                speakers: (transcript.speakers ?? []).map((speaker) => ({
                    userId: speaker.userId,
                    speakerName: speaker.speakerName,
                    text: speaker.text,
                })),
            },
            generatedAt: new Date().toISOString(),
        };
    }
    normalizeTranscript(rawTranscript) {
        return rawTranscript
            .split(/\r?\n/)
            .map((line) => line.trim().replace(/\s+/g, ' '))
            .filter(Boolean)
            .join('\n')
            .slice(0, 20000);
    }
};
exports.AiMeetingSummaryDataBuilderService = AiMeetingSummaryDataBuilderService;
exports.AiMeetingSummaryDataBuilderService = AiMeetingSummaryDataBuilderService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [meeting_participants_repository_1.MeetingParticipantsRepository,
        meeting_transcripts_service_1.MeetingTranscriptsService,
        project_access_service_1.ProjectAccessService])
], AiMeetingSummaryDataBuilderService);
//# sourceMappingURL=ai-meeting-summary-data-builder.service.js.map