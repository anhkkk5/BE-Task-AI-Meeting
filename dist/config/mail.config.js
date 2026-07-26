"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mailConfig = void 0;
const resolveProvider = () => {
    const configured = process.env.MAIL_PROVIDER?.trim().toLowerCase();
    if (configured === 'smtp' || configured === 'brevo' || configured === 'log') {
        return configured;
    }
    if (process.env.SMTP_HOST?.trim() && process.env.SMTP_USER?.trim()) {
        return 'smtp';
    }
    if (process.env.BREVO_API_KEY?.trim()) {
        return 'brevo';
    }
    return 'log';
};
const mailConfig = () => {
    const provider = resolveProvider();
    const smtpUser = process.env.SMTP_USER?.trim() || undefined;
    return {
        provider,
        smtp: {
            host: process.env.SMTP_HOST?.trim() || undefined,
            port: Number(process.env.SMTP_PORT ?? 587),
            secure: Number(process.env.SMTP_PORT ?? 587) === 465,
            user: smtpUser,
            pass: process.env.SMTP_PASS?.trim() || undefined,
        },
        brevoApiKey: process.env.BREVO_API_KEY?.trim() || undefined,
        from: process.env.EMAIL_FROM?.trim() || smtpUser || 'no-reply@agile-ai.local',
        fromName: process.env.EMAIL_FROM_NAME?.trim() || 'Agile AI',
        appUrl: process.env.APP_WEB_URL?.trim() || 'http://localhost:3000',
    };
};
exports.mailConfig = mailConfig;
//# sourceMappingURL=mail.config.js.map