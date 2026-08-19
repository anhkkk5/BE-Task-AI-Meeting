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
const day = 86_400_000;
const at = (offset) => new Date(Date.now() + offset * day);
const sqlDate = (offset) => at(offset).toISOString().slice(0, 10);
async function main() {
    const db = await (0, promise_1.createConnection)({
        host: process.env.MYSQL_HOST, port: Number(process.env.MYSQL_PORT) || 3306,
        user: process.env.MYSQL_USER, password: process.env.MYSQL_PASSWORD,
        database: process.env.MYSQL_DATABASE,
        ssl: process.env.MYSQL_SSL === 'true' ? { rejectUnauthorized: false } : undefined,
    });
    try {
        const [users] = await db.execute(`SELECT id, full_name FROM users WHERE email LIKE 'demo.user%@agileflow.local' ORDER BY email`);
        if (users.length < 4)
            throw new Error('Run seed-full-demo.ts first.');
        const [templateRows] = await db.execute('SELECT id FROM workflow_templates WHERE is_system = 1 ORDER BY id LIMIT 1');
        const templateId = String(templateRows[0]?.id ?? '');
        const [statusRows] = await db.execute('SELECT id,status_key FROM workflow_statuses WHERE template_id=? AND enabled=1', [templateId]);
        const workflow = new Map(statusRows.map((row) => [String(row.status_key), String(row.id)]));
        await db.beginTransaction();
        let workspaces = 0;
        let memberships = 0;
        let projects = 0;
        let sprints = 0;
        let tasks = 0;
        for (let ownerIndex = 0; ownerIndex < users.length; ownerIndex += 1) {
            const ownerId = String(users[ownerIndex].id);
            for (let workspaceIndex = 0; workspaceIndex < 2; workspaceIndex += 1) {
                const slug = `demo-network-${ownerIndex + 1}-${workspaceIndex + 1}`;
                const [existing] = await db.execute('SELECT id FROM workspaces WHERE slug=? LIMIT 1', [slug]);
                if (existing.length)
                    continue;
                workspaces += 1;
                const workspaceId = (0, crypto_1.randomUUID)();
                await db.execute(`INSERT INTO workspaces (id,name,slug,description,owner_id,plan,status,created_at,updated_at)
           VALUES (?,?,?,?,?,'FREE','ACTIVE',NOW(),NOW())`, [workspaceId, `[Demo Network] ${users[ownerIndex].full_name} - Nhóm ${workspaceIndex + 1}`, slug, 'Workspace mẫu có thành viên được phân bổ chéo từ danh sách user demo.', ownerId]);
                const memberCount = 4 + ((ownerIndex + workspaceIndex) % 3);
                const selected = [ownerIndex];
                for (let step = 1; selected.length < memberCount; step += 1) {
                    const candidate = (ownerIndex + step * (workspaceIndex + 2)) % users.length;
                    if (!selected.includes(candidate))
                        selected.push(candidate);
                }
                for (let position = 0; position < selected.length; position += 1) {
                    const userId = String(users[selected[position]].id);
                    await db.execute(`INSERT INTO workspace_members (id,workspace_id,user_id,role,status,joined_at,daily_capacity_hours,unavailable_dates,created_at,updated_at)
             VALUES (?,?,?,?,'ACTIVE',NOW(),?,JSON_ARRAY(),NOW(),NOW())`, [(0, crypto_1.randomUUID)(), workspaceId, userId, position === 0 ? 'OWNER' : position === 1 ? 'PROJECT_MANAGER' : position === 2 ? 'SCRUM_MASTER' : 'MEMBER', 7 + (position % 3) * 0.5]);
                    memberships += 1;
                }
                projects += 1;
                const projectId = (0, crypto_1.randomUUID)();
                const key = `NW${ownerIndex + 1}${workspaceIndex + 1}`;
                await db.execute(`INSERT INTO projects (id,workspace_id,name,key_code,description,status,start_date,end_date,workflow_statuses,workflow_transitions,workflow_template_id,created_by,created_at,updated_at)
           VALUES (?,?,?,?,?,'ACTIVE',?,?,NULL,NULL,?,?,NOW(),NOW())`, [projectId, workspaceId, `[Demo] Dự án ${key}`, key, 'Dự án có backlog và công việc riêng trong từng Sprint.', sqlDate(-35), sqlDate(70), templateId, ownerId]);
                const sprintIds = [];
                for (let sprintIndex = 0; sprintIndex < 3; sprintIndex += 1) {
                    const sprintId = (0, crypto_1.randomUUID)();
                    sprintIds.push(sprintId);
                    sprints += 1;
                    const status = sprintIndex === 0 ? 'COMPLETED' : sprintIndex === 1 ? 'ACTIVE' : 'PLANNED';
                    const start = sprintIndex * 14 - 19;
                    await db.execute(`INSERT INTO sprints (id,project_id,name,goal,status,start_date,end_date,started_at,completed_at,created_by,created_at,updated_at)
             VALUES (?,?,?,?,?,?,?,${sprintIndex === 2 ? 'NULL' : '?'},${sprintIndex === 0 ? '?' : 'NULL'},?,NOW(),NOW())`, [sprintId, projectId, `[Demo] Sprint ${sprintIndex + 1}`, `Hoàn thành nhóm tính năng số ${sprintIndex + 1}`, status, sqlDate(start), sqlDate(start + 13), ...(sprintIndex === 2 ? [] : [at(start)]), ...(sprintIndex === 0 ? [at(start + 13)] : []), ownerId]);
                }
                const taskNames = ['Khảo sát yêu cầu', 'Thiết kế wireframe', 'Xây dựng API', 'Thiết kế database', 'Lập trình giao diện', 'Tích hợp dữ liệu', 'Viết unit test', 'Kiểm thử nghiệp vụ', 'Sửa lỗi hiển thị', 'Rà soát phân quyền', 'Viết tài liệu', 'Chuẩn bị trình diễn'];
                const taskRows = [];
                for (let sprintIndex = 0; sprintIndex < sprintIds.length; sprintIndex += 1) {
                    for (let taskIndex = 0; taskIndex < 15; taskIndex += 1) {
                        const activeStatuses = ['DONE', 'IN_PROGRESS', 'REVIEW', 'TODO', 'BACKLOG'];
                        const status = sprintIndex === 0 ? 'DONE' : sprintIndex === 2 ? (taskIndex < 9 ? 'BACKLOG' : 'TODO') : activeStatuses[taskIndex % activeStatuses.length];
                        const assigneeIndex = selected[taskIndex % selected.length];
                        const completedAt = status === 'DONE' ? at(-12 + (taskIndex % 7)) : null;
                        taskRows.push([(0, crypto_1.randomUUID)(), projectId, sprintIds[sprintIndex], `${key}-S${sprintIndex + 1}-${taskIndex + 1}`, `${taskNames[taskIndex % taskNames.length]} ${taskIndex + 1}`, `Công việc thuộc Backlog của Sprint ${sprintIndex + 1}.`, JSON.stringify(['demo-network', `sprint-${sprintIndex + 1}`]), 'Hoàn thành đúng yêu cầu nghiệp vụ.', status, workflow.get(status), 'TASK', taskIndex % 7 === 0 ? 'HIGH' : 'MEDIUM', null, String(users[assigneeIndex].id), ownerId, ownerId, sqlDate((sprintIndex - 1) * 14 + (taskIndex % 10)), 2 + taskIndex % 6, null, completedAt, ['BACKLOG', 'TODO'].includes(status) ? null : at(-10), at(-30 + taskIndex), new Date()]);
                        tasks += 1;
                    }
                }
                for (let backlogIndex = 0; backlogIndex < 10; backlogIndex += 1) {
                    taskRows.push([(0, crypto_1.randomUUID)(), projectId, null, `${key}-BL-${backlogIndex + 1}`, `[Product Backlog] ${taskNames[backlogIndex % taskNames.length]}`, 'Công việc chưa được lập kế hoạch vào Sprint.', JSON.stringify(['product-backlog', 'demo-network']), 'Sẵn sàng để đưa vào Sprint phù hợp.', 'BACKLOG', workflow.get('BACKLOG'), 'TASK', 'MEDIUM', null, String(users[selected[backlogIndex % selected.length]].id), ownerId, ownerId, null, 2 + backlogIndex % 5, null, null, null, new Date(), new Date()]);
                    tasks += 1;
                }
                await db.query(`INSERT INTO tasks (id,project_id,sprint_id,task_code,title,description,labels,acceptance_criteria,status,workflow_status_id,task_type,priority,parent_id,assignee_id,reporter_id,created_by,due_date,estimated_hours,story_points,completed_at,started_at,created_at,updated_at) VALUES ?`, [taskRows]);
            }
        }
        await db.commit();
        console.log({ workspaces, memberships, projects, sprints, tasks });
    }
    catch (error) {
        await db.rollback();
        throw error;
    }
    finally {
        await db.end();
    }
}
main().catch((error) => { console.error(error); process.exitCode = 1; });
//# sourceMappingURL=seed-user-workspace-network.js.map