import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';
import { mailConfig } from '../../../config/mail.config';
import { ObservabilityService } from '../../observability/observability.service';

export type SendMailInput = {
  to: string;
  subject: string;
  html: string;
  text: string;
};

const BREVO_ENDPOINT = 'https://api.brevo.com/v3/smtp/email';
const REQUEST_TIMEOUT_MS = 15_000;

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter?: Transporter;
  constructor(private readonly observability: ObservabilityService) {}

  /**
   * Gui email va nem loi neu that bai.
   *
   * Chi dung truc tiep khi nguoi dung dang cho ket qua (vi du: gui OTP, neu
   * that bai thi phai bao loi ngay). Voi thong bao phu tro thi dung
   * sendMailSafely de loi mail khong lam hong nghiep vu chinh.
   */
  async sendMail(input: SendMailInput) {
    const config = mailConfig();
    const started = Date.now();
    try {
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
      await this.observability?.record({
        kind: 'EMAIL',
        status: 'SUCCESS',
        operation: `mail.${config.provider}`,
        durationMs: Date.now() - started,
        error: null,
        metadata: {
          subject: input.subject,
          recipientDomain: input.to.split('@')[1] ?? 'unknown',
        },
      });
    } catch (error) {
      await this.observability?.record({
        kind: 'EMAIL',
        status: 'FAILED',
        operation: `mail.${config.provider}`,
        durationMs: Date.now() - started,
        error: error instanceof Error ? error.message : String(error),
        metadata: {
          subject: input.subject,
          recipientDomain: input.to.split('@')[1] ?? 'unknown',
        },
      });
      throw error;
    }
  }

  /**
   * Gui email nhung khong bao gio nem loi.
   *
   * Dung cho thong bao di kem nghiep vu: SMTP chet thi viec ban giao van phai
   * thanh cong, chi ghi log de con truy vet.
   */
  async sendMailSafely(input: SendMailInput) {
    try {
      await this.sendMail(input);
      return true;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(
        `Khong gui duoc email "${input.subject}" toi ${input.to}: ${message}`,
      );
      return false;
    }
  }

  private async sendViaSmtp(input: SendMailInput) {
    const config = mailConfig();

    if (!config.smtp.host || !config.smtp.user || !config.smtp.pass) {
      throw new Error(
        'Thieu cau hinh SMTP: can SMTP_HOST, SMTP_USER va SMTP_PASS.',
      );
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

  private async sendViaBrevo(input: SendMailInput) {
    const config = mailConfig();

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
        throw new Error(
          `Brevo tra ve ${response.status}: ${detail.slice(0, 200)}`,
        );
      }

      this.logger.log(
        `Da gui email "${input.subject}" toi ${input.to} qua Brevo`,
      );
    } finally {
      clearTimeout(timeout);
    }
  }

  /**
   * Che do khong cau hinh mail: in noi dung ra log de dev doc duoc OTP ma
   * khong can dung SMTP that.
   */
  private logToConsole(input: SendMailInput) {
    this.logger.warn(
      [
        'MAIL_PROVIDER=log nen email khong duoc gui thuc te.',
        `Nguoi nhan: ${input.to}`,
        `Tieu de: ${input.subject}`,
        `Noi dung: ${input.text}`,
      ].join(' | '),
    );
  }
}
