/**
 * Trang thai xu ly mot muc AI de xuat trong bao cao giao ban.
 *
 * Bao cao giao ban thuong neu ra vuong mac va de xuat, nhung neu khong ai chot
 * lai thi chung chi la chu tren bao cao. Trang thai nay ghi lai viec truong nhom
 * da lam gi voi tung muc.
 */
export enum TeamReportActionItemStatus {
  /** Chua ai xu ly. */
  Pending = 'PENDING',
  /** Da tao task tu muc nay. */
  TaskCreated = 'TASK_CREATED',
  /** Da de nghi ban giao cong viec cho nguoi khac. */
  HandoverRequested = 'HANDOVER_REQUESTED',
  /** Bo qua, kem ly do de lan sau doc lai con hieu. */
  Dismissed = 'DISMISSED',
}

/**
 * Muc de xuat den tu phan nao cua bao cao.
 *
 * Luu kem vi mot bao cao co hai danh sach; chi luu chi so thi khong biet chi so
 * do thuoc danh sach nao.
 */
export enum TeamReportActionItemSource {
  /** Tu danh sach vuong mac. */
  Blocker = 'BLOCKER',
  /** Tu danh sach de xuat cua AI. */
  Recommendation = 'RECOMMENDATION',
}
