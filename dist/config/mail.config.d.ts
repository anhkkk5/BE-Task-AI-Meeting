export type MailProvider = 'smtp' | 'brevo' | 'log';
export declare const mailConfig: () => {
    provider: MailProvider;
    smtp: {
        host: string | undefined;
        port: number;
        secure: boolean;
        user: string | undefined;
        pass: string | undefined;
    };
    brevoApiKey: string | undefined;
    from: string;
    fromName: string;
    appUrl: string;
};
