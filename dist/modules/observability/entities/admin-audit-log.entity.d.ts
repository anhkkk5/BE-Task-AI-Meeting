export declare class AdminAuditLog {
    id: string;
    actorId: string;
    action: string;
    targetType: string;
    targetId: string;
    before: Record<string, unknown> | null;
    after: Record<string, unknown> | null;
    metadata: Record<string, unknown> | null;
    createdAt: Date;
}
