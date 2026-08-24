import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import {
  TeamReportActionItemSource,
  TeamReportActionItemStatus,
} from '../../../common/enums/team-report-action-item-status.enum';

/**
 * Ket qua xu ly mot muc de xuat trong bao cao giao ban.
 *
 * Bao cao giao ban nam trong MongoDB, con task nam trong MySQL. Bang nay la cau
 * noi: no giu lai "muc nao cua bao cao nao da thanh task nao", de mo lai bao cao
 * cu van biet viec da duoc xu ly, khong tao task trung lan hai.
 *
 * `report_id` khong co khoa ngoai vi tro sang MongoDB.
 */
@Entity('team_report_action_items')
@Index(['reportId', 'source', 'itemIndex'], { unique: true })
export class TeamReportActionItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ name: 'workspace_id', type: 'varchar', length: 36 })
  workspaceId: string;

  @Index()
  @Column({ name: 'project_id', type: 'varchar', length: 36 })
  projectId: string;

  /** Id bao cao trong MongoDB, khong rang buoc khoa ngoai. */
  @Index()
  @Column({ name: 'report_id', type: 'varchar', length: 64 })
  reportId: string;

  @Column({ type: 'enum', enum: TeamReportActionItemSource })
  source: TeamReportActionItemSource;

  @Column({ name: 'item_index', type: 'int' })
  itemIndex: number;

  /**
   * Noi dung muc tai thoi diem xu ly.
   *
   * Sao lai thay vi chi tham chieu, vi truong nhom co the sua lai bao cao sau do;
   * khi doi chieu can biet ho da chot dua tren cau chu nao.
   */
  @Column({ name: 'item_text', type: 'text' })
  itemText: string;

  @Column({
    type: 'enum',
    enum: TeamReportActionItemStatus,
    default: TeamReportActionItemStatus.Pending,
  })
  status: TeamReportActionItemStatus;

  @Column({
    name: 'created_task_id',
    type: 'varchar',
    length: 36,
    nullable: true,
  })
  createdTaskId: string | null;

  /**
   * Task duoc de nghi ban giao.
   *
   * Truong nhom khong tu tao ban giao ho duoc (chi nguoi dang giu task moi tao),
   * nen de nghi phai chi ro task nao de nguoi giu task mo dung form.
   */
  @Column({
    name: 'target_task_id',
    type: 'varchar',
    length: 36,
    nullable: true,
  })
  targetTaskId: string | null;

  /** Nguoi duoc de xuat nhan ban giao. */
  @Column({
    name: 'suggested_receiver_id',
    type: 'varchar',
    length: 36,
    nullable: true,
  })
  suggestedReceiverId: string | null;

  /** Duoc dien khi nguoi giu task da tao ban giao that tu de nghi nay. */
  @Column({ name: 'handover_id', type: 'varchar', length: 36, nullable: true })
  handoverId: string | null;

  @Column({ name: 'note', type: 'varchar', length: 500, nullable: true })
  note: string | null;

  @Column({ name: 'handled_by', type: 'varchar', length: 36, nullable: true })
  handledBy: string | null;

  @Column({ name: 'handled_at', type: 'datetime', nullable: true })
  handledAt: Date | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
