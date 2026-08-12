import { ObservabilityService } from '../../observability/observability.service';
export type SendMailInput = {
    to: string;
    subject: string;
    html: string;
    text: string;
};
export declare class MailService {
    private readonly observability;
    private readonly logger;
    private transporter?;
    constructor(observability: ObservabilityService);
    sendMail(input: SendMailInput): Promise<void>;
    sendMailSafely(input: SendMailInput): Promise<boolean>;
    private sendViaSmtp;
    private sendViaBrevo;
    private logToConsole;
}
