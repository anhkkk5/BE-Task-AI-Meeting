export declare class MeetingTranscriptSpeakerDto {
    speakerName?: string;
    userId?: string;
    text: string;
}
export declare class SaveMeetingTranscriptDto {
    rawTranscript: string;
    speakers?: MeetingTranscriptSpeakerDto[];
}
