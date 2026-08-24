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
const bcrypt = __importStar(require("bcrypt"));
const promise_1 = require("mysql2/promise");
dotenv.config();
const DEMO_TAG = '[Demo Data]';
const demoPassword = 'Demo@123456';
const day = 86_400_000;
const date = (offset = 0) => new Date(Date.now() + offset * day);
const sqlDate = (value) => value.toISOString().slice(0, 10);
async function main() {
    const db = await (0, promise_1.createConnection)({
        host: process.env.MYSQL_HOST,
        port: Number(process.env.MYSQL_PORT) || 3306,
        user: process.env.MYSQL_USER,
        password: process.env.MYSQL_PASSWORD,
        database: process.env.MYSQL_DATABASE,
        ssl: process.env.MYSQL_SSL === 'true'
            ? { rejectUnauthorized: false }
            : undefined,
    });
    try {
        const [alreadySeeded] = await db.execute('SELECT COUNT(*) total FROM workspaces WHERE slug LIKE ? AND deleted_at IS NULL', ['demo-data-%']);
        if (Number(alreadySeeded[0].total) > 0) {
            console.log('Full demo data already exists. Nothing was changed.');
            return;
        }
        const [owners] = await db.execute('SELECT id FROM users ORDER BY is_system_admin DESC, created_at ASC LIMIT 1');
        if (!owners.length)
            throw new Error('No user exists to own demo workspaces.');
        const ownerId = String(owners[0].id);
        const [templates] = await db.execute('SELECT workflow_template_id FROM projects WHERE workflow_template_id IS NOT NULL AND deleted_at IS NULL LIMIT 1');
        if (!templates.length)
            throw new Error('No workflow template found. Create one project first.');
        const workflowTemplateId = String(templates[0].workflow_template_id);
        const [workflowRows] = await db.execute('SELECT id, status_key FROM workflow_statuses WHERE template_id = ? AND enabled = 1', [workflowTemplateId]);
        const workflow = new Map(workflowRows.map((row) => [String(row.status_key), String(row.id)]));
        for (const status of ['BACKLOG', 'TODO', 'IN_PROGRESS', 'REVIEW', 'DONE']) {
            if (!workflow.has(status))
                throw new Error(`Workflow status missing: ${status}`);
        }
        await db.beginTransaction();
        const hash = await bcrypt.hash(demoPassword, 10);
        const people = [
            ['Nguyễn Minh Anh', 'Product Owner'],
            ['Trần Hoàng Nam', 'Project Manager'],
            ['Lê Thu Hà', 'UI/UX Designer'],
            ['Phạm Đức Long', 'Frontend Developer'],
            ['Vũ Khánh Linh', 'Backend Developer'],
            ['Đỗ Quang Huy', 'QA Engineer'],
            ['Bùi Ngọc Mai', 'Business Analyst'],
            ['Hoàng Tuấn Kiệt', 'DevOps Engineer'],
        ];
        const userIds = [];
        for (let i = 0; i < people.length; i += 1) {
            const id = (0, crypto_1.randomUUID)();
            userIds.push(id);
            await db.execute(`INSERT INTO users (id,email,full_name,avatar_url,phone_number,job_title,password_hash,status,is_system_admin,email_verified_at,mfa_enabled,created_at,updated_at)
         VALUES (?,?,?,NULL,?,?,?,'active',0,NOW(),0,NOW(),NOW())`, [
                id,
                `demo.user${i + 1}@agileflow.local`,
                people[i][0],
                `09000000${i + 1}`,
                people[i][1],
                hash,
            ]);
        }
        const workspaceNames = [
            'Phát triển sản phẩm',
            'Nền tảng nội bộ',
            'Mobile Experience',
        ];
        let projectCount = 0;
        let sprintCount = 0;
        let taskCount = 0;
        let meetingCount = 0;
        for (let w = 0; w < workspaceNames.length; w += 1) {
            const workspaceId = (0, crypto_1.randomUUID)();
            await db.execute(`INSERT INTO workspaces (id,name,slug,description,owner_id,plan,status,created_at,updated_at)
         VALUES (?,?,?,?,?,'FREE','ACTIVE',NOW(),NOW())`, [
                workspaceId,
                `${DEMO_TAG} ${workspaceNames[w]}`,
                `demo-data-${w + 1}`,
                'Không gian dữ liệu mẫu đầy đủ để kiểm thử giao diện.',
                ownerId,
            ]);
            const memberIds = [ownerId, ...userIds.slice(w, w + 6)];
            for (let m = 0; m < memberIds.length; m += 1) {
                await db.execute(`INSERT INTO workspace_members (id,workspace_id,user_id,role,status,joined_at,daily_capacity_hours,unavailable_dates,created_at,updated_at)
           VALUES (?,?,?,?,'ACTIVE',NOW(),?,JSON_ARRAY(),NOW(),NOW())`, [
                    (0, crypto_1.randomUUID)(),
                    workspaceId,
                    memberIds[m],
                    m === 0
                        ? 'OWNER'
                        : m === 1
                            ? 'PROJECT_MANAGER'
                            : m === 2
                                ? 'SCRUM_MASTER'
                                : 'MEMBER',
                    7 + (m % 3) * 0.5,
                ]);
            }
            for (let p = 0; p < 2; p += 1) {
                projectCount += 1;
                const projectId = (0, crypto_1.randomUUID)();
                const key = `D${w + 1}${p + 1}`;
                await db.execute(`INSERT INTO projects (id,workspace_id,name,key_code,description,status,start_date,end_date,workflow_statuses,workflow_transitions,workflow_template_id,created_by,created_at,updated_at)
           VALUES (?,?,?,?,?,'ACTIVE',?,?,NULL,NULL,?,?,NOW(),NOW())`, [
                    projectId,
                    workspaceId,
                    `${DEMO_TAG} ${p ? 'Cổng quản trị' : 'Ứng dụng khách hàng'} ${w + 1}`,
                    key,
                    'Dự án mẫu có đầy đủ sprint, task, cuộc họp và báo cáo hằng ngày.',
                    sqlDate(date(-45)),
                    sqlDate(date(60)),
                    workflowTemplateId,
                    ownerId,
                ]);
                const sprintIds = [];
                for (let s = 0; s < 3; s += 1) {
                    sprintCount += 1;
                    const sprintId = (0, crypto_1.randomUUID)();
                    sprintIds.push(sprintId);
                    const status = s === 0 ? 'COMPLETED' : s === 1 ? 'ACTIVE' : 'PLANNED';
                    const startOffset = (s - 1) * 14 - 5;
                    await db.execute(`INSERT INTO sprints (id,project_id,name,goal,status,start_date,end_date,started_at,completed_at,created_by,created_at,updated_at)
             VALUES (?,?,?,?,?,?,?,${s === 2 ? 'NULL' : '?'},${s === 0 ? '?' : 'NULL'},?,NOW(),NOW())`, [
                        sprintId,
                        projectId,
                        `${DEMO_TAG} Sprint ${s + 1}`,
                        `Hoàn thành nhóm chức năng giai đoạn ${s + 1}`,
                        status,
                        sqlDate(date(startOffset)),
                        sqlDate(date(startOffset + 13)),
                        ...(s === 2 ? [] : [date(startOffset)]),
                        ...(s === 0 ? [date(startOffset + 13)] : []),
                        ownerId,
                    ]);
                }
                const taskIds = [];
                const titles = [
                    'Phân tích yêu cầu',
                    'Thiết kế giao diện',
                    'Xây dựng API',
                    'Tích hợp đăng nhập',
                    'Quản lý phân quyền',
                    'Tối ưu truy vấn',
                    'Viết kiểm thử',
                    'Kiểm tra responsive',
                    'Tạo thông báo',
                    'Xuất báo cáo',
                    'Rà soát bảo mật',
                    'Chuẩn bị demo',
                ];
                for (let t = 0; t < 36; t += 1) {
                    taskCount += 1;
                    const taskId = (0, crypto_1.randomUUID)();
                    taskIds.push(taskId);
                    const sprintIndex = Math.floor(t / 12);
                    const activeStatuses = [
                        'DONE',
                        'DONE',
                        'IN_PROGRESS',
                        'REVIEW',
                        'TODO',
                        'TODO',
                    ];
                    const status = sprintIndex === 0
                        ? 'DONE'
                        : sprintIndex === 2
                            ? t % 3
                                ? 'BACKLOG'
                                : 'TODO'
                            : activeStatuses[t % activeStatuses.length];
                    const completedAt = status === 'DONE' ? date(-10 + (t % 8)) : null;
                    await db.execute(`INSERT INTO tasks (id,project_id,sprint_id,task_code,title,description,labels,acceptance_criteria,status,workflow_status_id,task_type,priority,parent_id,assignee_id,reporter_id,created_by,due_date,estimated_hours,story_points,completed_at,started_at,created_at,updated_at)
             VALUES (?,?,?,?,?,?,?, ?,?,?, 'TASK',?,NULL,?,?,?, ?,?,NULL,?,?,?,NOW())`, [
                        taskId,
                        projectId,
                        sprintIds[sprintIndex],
                        `${key}-${t + 1}`,
                        `${titles[t % titles.length]} #${Math.floor(t / titles.length) + 1}`,
                        'Công việc demo dùng để kiểm thử đầy đủ các màn hình.',
                        JSON.stringify(['demo', t % 2 ? 'backend' : 'frontend']),
                        'Đáp ứng yêu cầu và được kiểm thử.',
                        status,
                        workflow.get(status),
                        t % 9 === 0 ? 'URGENT' : t % 4 === 0 ? 'HIGH' : 'MEDIUM',
                        memberIds[1 + (t % (memberIds.length - 1))],
                        ownerId,
                        ownerId,
                        sqlDate(date((t % 14) - 4)),
                        2 + (t % 6),
                        completedAt,
                        status === 'BACKLOG' || status === 'TODO'
                            ? null
                            : date(-12 + (t % 6)),
                        date(-25 + (t % 12)),
                    ]);
                }
                for (let m = 0; m < 8; m += 1) {
                    meetingCount += 1;
                    const meetingId = (0, crypto_1.randomUUID)();
                    const type = [
                        'DAILY_SCRUM',
                        'SPRINT_PLANNING',
                        'SPRINT_REVIEW',
                        'RETROSPECTIVE',
                    ][m % 4];
                    const meetingStatus = m < 5 ? 'COMPLETED' : m < 7 ? 'SCHEDULED' : 'IN_PROGRESS';
                    await db.execute(`INSERT INTO meetings (id,workspace_id,project_id,sprint_id,title,description,meeting_type,meeting_date,start_time,end_time,actual_start_time,actual_end_time,auto_completed,status,created_by,mongo_transcript_id,mongo_summary_id,created_at,updated_at)
             VALUES (?,?,?,?,?,?,?,?,?,?,?,?,0,?,?,NULL,NULL,NOW(),NOW())`, [
                        meetingId,
                        workspaceId,
                        projectId,
                        sprintIds[1],
                        `${DEMO_TAG} ${type.replaceAll('_', ' ')} ${m + 1}`,
                        'Cuộc họp mẫu của nhóm dự án.',
                        type,
                        sqlDate(date(m - 5)),
                        date(m - 5),
                        date(m - 5 + 1 / 24),
                        meetingStatus === 'COMPLETED' ? date(m - 5) : null,
                        meetingStatus === 'COMPLETED' ? date(m - 5 + 1 / 24) : null,
                        meetingStatus,
                        ownerId,
                    ]);
                    for (let u = 0; u < Math.min(5, memberIds.length); u += 1)
                        await db.execute(`INSERT INTO meeting_participants (id,meeting_id,user_id,role,attended,created_at,updated_at) VALUES (?,?,?,? ,?,NOW(),NOW())`, [
                            (0, crypto_1.randomUUID)(),
                            meetingId,
                            memberIds[u],
                            u === 0 ? 'HOST' : 'PARTICIPANT',
                            meetingStatus === 'COMPLETED' ? 1 : 0,
                        ]);
                }
                for (let d = 0; d < 7; d += 1)
                    for (let u = 0; u < Math.min(5, memberIds.length); u += 1)
                        await db.execute(`INSERT INTO daily_updates (id,workspace_id,project_id,sprint_id,user_id,update_date,yesterday_work,today_plan,blockers,need_help_from_id,notes,mood,created_at,updated_at)
           VALUES (?,?,?,?,?,?,?,?,?,?,?, ?,NOW(),NOW())`, [
                            (0, crypto_1.randomUUID)(),
                            workspaceId,
                            projectId,
                            sprintIds[1],
                            memberIds[u],
                            sqlDate(date(-d)),
                            'Đã hoàn thành các công việc được giao.',
                            'Tiếp tục xử lý task trong Sprint.',
                            d === 2 && u === 2 ? 'Đang chờ xác nhận yêu cầu.' : null,
                            d === 2 && u === 2 ? memberIds[1] : null,
                            `${DEMO_TAG} cập nhật hằng ngày`,
                            d === 2 && u === 2
                                ? 'BLOCKED'
                                : d % 3 === 0
                                    ? 'GOOD'
                                    : 'NORMAL',
                        ]);
                for (let h = 0; h < 4; h += 1)
                    await db.execute(`INSERT INTO shift_handovers (id,workspace_id,project_id,task_id,sender_id,receiver_id,title,summary,completed_work,remaining_work,blockers,next_steps,reference_links,due_at,status,submitted_at,acknowledged_at,created_at,updated_at)
           VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?, ?,?,NOW(),NOW())`, [
                        (0, crypto_1.randomUUID)(),
                        workspaceId,
                        projectId,
                        taskIds[14 + h],
                        memberIds[1 + h],
                        memberIds[2 + h],
                        `${DEMO_TAG} Bàn giao ${h + 1}`,
                        'Bàn giao công việc đang thực hiện.',
                        'Đã hoàn thành phần phân tích.',
                        'Cần hoàn thiện và kiểm thử.',
                        h === 2 ? 'Chờ API liên quan.' : null,
                        'Đọc tài liệu và tiếp tục triển khai.',
                        'https://example.com/demo',
                        date(3 + h),
                        h < 2 ? 'ACKNOWLEDGED' : 'PENDING',
                        date(-h),
                        h < 2 ? date(-h + 0.1) : null,
                    ]);
            }
        }
        for (const recipientId of [ownerId, ...userIds])
            for (let n = 0; n < 6; n += 1)
                await db.execute(`INSERT INTO notifications (id,recipient_id,type,title,body,link,metadata,idempotency_key,read_at,archived_at,created_at)
       VALUES (?,?,?,?,?,?,?, ?,?,NULL,?)`, [
                    (0, crypto_1.randomUUID)(),
                    recipientId,
                    ['TASK_ASSIGNED', 'TASK_DUE_SOON', 'MEETING_INVITED'][n % 3],
                    `${DEMO_TAG} Thông báo ${n + 1}`,
                    'Thông báo dữ liệu mẫu để kiểm thử trung tâm thông báo.',
                    '/dashboard',
                    JSON.stringify({ demo: true }),
                    `full-demo-${recipientId}-${n}`,
                    n < 2 ? date(-n) : null,
                    date(-n),
                ]);
        await db.commit();
        console.log({
            users: userIds.length,
            workspaces: workspaceNames.length,
            projects: projectCount,
            sprints: sprintCount,
            tasks: taskCount,
            meetings: meetingCount,
        });
        console.log(`Demo accounts use password: ${demoPassword}`);
    }
    catch (error) {
        await db.rollback();
        throw error;
    }
    finally {
        await db.end();
    }
}
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
//# sourceMappingURL=seed-full-demo.js.map