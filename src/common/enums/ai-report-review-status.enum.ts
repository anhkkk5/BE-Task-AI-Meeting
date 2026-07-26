/**
 * Trang thai duyet cua bao cao AI (quy trinh con nguoi).
 *
 * Tach rieng khoi AiReportStatus vi hai thu khac nhau:
 * - AiReportStatus: ket qua goi AI (PENDING/COMPLETED/FAILED).
 * - AiReportReviewStatus: nguoi quan ly da duyet ban nhap hay chua.
 *
 * Bao cao chi duoc coi la giao ban chinh thuc khi da APPROVED.
 */
export enum AiReportReviewStatus {
  Draft = 'DRAFT',
  Approved = 'APPROVED',
}
