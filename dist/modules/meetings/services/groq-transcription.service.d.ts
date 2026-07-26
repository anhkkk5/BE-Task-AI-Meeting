export type MeetingAudioFile = {
    buffer: Buffer;
    mimetype: string;
    originalname?: string;
    size?: number;
};
export type TranscribeOptions = {
    vocabularyHints?: string[];
};
export declare class GroqTranscriptionService {
    private readonly logger;
    transcribe(file: MeetingAudioFile, options?: TranscribeOptions): Promise<{
        text: string;
        model: string;
        language: string | undefined;
        duration: number | undefined;
    }>;
    private buildPrompt;
    private extractConfidentText;
    private validateAudio;
}
