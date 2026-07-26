"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildHandoverChangesRequestedMail = exports.buildHandoverRejectedMail = exports.buildHandoverAcceptedMail = exports.buildHandoverSubmittedMail = exports.buildOtpMail = void 0;
const BRAND = 'Agile AI';
const escapeHtml = (value) => value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
const toHtmlParagraph = (value) => escapeHtml(value).replace(/\r?\n/g, '<br />');
const layout = (title, body) => `<!DOCTYPE html>
<html lang="vi">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapeHtml(title)}</title>
  </head>
  <body style="margin:0;padding:24px 12px;background-color:#f4f5f7;font-family:'Segoe UI',Roboto,Arial,sans-serif;">
    <div style="max-width:560px;margin:0 auto;background-color:#ffffff;border:1px solid #dfe1e6;border-radius:12px;overflow:hidden;">
      <div style="padding:20px 24px;background-color:#0c66e4;">
        <p style="margin:0;font-size:16px;font-weight:700;color:#ffffff;">${BRAND}</p>
      </div>
      <div style="padding:24px;">${body}</div>
      <div style="padding:16px 24px;background-color:#f4f5f7;border-top:1px solid #dfe1e6;">
        <p style="margin:0;font-size:12px;line-height:18px;color:#6b778c;">
          Email tu dong tu ${BRAND}. Vui long khong tra loi email nay.
        </p>
      </div>
    </div>
  </body>
</html>`;
const button = (label, url) => `
  <p style="margin:24px 0 0;">
    <a href="${escapeHtml(url)}" style="display:inline-block;padding:11px 20px;background-color:#0c66e4;color:#ffffff;font-size:14px;font-weight:600;text-decoration:none;border-radius:6px;">${escapeHtml(label)}</a>
  </p>`;
const infoBlock = (label, value) => `
  <div style="margin-top:16px;padding:12px 14px;background-color:#f4f5f7;border-radius:8px;">
    <p style="margin:0 0 4px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;color:#6b778c;">${escapeHtml(label)}</p>
    <p style="margin:0;font-size:14px;line-height:21px;color:#172b4d;">${toHtmlParagraph(value)}</p>
  </div>`;
const buildOtpMail = (params) => {
    const body = `
    <p style="margin:0;font-size:15px;line-height:23px;color:#172b4d;">
      Xin chao <strong>${escapeHtml(params.fullName)}</strong>,
    </p>
    <p style="margin:12px 0 0;font-size:15px;line-height:23px;color:#172b4d;">
      Nhap ma xac thuc duoi day de hoan tat dang ky tai khoan ${BRAND}:
    </p>
    <div style="margin:20px 0;padding:18px;text-align:center;background-color:#f4f5f7;border:1px dashed #0c66e4;border-radius:10px;">
      <span style="font-size:32px;font-weight:700;letter-spacing:8px;color:#0c66e4;">${escapeHtml(params.otp)}</span>
    </div>
    <p style="margin:0;font-size:14px;line-height:21px;color:#6b778c;">
      Ma co hieu luc trong <strong>${params.expiresInMinutes} phut</strong>.
      Neu ban khong yeu cau dang ky, hay bo qua email nay.
    </p>`;
    return {
        subject: `${params.otp} la ma xac thuc ${BRAND} cua ban`,
        html: layout('Ma xac thuc email', body),
        text: `Xin chao ${params.fullName}, ma xac thuc dang ky ${BRAND} cua ban la ${params.otp}. Ma het han sau ${params.expiresInMinutes} phut.`,
    };
};
exports.buildOtpMail = buildOtpMail;
const buildHandoverSubmittedMail = (params) => {
    const body = `
    <p style="margin:0;font-size:15px;line-height:23px;color:#172b4d;">
      Xin chao <strong>${escapeHtml(params.recipientName)}</strong>,
    </p>
    <p style="margin:12px 0 0;font-size:15px;line-height:23px;color:#172b4d;">
      <strong>${escapeHtml(params.counterpartName)}</strong> vua ban giao cong viec
      <strong>${escapeHtml(params.taskLabel)}</strong> cho ban va dang cho ban tiep nhan.
    </p>
    ${infoBlock('Phan da hoan thanh', params.completedWork)}
    ${infoBlock('Phan con lai', params.remainingWork)}
    ${params.blockers ? infoBlock('Vuong mac', params.blockers) : ''}
    ${params.dueAt ? infoBlock('Han xu ly du kien', params.dueAt) : ''}
    <p style="margin:20px 0 0;font-size:14px;line-height:21px;color:#6b778c;">
      Ban se tro thanh nguoi phu trach cong viec nay sau khi bam tiep nhan.
    </p>
    ${button('Xem ban giao', params.handoverUrl)}`;
    return {
        subject: `[Ban giao] ${params.taskLabel} dang cho ban tiep nhan`,
        html: layout('Ban giao cong viec moi', body),
        text: `${params.counterpartName} vua ban giao cong viec ${params.taskLabel} cho ban. Da lam: ${params.completedWork}. Con lai: ${params.remainingWork}. Xem tai: ${params.handoverUrl}`,
    };
};
exports.buildHandoverSubmittedMail = buildHandoverSubmittedMail;
const buildHandoverAcceptedMail = (params) => {
    const body = `
    <p style="margin:0;font-size:15px;line-height:23px;color:#172b4d;">
      Xin chao <strong>${escapeHtml(params.recipientName)}</strong>,
    </p>
    <p style="margin:12px 0 0;font-size:15px;line-height:23px;color:#172b4d;">
      <strong>${escapeHtml(params.counterpartName)}</strong> da tiep nhan cong viec
      <strong>${escapeHtml(params.taskLabel)}</strong>.
      Nguoi phu trach da duoc chuyen sang ho, ban khong con phu trach viec nay.
    </p>
    ${button('Xem chi tiet', params.handoverUrl)}`;
    return {
        subject: `[Ban giao] ${params.taskLabel} da duoc tiep nhan`,
        html: layout('Ban giao da duoc tiep nhan', body),
        text: `${params.counterpartName} da tiep nhan cong viec ${params.taskLabel}. Ban khong con la nguoi phu trach. Xem tai: ${params.handoverUrl}`,
    };
};
exports.buildHandoverAcceptedMail = buildHandoverAcceptedMail;
const buildHandoverRejectedMail = (params) => {
    const body = `
    <p style="margin:0;font-size:15px;line-height:23px;color:#172b4d;">
      Xin chao <strong>${escapeHtml(params.recipientName)}</strong>,
    </p>
    <p style="margin:12px 0 0;font-size:15px;line-height:23px;color:#172b4d;">
      <strong>${escapeHtml(params.counterpartName)}</strong> da tu choi nhan ban giao
      <strong>${escapeHtml(params.taskLabel)}</strong>.
    </p>
    ${infoBlock('Ly do tu choi', params.reason)}
    <p style="margin:20px 0 0;font-size:14px;line-height:21px;color:#ae2a19;">
      Cong viec nay van thuoc ve ban.
    </p>
    ${button('Xem chi tiet', params.handoverUrl)}`;
    return {
        subject: `[Ban giao] ${params.taskLabel} bi tu choi`,
        html: layout('Ban giao bi tu choi', body),
        text: `${params.counterpartName} da tu choi nhan ban giao ${params.taskLabel}. Ly do: ${params.reason}. Cong viec van thuoc ve ban. Xem tai: ${params.handoverUrl}`,
    };
};
exports.buildHandoverRejectedMail = buildHandoverRejectedMail;
const buildHandoverChangesRequestedMail = (params) => {
    const body = `
    <p style="margin:0;font-size:15px;line-height:23px;color:#172b4d;">
      Xin chao <strong>${escapeHtml(params.recipientName)}</strong>,
    </p>
    <p style="margin:12px 0 0;font-size:15px;line-height:23px;color:#172b4d;">
      <strong>${escapeHtml(params.counterpartName)}</strong> can ban bo sung thong tin
      cho ban giao <strong>${escapeHtml(params.taskLabel)}</strong> truoc khi tiep nhan.
    </p>
    ${infoBlock('Noi dung can bo sung', params.reason)}
    ${button('Bo sung ngay', params.handoverUrl)}`;
    return {
        subject: `[Ban giao] ${params.taskLabel} can bo sung thong tin`,
        html: layout('Yeu cau bo sung ban giao', body),
        text: `${params.counterpartName} can ban bo sung thong tin cho ban giao ${params.taskLabel}. Noi dung: ${params.reason}. Xem tai: ${params.handoverUrl}`,
    };
};
exports.buildHandoverChangesRequestedMail = buildHandoverChangesRequestedMail;
//# sourceMappingURL=mail-templates.js.map