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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv = __importStar(require("dotenv"));
const crypto_1 = require("crypto");
const mongoose_1 = __importDefault(require("mongoose"));
const promise_1 = require("mysql2/promise");
dotenv.config();
const PROJECT_ID = '5ef9db11-d6eb-4406-9e69-03b91a4b2d19';
const MEETING_TITLE = '[Demo AI] Rà soát Sprint, rủi ro và kế hoạch phát hành';
const turns = [
    { speaker: 'nta', text: 'Chào mọi người, hôm nay mình rà soát tiến độ Sprint, các điểm nghẽn và kế hoạch phát hành của dự án tests lại.' },
    { speaker: 'abcd2', text: 'Vâng. Trước khi bắt đầu, sáng nay đường mưa nên mình đến hơi muộn năm phút.' },
    { speaker: 'nta', text: 'Không sao. Về công việc, API đăng nhập đã hoàn thành phần xác thực JWT nhưng còn thiếu kiểm thử trường hợp refresh token hết hạn.' },
    { speaker: 'abcd2', text: 'Giao diện đăng nhập đã nối được API, tuy nhiên thông báo lỗi trên màn hình điện thoại vẫn bị lệch.' },
    { speaker: 'nta', text: 'Anh Nam hoàn thành API đăng nhập và kiểm thử refresh token trước ngày 28/08/2026.' },
    { speaker: 'abcd2', text: 'Tôi nhận phần responsive. abcd2 hoàn thiện giao diện đăng nhập trên màn hình nhỏ trước ngày 29/08/2026.' },
    { speaker: 'nta', text: 'Quyết định thứ nhất: bản phát hành này tiếp tục dùng JWT access token mười phút và refresh token bảy ngày.' },
    { speaker: 'abcd2', text: 'Trưa nay mọi người ăn cơm ở quán cũ không? Tôi thấy quán mới gần trường cũng khá ngon.' },
    { speaker: 'nta', text: 'Để cuối buổi bàn chuyện ăn trưa. Kết nối TiDB đôi lúc chậm khi Render vừa khởi động lại, cần thêm retry có backoff.' },
    { speaker: 'abcd2', text: 'Log lần gần nhất cho thấy lần đầu kết nối thất bại, lần thứ hai thành công sau khoảng hai giây.' },
    { speaker: 'nta', text: 'nta rà soát cấu hình TLS và bổ sung tối đa ba lần retry kết nối TiDB trước ngày 27/08/2026.' },
    { speaker: 'abcd2', text: 'Phần danh sách Workspace đã ổn, avatar lấy từ Cloudinary cũng hiển thị đúng ở header.' },
    { speaker: 'nta', text: 'Ở Backlog, avatar người nhận phải dùng ảnh thật nếu có, chỉ dùng chữ cái khi ảnh lỗi hoặc không có ảnh.' },
    { speaker: 'abcd2', text: 'Tối qua đội bóng tôi thích thắng hai một, hiệp hai đá khá hay.' },
    { speaker: 'nta', text: 'Quay lại Sprint nhé. Hiện còn các nhóm việc: cuộc họp, báo cáo AI, bàn giao ca và kiểm thử phân quyền.' },
    { speaker: 'abcd2', text: 'Luồng tạo cuộc họp đã hoạt động: tạo lịch, chọn người tham gia, nhập transcript và kết thúc cuộc họp.' },
    { speaker: 'nta', text: 'Vấn đề là cần kiểm tra AI có bỏ qua hội thoại ngoài lề nhưng vẫn giữ đúng quyết định và nhiệm vụ hay không.' },
    { speaker: 'abcd2', text: 'abcd2 viết bộ E2E cho tạo cuộc họp, lưu transcript và kết thúc cuộc họp trước ngày 30/08/2026.' },
    { speaker: 'nta', text: 'Bộ E2E phải xác minh cả tóm tắt chung, tóm tắt cá nhân và danh sách action item.' },
    { speaker: 'abcd2', text: 'Cuối tuần này có phim mới, nếu xong bài sớm tôi định đi xem tối thứ bảy.' },
    { speaker: 'nta', text: 'Về AI, dự án thống nhất dùng OpenAI cho tóm tắt, trích xuất action item, báo cáo và trợ lý dự án.' },
    { speaker: 'abcd2', text: 'Mỗi người dùng bị giới hạn năm yêu cầu mỗi phút để tránh spam và kiểm soát chi phí.' },
    { speaker: 'nta', text: 'Quyết định thứ hai: không hiển thị Story Point và Velocity trên dashboard mặc định; thống kê theo số công việc.' },
    { speaker: 'abcd2', text: 'Burndown sẽ dùng số công việc còn lại theo ngày, người dùng phổ thông sẽ dễ hiểu hơn.' },
    { speaker: 'nta', text: 'abcd2 cập nhật nhãn biểu đồ và loại toàn bộ chữ Story Point khỏi trang thống kê trước ngày 31/08/2026.' },
    { speaker: 'abcd2', text: 'Hôm nay cà phê hơi đắng, lần sau chắc tôi gọi ít cà phê và thêm sữa.' },
    { speaker: 'nta', text: 'Phần phân quyền cần giữ ba lớp: System Admin, Workspace Owner hoặc Admin, và Member.' },
    { speaker: 'abcd2', text: 'Member chỉ được xem dự án mình tham gia và cập nhật công việc được giao; không được sửa Workspace.' },
    { speaker: 'nta', text: 'nta kiểm tra RBAC và multi-tenancy bằng hai tài khoản thuộc hai Workspace khác nhau trước ngày 01/09/2026.' },
    { speaker: 'abcd2', text: 'Tôi sẽ bổ sung trường hợp người dùng đoán ID của Workspace khác và API phải trả về 403.' },
    { speaker: 'nta', text: 'Về dữ liệu cuộc họp, transcript gốc phải được giữ đầy đủ để làm bằng chứng, kể cả câu nói ngoài công việc.' },
    { speaker: 'abcd2', text: 'Nhưng phần tóm tắt AI chỉ nên đưa mục tiêu, tiến độ, quyết định, rủi ro và hành động tiếp theo.' },
    { speaker: 'nta', text: 'Đúng. Action item chỉ được tạo khi có nhiệm vụ đủ rõ, không biến câu chuyện ăn trưa hoặc xem phim thành công việc.' },
    { speaker: 'abcd2', text: 'Hôm nay là sinh nhật một người bạn của tôi, sau giờ làm tôi phải ghé mua bánh.' },
    { speaker: 'nta', text: 'Rủi ro hiện tại gồm Render cold start, giới hạn tín dụng OpenAI và dữ liệu đánh giá action item chưa đủ lớn.' },
    { speaker: 'abcd2', text: 'Dataset đánh giá đã có ground truth, nhưng cần chạy lại Precision, Recall và F1 sau khi đổi model.' },
    { speaker: 'nta', text: 'nta chạy bộ đánh giá action item và lưu kết quả Precision, Recall, F1 trước ngày 02/09/2026.' },
    { speaker: 'abcd2', text: 'abcd2 chuẩn bị năm câu hỏi cross-source về Task, Sprint, Meeting và Action Item trước ngày 02/09/2026.' },
    { speaker: 'nta', text: 'Câu hỏi mẫu là: công việc nào quá hạn được nhắc trong cuộc họp gần nhất và ai đang phụ trách.' },
    { speaker: 'abcd2', text: 'Trợ lý phải hỏi lại Workspace, Project hoặc Sprint nếu câu hỏi chưa đủ ngữ cảnh.' },
    { speaker: 'nta', text: 'Quyết định thứ ba: triển khai bản staging vào tối 30/08/2026 sau khi E2E meeting vượt qua.' },
    { speaker: 'abcd2', text: 'Nếu kiểm thử thất bại thì không phát hành, tạo bug trong Backlog và thông báo cho chủ dự án.' },
    { speaker: 'nta', text: 'abcd2 tổng hợp checklist staging gồm đăng nhập, Backlog, Board, Meeting, AI Report và Project Assistant trước ngày 30/08/2026.' },
    { speaker: 'abcd2', text: 'Ngày mai thời tiết dự báo vẫn mưa, mọi người nhớ mang áo mưa.' },
    { speaker: 'nta', text: 'Tổng kết: ưu tiên API đăng nhập, responsive, retry TiDB, E2E meeting, RBAC và đánh giá AI.' },
    { speaker: 'abcd2', text: 'Tôi xác nhận các đầu việc của mình và sẽ cập nhật tiến độ trong Daily Update mỗi chiều.' },
    { speaker: 'nta', text: 'Cuộc họp kết thúc. Các nhiệm vụ có hạn chót phải được theo dõi trong Backlog và nhắc khi quá hạn.' },
];
async function main() {
    const db = await (0, promise_1.createConnection)({
        host: process.env.MYSQL_HOST,
        port: Number(process.env.MYSQL_PORT) || 3306,
        user: process.env.MYSQL_USER,
        password: process.env.MYSQL_PASSWORD,
        database: process.env.MYSQL_DATABASE,
        ssl: process.env.MYSQL_SSL === 'true' ? { rejectUnauthorized: false } : undefined,
    });
    if (!process.env.MONGODB_URI)
        throw new Error('MONGODB_URI is required');
    await mongoose_1.default.connect(process.env.MONGODB_URI);
    try {
        const [projects] = await db.execute(`SELECT id, workspace_id, created_by FROM projects
       WHERE id = ? AND deleted_at IS NULL LIMIT 1`, [PROJECT_ID]);
        if (!projects.length)
            throw new Error(`Project not found: ${PROJECT_ID}`);
        const project = projects[0];
        const [members] = await db.execute(`SELECT wm.user_id, u.full_name, u.email
       FROM workspace_members wm
       INNER JOIN users u ON u.id = wm.user_id
       WHERE wm.workspace_id = ? AND wm.status = 'ACTIVE' AND u.deleted_at IS NULL
       ORDER BY CASE WHEN u.full_name IN ('nta', 'abcd2') THEN 0 ELSE 1 END, wm.created_at ASC`, [project.workspace_id]);
        if (members.length < 2)
            throw new Error('At least two active members are required');
        const selectedMembers = members.slice(0, 2);
        const userByName = new Map(selectedMembers.map((member) => [String(member.full_name), String(member.user_id)]));
        const [existingMeetings] = await db.execute(`SELECT id FROM meetings WHERE project_id = ? AND title = ? AND deleted_at IS NULL LIMIT 1`, [PROJECT_ID, MEETING_TITLE]);
        const meetingId = existingMeetings.length ? String(existingMeetings[0].id) : (0, crypto_1.randomUUID)();
        const now = new Date();
        const endTime = new Date(now.getTime() + 60 * 60 * 1000);
        await db.beginTransaction();
        if (!existingMeetings.length) {
            await db.execute(`INSERT INTO meetings
         (id, workspace_id, project_id, sprint_id, title, description, meeting_type,
          meeting_date, start_time, end_time, actual_start_time, actual_end_time,
          auto_completed, status, created_by, mongo_transcript_id, mongo_summary_id,
          created_at, updated_at)
         VALUES (?, ?, ?, NULL, ?, ?, 'SPRINT_REVIEW', ?, ?, ?, ?, NULL, 0,
                 'IN_PROGRESS', ?, NULL, NULL, NOW(), NOW())`, [meetingId, project.workspace_id, PROJECT_ID, MEETING_TITLE,
                'Cuộc họp dữ liệu mẫu để kiểm thử AI lọc hội thoại ngoài lề, tóm tắt và trích xuất action item.',
                now.toISOString().slice(0, 10), now, endTime, now, project.created_by]);
        }
        else {
            await db.execute(`UPDATE meetings SET status = 'IN_PROGRESS', actual_start_time = ?, actual_end_time = NULL,
         end_time = ?, auto_completed = 0, mongo_summary_id = NULL, updated_at = NOW() WHERE id = ?`, [now, endTime, meetingId]);
            await db.execute(`DELETE FROM meeting_participants WHERE meeting_id = ?`, [meetingId]);
        }
        for (const [index, member] of selectedMembers.entries()) {
            await db.execute(`INSERT INTO meeting_participants
         (id, meeting_id, user_id, role, attended, created_at, updated_at)
         VALUES (?, ?, ?, ?, 1, NOW(), NOW())`, [(0, crypto_1.randomUUID)(), meetingId, member.user_id, index === 0 ? 'HOST' : 'PARTICIPANT']);
        }
        const collection = mongoose_1.default.connection.collection('meeting_transcripts');
        await collection.deleteMany({ meetingId });
        const liveSegments = turns.map((turn, index) => ({
            chunkId: `demo-ai-${String(index + 1).padStart(3, '0')}`,
            userId: userByName.get(turn.speaker),
            speakerName: turn.speaker,
            text: turn.text,
            startedAt: new Date(now.getTime() + index * 45_000),
            endedAt: new Date(now.getTime() + index * 45_000 + 30_000),
            confidence: 0.98,
            source: 'seeded-transcript',
        }));
        const rawTranscript = turns.map((turn) => `${turn.speaker}: ${turn.text}`).join('\n');
        const transcript = await collection.insertOne({
            meetingId,
            workspaceId: String(project.workspace_id),
            projectId: PROJECT_ID,
            sprintId: null,
            rawTranscript,
            speakers: selectedMembers.map((member) => ({
                userId: String(member.user_id),
                speakerName: String(member.full_name || member.email),
                text: turns.filter((turn) => turn.speaker === member.full_name).map((turn) => turn.text).join('\n'),
            })),
            liveSegments,
            createdBy: String(project.created_by),
            createdAt: now,
            updatedAt: now,
        });
        await db.execute(`UPDATE meetings SET mongo_transcript_id = ?, updated_at = NOW() WHERE id = ?`, [
            transcript.insertedId.toString(), meetingId,
        ]);
        await db.commit();
        console.log(JSON.stringify({
            meetingId,
            title: MEETING_TITLE,
            participants: selectedMembers.map((member) => member.full_name || member.email),
            transcriptTurns: turns.length,
            transcriptCharacters: rawTranscript.length,
            mongoTranscriptId: transcript.insertedId.toString(),
            status: 'IN_PROGRESS',
        }, null, 2));
    }
    catch (error) {
        await db.rollback();
        throw error;
    }
    finally {
        await db.end();
        await mongoose_1.default.disconnect();
    }
}
void main().catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
});
//# sourceMappingURL=seed-meeting-ai-transcript.js.map