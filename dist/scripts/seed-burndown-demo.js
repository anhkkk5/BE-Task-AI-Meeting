"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv = __importStar(require("dotenv"));
const crypto_1 = require("crypto");
const promise_1 = require("mysql2/promise");
dotenv.config();
const DEMO_SPRINT_NAME = '[Demo] Sprint Burndown';
const DEMO_TASK_PREFIX = 'DEMO-BD-';
function toSqlDate(date) {
    return date.toISOString().slice(0, 10);
}
function daysFrom(base, offset) {
    const result = new Date(base);
    result.setUTCDate(result.getUTCDate() + offset);
    return result;
}
async function main() {
    const projectId = process.argv[2];
    if (!projectId) {
        throw new Error('Usage: npx ts-node src/scripts/seed-burndown-demo.ts <projectId>');
    }
    const connection = await (0, promise_1.createConnection)({
        host: process.env.MYSQL_HOST,
        port: Number(process.env.MYSQL_PORT) || 3306,
        user: process.env.MYSQL_USER,
        password: process.env.MYSQL_PASSWORD,
        database: process.env.MYSQL_DATABASE,
        ssl: process.env.MYSQL_SSL === 'true' ? { rejectUnauthorized: false } : undefined,
    });
    try {
        await connection.beginTransaction();
        const [projects] = await connection.execute('SELECT id, workspace_id, workflow_template_id FROM projects WHERE id = ? AND deleted_at IS NULL LIMIT 1', [projectId]);
        if (!projects.length)
            throw new Error(`Project not found: ${projectId}`);
        const [members] = await connection.execute(`SELECT wm.user_id
       FROM workspace_members wm
       JOIN users u ON u.id = wm.user_id
       WHERE wm.workspace_id = ? AND wm.status = 'ACTIVE'
       ORDER BY wm.created_at ASC`, [projects[0].workspace_id]);
        if (!members.length)
            throw new Error('Workspace has no active members');
        const [workflowStatuses] = await connection.execute(`SELECT id, status_key
       FROM workflow_statuses
       WHERE template_id = ? AND enabled = 1`, [projects[0].workflow_template_id]);
        const workflowStatusIds = new Map(workflowStatuses.map((item) => [String(item.status_key), String(item.id)]));
        for (const requiredStatus of ['TODO', 'IN_PROGRESS', 'REVIEW', 'DONE']) {
            if (!workflowStatusIds.has(requiredStatus)) {
                throw new Error(`Workflow status is missing: ${requiredStatus}`);
            }
        }
        const creatorId = String(members[0].user_id);
        const now = new Date();
        const startDate = daysFrom(now, -7);
        const endDate = daysFrom(now, 7);
        const [existingSprints] = await connection.execute('SELECT id FROM sprints WHERE project_id = ? AND name = ? AND deleted_at IS NULL LIMIT 1', [projectId, DEMO_SPRINT_NAME]);
        const sprintId = existingSprints.length
            ? String(existingSprints[0].id)
            : (0, crypto_1.randomUUID)();
        await connection.execute(`UPDATE sprints SET status = 'PLANNED', started_at = NULL
       WHERE project_id = ? AND status = 'ACTIVE' AND id <> ? AND deleted_at IS NULL`, [projectId, sprintId]);
        if (existingSprints.length) {
            await connection.execute(`UPDATE sprints
         SET status = 'ACTIVE', start_date = ?, end_date = ?, started_at = ?, completed_at = NULL
         WHERE id = ?`, [toSqlDate(startDate), toSqlDate(endDate), startDate, sprintId]);
        }
        else {
            await connection.execute(`INSERT INTO sprints
          (id, project_id, name, goal, status, start_date, end_date, started_at, completed_at, created_by, created_at, updated_at)
         VALUES (?, ?, ?, ?, 'ACTIVE', ?, ?, ?, NULL, ?, NOW(), NOW())`, [
                sprintId,
                projectId,
                DEMO_SPRINT_NAME,
                'Dữ liệu mẫu để kiểm tra Backlog, tiến độ Sprint và biểu đồ Burndown.',
                toSqlDate(startDate),
                toSqlDate(endDate),
                startDate,
                creatorId,
            ]);
        }
        const [existingTasks] = await connection.execute('SELECT COUNT(*) AS total FROM tasks WHERE project_id = ? AND task_code LIKE ? AND deleted_at IS NULL', [projectId, `${DEMO_TASK_PREFIX}%`]);
        if (Number(existingTasks[0].total) === 0) {
            const statuses = [
                ...Array(10).fill('DONE'),
                ...Array(7).fill('IN_PROGRESS'),
                ...Array(4).fill('REVIEW'),
                ...Array(7).fill('TODO'),
            ];
            const titles = [
                'Phân tích yêu cầu người dùng', 'Thiết kế luồng đăng nhập', 'Chuẩn hóa giao diện Dashboard',
                'Xây dựng API Workspace', 'Hoàn thiện phân quyền thành viên', 'Tối ưu truy vấn danh sách Task',
                'Viết kiểm thử dịch vụ Sprint', 'Tích hợp thông báo thời gian thực', 'Thiết kế biểu đồ Burndown',
                'Kiểm tra responsive Backlog', 'Xử lý kéo thả Task', 'Thêm bộ lọc theo trạng thái',
                'Thêm bộ lọc theo người nhận', 'Xuất báo cáo Excel', 'Xuất báo cáo PDF',
                'Tối ưu trạng thái loading', 'Kiểm thử quy trình tạo Sprint', 'Rà soát validation API',
                'Cập nhật tài liệu hướng dẫn', 'Kiểm thử trên màn hình nhỏ', 'Tối ưu khả năng truy cập',
                'Chuẩn hóa nhãn công việc', 'Bổ sung dữ liệu Daily Update', 'Rà soát bảo mật phiên đăng nhập',
                'Kiểm tra hiệu năng trang dự án', 'Hoàn thiện trạng thái Review', 'Chuẩn bị bản demo',
                'Nghiệm thu Sprint cùng nhóm',
            ];
            for (let index = 0; index < statuses.length; index += 1) {
                const status = statuses[index];
                const completedAt = status === 'DONE'
                    ? daysFrom(startDate, Math.min(6, Math.floor(index / 2) + 1))
                    : null;
                const startedAt = status === 'IN_PROGRESS' || status === 'REVIEW' || status === 'DONE'
                    ? daysFrom(startDate, Math.max(0, Math.floor(index / 3)))
                    : null;
                const assigneeId = String(members[index % members.length].user_id);
                await connection.execute(`INSERT INTO tasks
            (id, project_id, sprint_id, task_code, title, description, labels, acceptance_criteria,
             status, workflow_status_id, task_type, priority, parent_id, assignee_id, reporter_id,
             created_by, due_date, estimated_hours, story_points, completed_at, started_at,
             created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'TASK', ?, NULL, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [
                    (0, crypto_1.randomUUID)(), projectId, sprintId, `${DEMO_TASK_PREFIX}${String(index + 1).padStart(3, '0')}`,
                    titles[index], 'Dữ liệu mẫu phục vụ kiểm thử đầy đủ giao diện và biểu đồ tiến độ.',
                    JSON.stringify(index % 3 === 0 ? ['demo', 'frontend'] : ['demo', 'sprint']),
                    'Hoàn thành đúng yêu cầu và được kiểm tra trên giao diện.', status,
                    workflowStatusIds.get(status),
                    index % 7 === 0 ? 'HIGH' : index % 5 === 0 ? 'LOW' : 'MEDIUM',
                    assigneeId, creatorId, creatorId, toSqlDate(daysFrom(now, (index % 10) - 2)),
                    2 + (index % 6), [1, 2, 3, 5, 8][index % 5], completedAt, startedAt,
                    daysFrom(startDate, -2 + (index % 4)), completedAt ?? startedAt ?? now,
                ]);
            }
        }
        else {
            await connection.execute('UPDATE tasks SET sprint_id = ? WHERE project_id = ? AND task_code LIKE ? AND deleted_at IS NULL', [sprintId, projectId, `${DEMO_TASK_PREFIX}%`]);
        }
        await connection.commit();
        const [summary] = await connection.execute(`SELECT status, COUNT(*) AS total
       FROM tasks WHERE project_id = ? AND sprint_id = ? AND deleted_at IS NULL
       GROUP BY status ORDER BY status`, [projectId, sprintId]);
        console.log(`Demo sprint ready: ${DEMO_SPRINT_NAME}`);
        console.table(summary);
    }
    catch (error) {
        await connection.rollback();
        throw error;
    }
    finally {
        await connection.end();
    }
}
main().catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
});
//# sourceMappingURL=seed-burndown-demo.js.map