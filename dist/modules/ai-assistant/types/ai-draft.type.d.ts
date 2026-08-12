export type HandoverDraftInputData = {
    task: {
        id: string;
        taskCode: string;
        title: string;
        description: string | null;
        status: string;
        workflowStatusId: string | null;
        workflowStatusKey: string;
        dueDate: string | null;
        assigneeName: string | null;
    };
    project: {
        id: string;
        name: string;
        keyCode: string;
    };
    recentDailyUpdates: {
        updateDate: string;
        yesterdayWork: string;
        todayPlan: string;
        blockers: string | null;
    }[];
    receiverName: string | null;
};
export type DailyUpdateDraftOutput = {
    yesterdayWork: string;
    todayPlan: string;
    blockers: string;
    notes: string;
};
export type HandoverDraftOutput = {
    completedWork: string;
    remainingWork: string;
    blockers: string;
    nextSteps: string;
    referenceLinks: string;
};
