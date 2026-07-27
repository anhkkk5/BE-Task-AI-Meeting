export declare enum AiReportReviewStatus {
    Draft = "DRAFT",
    Collecting = "COLLECTING",
    AiGenerating = "AI_GENERATING",
    PendingReview = "PENDING_REVIEW",
    Published = "PUBLISHED",
    Cancelled = "CANCELLED"
}
export declare const LEGACY_APPROVED_REVIEW_STATUS = "APPROVED";
export declare function normalizeReviewStatus(value: string | null | undefined): AiReportReviewStatus;
export declare function isFinalReviewStatus(status: AiReportReviewStatus): status is AiReportReviewStatus.Published | AiReportReviewStatus.Cancelled;
