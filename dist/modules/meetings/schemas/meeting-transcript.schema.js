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
exports.MeetingTranscriptSchema = exports.MeetingTranscript = exports.MeetingTranscriptSegmentSchema = exports.MeetingTranscriptSegment = exports.MeetingTranscriptSpeakerSchema = exports.MeetingTranscriptSpeaker = void 0;
const mongoose_1 = require("@nestjs/mongoose");
let MeetingTranscriptSpeaker = class MeetingTranscriptSpeaker {
    userId;
    speakerName;
    text;
};
exports.MeetingTranscriptSpeaker = MeetingTranscriptSpeaker;
__decorate([
    (0, mongoose_1.Prop)({ type: String }),
    __metadata("design:type", String)
], MeetingTranscriptSpeaker.prototype, "userId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String }),
    __metadata("design:type", String)
], MeetingTranscriptSpeaker.prototype, "speakerName", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], MeetingTranscriptSpeaker.prototype, "text", void 0);
exports.MeetingTranscriptSpeaker = MeetingTranscriptSpeaker = __decorate([
    (0, mongoose_1.Schema)({ _id: false })
], MeetingTranscriptSpeaker);
exports.MeetingTranscriptSpeakerSchema = mongoose_1.SchemaFactory.createForClass(MeetingTranscriptSpeaker);
let MeetingTranscriptSegment = class MeetingTranscriptSegment {
    userId;
    speakerName;
    text;
    startedAt;
    endedAt;
    confidence;
    source;
};
exports.MeetingTranscriptSegment = MeetingTranscriptSegment;
__decorate([
    (0, mongoose_1.Prop)({ type: String }),
    __metadata("design:type", String)
], MeetingTranscriptSegment.prototype, "userId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String }),
    __metadata("design:type", String)
], MeetingTranscriptSegment.prototype, "speakerName", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], MeetingTranscriptSegment.prototype, "text", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Date)
], MeetingTranscriptSegment.prototype, "startedAt", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Date }),
    __metadata("design:type", Object)
], MeetingTranscriptSegment.prototype, "endedAt", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Number }),
    __metadata("design:type", Object)
], MeetingTranscriptSegment.prototype, "confidence", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, default: 'browser-speech' }),
    __metadata("design:type", String)
], MeetingTranscriptSegment.prototype, "source", void 0);
exports.MeetingTranscriptSegment = MeetingTranscriptSegment = __decorate([
    (0, mongoose_1.Schema)({ _id: false })
], MeetingTranscriptSegment);
exports.MeetingTranscriptSegmentSchema = mongoose_1.SchemaFactory.createForClass(MeetingTranscriptSegment);
let MeetingTranscript = class MeetingTranscript {
    meetingId;
    workspaceId;
    projectId;
    sprintId;
    rawTranscript;
    speakers;
    liveSegments;
    createdBy;
};
exports.MeetingTranscript = MeetingTranscript;
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], MeetingTranscript.prototype, "meetingId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], MeetingTranscript.prototype, "workspaceId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], MeetingTranscript.prototype, "projectId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String }),
    __metadata("design:type", Object)
], MeetingTranscript.prototype, "sprintId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], MeetingTranscript.prototype, "rawTranscript", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [exports.MeetingTranscriptSpeakerSchema], default: [] }),
    __metadata("design:type", Array)
], MeetingTranscript.prototype, "speakers", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [exports.MeetingTranscriptSegmentSchema], default: [] }),
    __metadata("design:type", Array)
], MeetingTranscript.prototype, "liveSegments", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], MeetingTranscript.prototype, "createdBy", void 0);
exports.MeetingTranscript = MeetingTranscript = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true, collection: 'meeting_transcripts' })
], MeetingTranscript);
exports.MeetingTranscriptSchema = mongoose_1.SchemaFactory.createForClass(MeetingTranscript);
//# sourceMappingURL=meeting-transcript.schema.js.map