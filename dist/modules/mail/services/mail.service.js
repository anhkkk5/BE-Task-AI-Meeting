"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var MailService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MailService = void 0;
const common_1 = require("@nestjs/common");
const nodemailer = __importStar(require("nodemailer"));
const mail_config_1 = require("../../../config/mail.config");
const BREVO_ENDPOINT = 'https://api.brevo.com/v3/smtp/email';
const REQUEST_TIMEOUT_MS = 15_000;
let MailService = MailService_1 = class MailService {
    logger = new common_1.Logger(MailService_1.name);
    transporter;
    async sendMail(input) {
        const config = (0, mail_config_1.mailConfig)();
        switch (config.provider) {
            case 'smtp':
                await this.sendViaSmtp(input);
                break;
            case 'brevo':
                await this.sendViaBrevo(input);
                break;
            default:
                this.logToConsole(input);
        }
    }
    async sendMailSafely(input) {
        try {
            await this.sendMail(input);
            return true;
        }
        catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            this.logger.error(`Khong gui duoc email "${input.subject}" toi ${input.to}: ${message}`);
            return false;
        }
    }
    async sendViaSmtp(input) {
        const config = (0, mail_config_1.mailConfig)();
        if (!config.smtp.host || !config.smtp.user || !config.smtp.pass) {
            throw new Error('Thieu cau hinh SMTP: can SMTP_HOST, SMTP_USER va SMTP_PASS.');
        }
        this.transporter ??= nodemailer.createTransport({
            host: config.smtp.host,
            port: config.smtp.port,
            secure: config.smtp.secure,
            auth: {
                user: config.smtp.user,
                pass: config.smtp.pass,
            },
            connectionTimeout: REQUEST_TIMEOUT_MS,
            greetingTimeout: REQUEST_TIMEOUT_MS,
        });
        await this.transporter.sendMail({
            from: `"${config.fromName}" <${config.from}>`,
            to: input.to,
            subject: input.subject,
            html: input.html,
            text: input.text,
        });
        this.logger.log(`Da gui email "${input.subject}" toi ${input.to} qua SMTP`);
    }
    async sendViaBrevo(input) {
        const config = (0, mail_config_1.mailConfig)();
        if (!config.brevoApiKey) {
            throw new Error('Thieu BREVO_API_KEY.');
        }
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
        try {
            const response = await fetch(BREVO_ENDPOINT, {
                method: 'POST',
                headers: {
                    'api-key': config.brevoApiKey,
                    'content-type': 'application/json',
                    accept: 'application/json',
                },
                body: JSON.stringify({
                    sender: { email: config.from, name: config.fromName },
                    to: [{ email: input.to }],
                    subject: input.subject,
                    htmlContent: input.html,
                    textContent: input.text,
                }),
                signal: controller.signal,
            });
            if (!response.ok) {
                const detail = await response.text().catch(() => '');
                throw new Error(`Brevo tra ve ${response.status}: ${detail.slice(0, 200)}`);
            }
            this.logger.log(`Da gui email "${input.subject}" toi ${input.to} qua Brevo`);
        }
        finally {
            clearTimeout(timeout);
        }
    }
    logToConsole(input) {
        this.logger.warn([
            'MAIL_PROVIDER=log nen email khong duoc gui thuc te.',
            `Nguoi nhan: ${input.to}`,
            `Tieu de: ${input.subject}`,
            `Noi dung: ${input.text}`,
        ].join(' | '));
    }
};
exports.MailService = MailService;
exports.MailService = MailService = MailService_1 = __decorate([
    (0, common_1.Injectable)()
], MailService);
//# sourceMappingURL=mail.service.js.map