export type MeetingAudioFile = {
    buffer: Buffer;
    mimetype: string;
    originalname?: string;
    size?: number;
};
export declare class GroqTranscriptionService {
    transcribe(file: MeetingAudioFile): Promise<{
        text: string;
        model: string;
        language: string | undefined;
        duration: number | undefined;
    }>;
    private validateAudio;
}
