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
exports.AiPersonalizedMeetingSummaryDataBuilderService = void 0;
const common_1 = require("@nestjs/common");
const meeting_participants_repository_1 = require("../../meetings/repositories/meeting-participants.repository");
const meeting_transcripts_service_1 = require("../../meetings/services/meeting-transcripts.service");
const project_access_service_1 = require("../../projects/services/project-access.service");
const users_service_1 = require("../../users/services/users.service");
let AiPersonalizedMeetingSummaryDataBuilderService = class AiPersonalizedMeetingSummaryDataBuilderService {
    meetingParticipantsRepository;
    meetingTranscriptsService;
    projectAccessService;
    usersService;
    constructor(meetingParticipantsRepository, meetingTranscriptsService, projectAccessService, usersService) {
        this.meetingParticipantsRepository = meetingParticipantsRepository;
        this.meetingTranscriptsService = meetingTranscriptsService;
        this.projectAccessService = projectAccessService;
        this.usersService = usersService;
    }
    async buildPersonalizedMeetingSummaryInput(params) {
        const [project, participants, targetUser, transcript] = await Promise.all([
            this.projectAccessService.assertProjectInWorkspace(params.projectId, params.workspaceId),
            this.meetingParticipantsRepository.findByMeeting(params.meeting.id),
            this.usersService.findById(params.targetUserId),
            this.findTranscriptIfAvailable(params.meeting),
        ]);
        if (!targetUser) {
            throw new common_1.NotFoundException('Target user not found');
        }
        const targetActionItems = this.findTargetActionItems(params.sourceSummary.actionItems ?? [], {
            userId: targetUser.id,
            fullName: targetUser.fullName,
            email: targetUser.email,
        });
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
            sprint: params.meeting.sprint
                ? {
                    id: params.meeting.sprint.id,
                    name: params.meeting.sprint.name,
                    status: params.meeting.sprint.status,
                    startDate: params.meeting.sprint.startDate,
                    endDate: params.meeting.sprint.endDate,
                }
                : null,
            meeting: {
                id: params.meeting.id,
                title: params.meeting.title,
                description: params.meeting.description,
                meetingType: params.meeting.meetingType,
                meetingDate: params.meeting.meetingDate,
                status: params.meeting.status,
            },
            targetUser: {
                userId: targetUser.id,
                fullName: targetUser.fullName,
                email: targetUser.email,
            },
            participants: participants.map((participant) => ({
                userId: participant.userId,
                fullName: participant.user?.fullName ?? null,
                email: participant.user?.email ?? null,
                role: participant.role,
                attended: participant.attended,
            })),
            meetingSummary: {
                id: params.sourceSummary._id.toString(),
                title: params.sourceSummary.title,
                summary: params.sourceSummary.summary,
                keyPoints: params.sourceSummary.keyPoints ?? [],
                decisions: params.sourceSummary.decisions ?? [],
                actionItems: params.sourceSummary.actionItems ?? [],
                risks: params.sourceSummary.risks ?? [],
                openQuestions: params.sourceSummary.openQuestions ?? [],
                nextSteps: params.sourceSummary.nextSteps ?? [],
            },
            relatedTranscriptSnippets: transcript
                ? this.findRelatedTranscriptSnippets(transcript, {
                    fullName: targetUser.fullName,
                    email: targetUser.email,
                    userId: targetUser.id,
                })
                : [],
            targetActionItems,
            transcriptId: transcript?._id.toString() ?? params.sourceSummary.transcriptId,
            generatedAt: new Date().toISOString(),
        };
    }
    async findTranscriptIfAvailable(meeting) {
        try {
            return await this.meetingTranscriptsService.findTranscriptForMeeting(meeting);
        }
        catch {
            return null;
        }
    }
    findTargetActionItems(actionItems, targetUser) {
        return actionItems.filter((item) => {
            if (item.assigneeUserId && item.assigneeUserId === targetUser.userId) {
                return true;
            }
            const haystack = [item.assigneeName, item.text, item.source]
                .filter(Boolean)
                .join(' ')
                .toLowerCase();
            return (Boolean(targetUser.fullName) &&
                haystack.includes(targetUser.fullName.toLowerCase()));
        });
    }
    findRelatedTranscriptSnippets(transcript, targetUser) {
        const snippets = new Set();
        const targetName = targetUser.fullName.toLowerCase();
        for (const speaker of transcript.speakers ?? []) {
            const speakerName = speaker.speakerName?.toLowerCase() ?? '';
            const text = speaker.text.trim();
            if (speaker.userId === targetUser.userId ||
                speakerName.includes(targetName) ||
                text.toLowerCase().includes(targetName)) {
                snippets.add([speaker.speakerName, speaker.text].filter(Boolean).join(': '));
            }
        }
        for (const line of transcript.rawTranscript.split(/\r?\n/)) {
            const trimmedLine = line.trim();
            const normalizedLine = trimmedLine.toLowerCase();
            if (trimmedLine &&
                (normalizedLine.includes(targetName) ||
                    normalizedLine.includes(targetUser.email.toLowerCase()))) {
                snippets.add(trimmedLine);
            }
        }
        return [...snippets].slice(0, 20);
    }
};
exports.AiPersonalizedMeetingSummaryDataBuilderService = AiPersonalizedMeetingSummaryDataBuilderService;
exports.AiPersonalizedMeetingSummaryDataBuilderService = AiPersonalizedMeetingSummaryDataBuilderService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [meeting_participants_repository_1.MeetingParticipantsRepository,
        meeting_transcripts_service_1.MeetingTranscriptsService,
        project_access_service_1.ProjectAccessService,
        users_service_1.UsersService])
], AiPersonalizedMeetingSummaryDataBuilderService);
//# sourceMappingURL=ai-personalized-meeting-summary-data-builder.service.js.map