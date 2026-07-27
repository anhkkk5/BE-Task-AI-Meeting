/**
 * Kieu du lieu cho hai tinh nang "AI soan nhap": bao cao ca nhan va ban giao.
 *
 * Tach ra file rieng vi ca service soan nhap va provider deu can dung. Neu de
 * trong service thi provider phai import service, ma service lai import
 * provider, tao vong import.
 */

/**
 * Du lieu dau vao cho ban nhap ban giao.
 *
 * Chi gom nhung gi nguoi ban giao thuc su can nho lai: task dang lam, tien do
 * gan nhat va vuong mac da tung ghi. Khong dua toan bo lich su du an vao vi
 * prompt dai lam AI tra loi lan man va ton token.
 */
export type HandoverDraftInputData = {
  task: {
    id: string;
    taskCode: string;
    title: string;
    description: string | null;
    status: string;
    dueDate: string | null;
    assigneeName: string | null;
  };
  project: {
    id: string;
    name: string;
    keyCode: string;
  };
  /** Bao cao hang ngay gan nhat cua nguoi ban giao, de suy ra tien do. */
  recentDailyUpdates: {
    updateDate: string;
    yesterdayWork: string;
    todayPlan: string;
    blockers: string | null;
  }[];
  receiverName: string | null;
};

/**
 * Nhap cho form bao cao ca nhan.
 *
 * Cac truong khop dung ten o trong form de frontend nap thang vao, khong phai
 * anh xa lai.
 */
export type DailyUpdateDraftOutput = {
  yesterdayWork: string;
  todayPlan: string;
  blockers: string;
  notes: string;
};

/** Nhap cho form ban giao cong viec, khop ten o trong form ban giao. */
export type HandoverDraftOutput = {
  completedWork: string;
  remainingWork: string;
  blockers: string;
  nextSteps: string;
  referenceLinks: string;
};
