/**
 * Trang thai cua phien giao ban (quy trinh con nguoi).
 *
 * Tach rieng khoi AiReportStatus vi hai thu khac nhau:
 * - AiReportStatus: ket qua goi AI (PENDING/COMPLETED/FAILED).
 * - AiReportReviewStatus: phien giao ban dang o buoc nao.
 *
 * Bao cao chi duoc coi la giao ban chinh thuc khi da PUBLISHED.
 *
 * Luong chuan: DRAFT -> COLLECTING -> AI_GENERATING -> PENDING_REVIEW ->
 * PUBLISHED. CANCELLED la nhanh ket thuc som (vi du ca doi nghi le).
 *
 * Hai gia tri cu DRAFT va APPROVED van duoc giu de doc duoc du lieu tao truoc
 * khi mo rong: APPROVED se duoc anh xa sang PUBLISHED khi doc.
 */
export enum AiReportReviewStatus {
  /** Phien vua duoc tao, chua bat dau thu thap bao cao. */
  Draft = 'DRAFT',
  /** Dang cho thanh vien gui bao cao ca nhan. */
  Collecting = 'COLLECTING',
  /** AI dang tong hop bao cao nhom. */
  AiGenerating = 'AI_GENERATING',
  /** AI da tong hop xong, cho truong nhom xem va sua. */
  PendingReview = 'PENDING_REVIEW',
  /** Da duyet va gui cho ca nhom. */
  Published = 'PUBLISHED',
  /** Phien bi huy, khong tinh vao lich su giao ban. */
  Cancelled = 'CANCELLED',
}

/**
 * Gia tri `APPROVED` cua ban truoc khi mo rong trang thai.
 *
 * Khong dua vao enum de tranh code moi ghi lai gia tri cu, nhung van can hang
 * so nay o cho anh xa du lieu cu.
 */
export const LEGACY_APPROVED_REVIEW_STATUS = 'APPROVED';

/**
 * Anh xa gia tri doc tu MongoDB sang enum hien tai.
 *
 * Bao cao tao truoc khi co tinh nang duyet khong co `reviewStatus`; coi cac ban
 * do la da phat hanh, neu khong chung se dot ngot hien thanh "cho duyet" du da
 * dung tu lau.
 */
export function normalizeReviewStatus(
  value: string | null | undefined,
): AiReportReviewStatus {
  if (!value || value === LEGACY_APPROVED_REVIEW_STATUS) {
    return AiReportReviewStatus.Published;
  }

  const known = Object.values(AiReportReviewStatus).find(
    (status) => status === value,
  );

  return known ?? AiReportReviewStatus.PendingReview;
}

/** Trang thai da chot, khong con cho sua noi dung bao cao. */
export function isFinalReviewStatus(status: AiReportReviewStatus) {
  return (
    status === AiReportReviewStatus.Published ||
    status === AiReportReviewStatus.Cancelled
  );
}
