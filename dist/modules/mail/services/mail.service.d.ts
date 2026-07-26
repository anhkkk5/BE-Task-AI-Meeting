export type SendMailInput = {
    to: string;
    subject: string;
    html: string;
    text: string;
};
export declare class MailService {
    private readonly logger;
    private transporter?;
    sendMail(input: SendMailInput): Promise<void>;
    sendMailSafely(input: SendMailInput): Promise<boolean>;
    private sendViaSmtp;
    private sendViaBrevo;
    private logToConsole;
}
