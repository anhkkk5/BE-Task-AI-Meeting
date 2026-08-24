import * as dotenv from 'dotenv';
import { randomUUID } from 'crypto';
import { createConnection, RowDataPacket } from 'mysql2/promise';

dotenv.config();

const TASK_PREFIX = 'DEMO-TL-';
const SPRINT_PREFIX = '[Demo tests lại]';

function sqlDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

function addDays(base: Date, days: number) {
  const result = new Date(base);
  result.setUTCDate(result.getUTCDate() + days);
  return result;
}

async function main() {
  const projectId = process.argv[2];
  if (!projectId) {
    throw new Error(
      'Usage: npx ts-node src/scripts/seed-project-sprints-backlog.ts <projectId>',
    );
  }

  const db = await createConnection({
    host: process.env.MYSQL_HOST,
    port: Number(process.env.MYSQL_PORT) || 3306,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
    ssl:
      process.env.MYSQL_SSL === 'true'
        ? { rejectUnauthorized: false }
        : undefined,
  });

  try {
    await db.beginTransaction();

    const [projects] = await db.execute<RowDataPacket[]>(
      `SELECT id, workspace_id, created_by, workflow_template_id
       FROM projects WHERE id = ? AND deleted_at IS NULL LIMIT 1`,
      [projectId],
    );
    if (!projects.length) throw new Error(`Project not found: ${projectId}`);

    const project = projects[0];
    const [members] = await db.execute<RowDataPacket[]>(
      `SELECT wm.user_id FROM workspace_members wm
       WHERE wm.workspace_id = ? AND wm.status = 'ACTIVE'
       ORDER BY wm.joined_at ASC, wm.created_at ASC`,
      [project.workspace_id],
    );
    if (!members.length) throw new Error('Workspace has no active members');

    const [workflowRows] = await db.execute<RowDataPacket[]>(
      `SELECT id, status_key FROM workflow_statuses
       WHERE template_id = ? AND enabled = 1`,
      [project.workflow_template_id],
    );
    const workflowIds = new Map(
      workflowRows.map((row) => [String(row.status_key), String(row.id)]),
    );
    for (const status of [
      'BACKLOG',
      'TODO',
      'IN_PROGRESS',
      'REVIEW',
      'DONE',
    ]) {
      if (!workflowIds.has(status)) {
        throw new Error(`Workflow status is missing: ${status}`);
      }
    }

    const [existing] = await db.execute<RowDataPacket[]>(
      `SELECT COUNT(*) AS total FROM tasks
       WHERE project_id = ? AND task_code LIKE ? AND deleted_at IS NULL`,
      [projectId, `${TASK_PREFIX}%`],
    );
    if (Number(existing[0].total) > 0) {
      await db.rollback();
      console.log('Demo data already exists; no duplicate rows were created.');
      return;
    }

    const now = new Date();
    const creatorId = String(project.created_by ?? members[0].user_id);
    const sprintDefinitions = [
      {
        name: `${SPRINT_PREFIX} Sprint 1`,
        goal: 'Hoàn thiện nền tảng, xác thực và cấu trúc dự án.',
        status: 'COMPLETED',
        start: -35,
        end: -22,
      },
      {
        name: `${SPRINT_PREFIX} Sprint 2`,
        goal: 'Hoàn thiện Backlog, Board, báo cáo và trải nghiệm người dùng.',
        status: 'ACTIVE',
        start: -6,
        end: 7,
      },
      {
        name: `${SPRINT_PREFIX} Sprint 3`,
        goal: 'Kiểm thử AI, tối ưu hiệu năng và chuẩn bị nghiệm thu.',
        status: 'PLANNED',
        start: 8,
        end: 21,
      },
    ];

    const sprintIds: string[] = [];
    for (const sprint of sprintDefinitions) {
      const id = randomUUID();
      sprintIds.push(id);
      const start = addDays(now, sprint.start);
      const end = addDays(now, sprint.end);
      await db.execute(
        `INSERT INTO sprints
          (id, project_id, name, goal, status, start_date, end_date, started_at,
           completed_at, created_by, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
        [
          id,
          projectId,
          sprint.name,
          sprint.goal,
          sprint.status,
          sqlDate(start),
          sqlDate(end),
          sprint.status === 'PLANNED' ? null : start,
          sprint.status === 'COMPLETED' ? end : null,
          creatorId,
        ],
      );
    }

    const titles = [
      'Phân tích yêu cầu và phạm vi hệ thống',
      'Thiết kế luồng đăng nhập và phân quyền',
      'Xây dựng API quản lý Workspace',
      'Hoàn thiện trang danh sách dự án',
      'Tạo quy trình quản lý thành viên',
      'Thiết kế Backlog theo Sprint',
      'Xây dựng bảng Kanban kéo thả',
      'Bổ sung bộ lọc công việc',
      'Hoàn thiện biểu đồ Burndown',
      'Tích hợp thông báo thời gian thực',
      'Tạo báo cáo tiến độ dự án',
      'Kiểm thử responsive trên màn hình nhỏ',
      'Tích hợp tóm tắt cuộc họp bằng AI',
      'Trích xuất Action Item từ transcript',
      'Cá nhân hóa báo cáo theo thành viên',
      'Hoàn thiện Project AI Assistant',
      'Kiểm thử câu hỏi đa nguồn dữ liệu',
      'Tối ưu truy vấn danh sách Task',
      'Rà soát bảo mật phiên đăng nhập',
      'Chuẩn bị dữ liệu thực nghiệm',
      'Đánh giá Precision Recall và F1',
      'Kiểm thử tải đồng thời API',
      'Hoàn thiện dashboard quan sát hệ thống',
      'Chuẩn bị kịch bản nghiệm thu đồ án',
    ];

    const sprintStatuses = [
      ...Array(8).fill('DONE'),
      ...Array(4).fill('IN_PROGRESS'),
      ...Array(4).fill('REVIEW'),
      ...Array(8).fill('TODO'),
      ...Array(4).fill('DONE'),
      ...Array(4).fill('IN_PROGRESS'),
      ...Array(4).fill('TODO'),
    ];

    for (let index = 0; index < sprintStatuses.length; index += 1) {
      const sprintIndex = Math.floor(index / 12);
      const status = sprintStatuses[index];
      const memberId = String(members[index % members.length].user_id);
      const completedAt = status === 'DONE' ? addDays(now, -20 + index) : null;
      const startedAt = ['IN_PROGRESS', 'REVIEW', 'DONE'].includes(status)
        ? addDays(now, -8 + (index % 7))
        : null;
      await insertTask({
        db,
        projectId,
        sprintId: sprintIds[sprintIndex],
        code: `${TASK_PREFIX}${String(index + 1).padStart(3, '0')}`,
        title: titles[index % titles.length],
        status,
        workflowStatusId: workflowIds.get(status)!,
        assigneeId: memberId,
        creatorId,
        dueDate: sqlDate(addDays(now, sprintIndex * 10 + (index % 9) - 3)),
        completedAt,
        startedAt,
        index,
      });
    }

    for (let index = 0; index < 12; index += 1) {
      const assigneeId = index % 4 === 0
        ? null
        : String(members[index % members.length].user_id);
      await insertTask({
        db,
        projectId,
        sprintId: null,
        code: `${TASK_PREFIX}B${String(index + 1).padStart(2, '0')}`,
        title: `[Backlog] ${titles[(index + 5) % titles.length]}`,
        status: 'BACKLOG',
        workflowStatusId: workflowIds.get('BACKLOG')!,
        assigneeId,
        creatorId,
        dueDate: sqlDate(addDays(now, 12 + index)),
        completedAt: null,
        startedAt: null,
        index: index + 36,
      });
    }

    await db.commit();

    const [summary] = await db.execute<RowDataPacket[]>(
      `SELECT COALESCE(s.name, 'Backlog chưa gán Sprint') AS bucket,
              t.status, COUNT(*) AS total
       FROM tasks t LEFT JOIN sprints s ON s.id = t.sprint_id
       WHERE t.project_id = ? AND t.task_code LIKE ? AND t.deleted_at IS NULL
       GROUP BY s.name, t.status ORDER BY s.name, t.status`,
      [projectId, `${TASK_PREFIX}%`],
    );
    console.table(summary);
  } catch (error) {
    await db.rollback();
    throw error;
  } finally {
    await db.end();
  }
}

async function insertTask(input: {
  db: Awaited<ReturnType<typeof createConnection>>;
  projectId: string;
  sprintId: string | null;
  code: string;
  title: string;
  status: string;
  workflowStatusId: string;
  assigneeId: string | null;
  creatorId: string;
  dueDate: string;
  completedAt: Date | null;
  startedAt: Date | null;
  index: number;
}) {
  await input.db.execute(
    `INSERT INTO tasks
      (id, project_id, sprint_id, task_code, title, description, labels,
       acceptance_criteria, status, workflow_status_id, task_type, priority,
       parent_id, assignee_id, reporter_id, created_by, due_date,
       estimated_hours, story_points, completed_at, started_at, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'TASK', ?, NULL, ?, ?, ?, ?, ?, NULL, ?, ?, ?, ?)`,
    [
      randomUUID(),
      input.projectId,
      input.sprintId,
      input.code,
      input.title,
      'Dữ liệu mẫu phục vụ kiểm thử Backlog, Sprint, Board và báo cáo tiến độ.',
      JSON.stringify(input.index % 2 === 0 ? ['demo', 'frontend'] : ['demo', 'backend']),
      'Hoàn thành đúng yêu cầu, cập nhật trạng thái và được kiểm tra trên giao diện.',
      input.status,
      input.workflowStatusId,
      input.index % 9 === 0 ? 'HIGH' : input.index % 7 === 0 ? 'LOW' : 'MEDIUM',
      input.assigneeId,
      input.creatorId,
      input.creatorId,
      input.dueDate,
      2 + (input.index % 7),
      input.completedAt,
      input.startedAt,
      addDays(new Date(), -10 + (input.index % 8)),
      input.completedAt ?? input.startedAt ?? new Date(),
    ],
  );
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
