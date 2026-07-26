export type MailContent = {
    subject: string;
    html: string;
    text: string;
};
export declare const buildOtpMail: (params: {
    fullName: string;
    otp: string;
    expiresInMinutes: number;
}) => MailContent;
type HandoverMailParams = {
    recipientName: string;
    counterpartName: string;
    taskLabel: string;
    handoverUrl: string;
};
export declare const buildHandoverSubmittedMail: (params: HandoverMailParams & {
    completedWork: string;
    remainingWork: string;
    blockers?: string | null;
    dueAt?: string | null;
}) => MailContent;
export declare const buildHandoverAcceptedMail: (params: HandoverMailParams) => MailContent;
export declare const buildHandoverRejectedMail: (params: HandoverMailParams & {
    reason: string;
}) => MailContent;
export declare const buildHandoverChangesRequestedMail: (params: HandoverMailParams & {
    reason: string;
}) => MailContent;
export {};
