"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LEGACY_APPROVED_REVIEW_STATUS = exports.AiReportReviewStatus = void 0;
exports.normalizeReviewStatus = normalizeReviewStatus;
exports.isFinalReviewStatus = isFinalReviewStatus;
var AiReportReviewStatus;
(function (AiReportReviewStatus) {
    AiReportReviewStatus["Draft"] = "DRAFT";
    AiReportReviewStatus["Collecting"] = "COLLECTING";
    AiReportReviewStatus["AiGenerating"] = "AI_GENERATING";
    AiReportReviewStatus["PendingReview"] = "PENDING_REVIEW";
    AiReportReviewStatus["Published"] = "PUBLISHED";
    AiReportReviewStatus["Cancelled"] = "CANCELLED";
})(AiReportReviewStatus || (exports.AiReportReviewStatus = AiReportReviewStatus = {}));
exports.LEGACY_APPROVED_REVIEW_STATUS = 'APPROVED';
function normalizeReviewStatus(value) {
    if (!value || value === exports.LEGACY_APPROVED_REVIEW_STATUS) {
        return AiReportReviewStatus.Published;
    }
    const known = Object.values(AiReportReviewStatus).find((status) => status === value);
    return known ?? AiReportReviewStatus.PendingReview;
}
function isFinalReviewStatus(status) {
    return (status === AiReportReviewStatus.Published ||
        status === AiReportReviewStatus.Cancelled);
}
//# sourceMappingURL=ai-report-review-status.enum.js.map