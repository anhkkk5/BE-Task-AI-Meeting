/**
 * Cau hinh gui email.
 *
 * Ho tro 3 che do, chon bang MAIL_PROVIDER:
 * - smtp: gui qua SMTP (Gmail App Password, Mailtrap...)
 * - brevo: gui qua HTTP API cua Brevo, khong can mo cong SMTP
 * - log: khong gui thuc, chi ghi noi dung ra log
 *
 * Neu khong khai bao MAIL_PROVIDER thi tu suy ra: co SMTP_HOST + SMTP_USER thi
 * dung smtp, co BREVO_API_KEY thi dung brevo, con lai roi ve log. Muc dich la
 * may chua cau hinh mail van chay duoc toan bo luong dang ky (doc OTP tu log).
 */
export type MailProvider = 'smtp' | 'brevo' | 'log';

const resolveProvider = (): MailProvider => {
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

export const mailConfig = () => {
  const provider = resolveProvider();
  const smtpUser = process.env.SMTP_USER?.trim() || undefined;

  return {
    provider,
    smtp: {
      host: process.env.SMTP_HOST?.trim() || undefined,
      port: Number(process.env.SMTP_PORT ?? 587),
      // Cong 465 la SMTPS (TLS ngay tu dau), cac cong khac dung STARTTLS.
      secure: Number(process.env.SMTP_PORT ?? 587) === 465,
      user: smtpUser,
      pass: process.env.SMTP_PASS?.trim() || undefined,
    },
    brevoApiKey: process.env.BREVO_API_KEY?.trim() || undefined,
    // Nhieu SMTP (nhu Gmail) bat buoc From phai trung tai khoan dang nhap,
    // nen lay SMTP_USER lam mac dinh khi EMAIL_FROM de trong.
    from:
      process.env.EMAIL_FROM?.trim() || smtpUser || 'no-reply@agile-ai.local',
    fromName: process.env.EMAIL_FROM_NAME?.trim() || 'Agile AI',
    /** Dung de dung link trong email tro ve dung moi truong dang chay. */
    appUrl: process.env.APP_WEB_URL?.trim() || 'http://localhost:3000',
  };
};
