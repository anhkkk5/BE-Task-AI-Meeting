export type EvaluationActionItem = {
    text: string;
    assigneeName?: string | null;
    assigneeUserId?: string | null;
    dueDate?: string | null;
    status?: string | null;
    source?: string | null;
};
type MatchedPair = {
    truthIndex: number;
    predictionIndex: number;
    similarity: number;
};
export declare function normalizeEvaluationText(value?: string | null): string;
export declare function tokenF1(left: string, right: string): number;
export declare function matchActionItems(truth: EvaluationActionItem[], predictions: EvaluationActionItem[], threshold: number): MatchedPair[];
export {};
