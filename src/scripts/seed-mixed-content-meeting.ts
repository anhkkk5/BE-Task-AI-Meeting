import 'dotenv/config';
import { randomUUID } from 'node:crypto';
import mongoose from 'mongoose';
import dataSource from '../database/mysql/data-source';
import { mongodbConfig } from '../config/mongodb.config';
import {
  MeetingTranscript,
  MeetingTranscriptSchema,
} from '../modules/meetings/schemas/meeting-transcript.schema';

const workspaceId =
  process.env.SEED_MEETING_WORKSPACE_ID ??
  'efef3f78-e908-4bb4-93cf-2f9e70f8cdff';
const projectId =
  process.env.SEED_MEETING_PROJECT_ID ??
  '5ef9db11-d6eb-4406-9e69-03b91a4b2d19';
const marker = '[AI_SUMMARY_MIXED_CONTENT_TEST]';

type MemberRow = {
  user_id: string;
  role: string;
  full_name: string;
  email: string;
};

async function main() {
  const mongo = mongodbConfig();
  if (!mongo.enabled) throw new Error('MONGODB_ENABLED must be true');

  await dataSource.initialize();
  const projectRows = await dataSource.query<
    Array<{ id: string; name: string; workspace_id: string }>
  >(
    'SELECT id, name, workspace_id FROM projects WHERE id = ? AND workspace_id = ? AND deleted_at IS NULL LIMIT 1',
    [projectId, workspaceId],
  );
  if (!projectRows.length) throw new Error('Target project was not found');

  const members = await dataSource.query<MemberRow[]>(
    `SELECT wm.user_id, wm.role, u.full_name, u.email
     FROM workspace_members wm
     JOIN users u ON u.id = wm.user_id
     WHERE wm.workspace_id = ?
     ORDER BY CASE wm.role WHEN 'OWNER' THEN 0 ELSE 1 END, wm.created_at ASC
     LIMIT 4`,
    [workspaceId],
  );
  if (!members.length) throw new Error('No active workspace member was found');

  const host = members[0];
  const teammate = members[1] ?? members[0];
  const title = `${marker} Họp rà soát tiến độ và chuẩn bị phát hành`;
  const existing = await dataSource.query<Array<{ id: string }>>(
    'SELECT id FROM meetings WHERE project_id = ? AND title = ? AND deleted_at IS NULL LIMIT 1',
    [projectId, title],
  );
  if (existing.length) {
    console.log(JSON.stringify({ meetingId: existing[0].id, reused: true }));
    return;
  }

  const meetingId = randomUUID();
  const now = new Date();
  const meetingDate = now.toISOString().slice(0, 10);
  const startTime = new Date(now.getTime() - 45 * 60_000);
  const endTime = new Date(now.getTime() - 5 * 60_000);
  const speakers = [
    {
      userId: host.user_id,
      speakerName: host.full_name,
      text: 'Mình bắt đầu nhé. Mục tiêu hôm nay là chốt phạm vi bản phát hành cuối tuần và xem các blocker còn lại.',
    },
    {
      userId: teammate.user_id,
      speakerName: teammate.full_name,
      text: 'API đăng nhập và phân quyền đã hoàn thành. Phần refresh token đã có test, nhưng màn hình quản lý phiên đăng nhập còn thiếu trạng thái loading.',
    },
    {
      userId: host.user_id,
      speakerName: host.full_name,
      text: 'Thống nhất ưu tiên hoàn thiện trạng thái loading trước 16 giờ thứ Năm. Bạn phụ trách và gửi pull request cho mình review.',
    },
    {
      userId: teammate.user_id,
      speakerName: teammate.full_name,
      text: 'Được. Task board còn lỗi kéo task từ Review sang Done khi task có dependency chưa hoàn thành. Đây đang là blocker cho demo.',
    },
    {
      userId: host.user_id,
      speakerName: host.full_name,
      text: 'Quyết định không cho chuyển sang Done nếu dependency chưa hoàn thành. Backend phải trả thông báo rõ task nào đang chặn.',
    },
    {
      userId: teammate.user_id,
      speakerName: teammate.full_name,
      text: 'Mình sẽ sửa validation dependency và bổ sung test trước 11 giờ thứ Sáu. Sau đó nhờ bạn kiểm tra lại luồng trên board.',
    },
    {
      userId: host.user_id,
      speakerName: host.full_name,
      text: 'Về báo cáo AI, hôm qua summary đang gom cả câu chào hỏi vào key point. Lần kiểm thử này cần xem AI có tách được nội dung ngoài lề không.',
    },
    {
      userId: teammate.user_id,
      speakerName: teammate.full_name,
      text: 'À cuối tuần mọi người có đi uống cà phê không? Quán mới dưới công ty nghe nói bánh ngon nhưng gửi xe hơi khó.',
    },
    {
      userId: host.user_id,
      speakerName: host.full_name,
      text: 'Mình chưa chắc, để nhắn nhóm sau nhé. Quay lại công việc, môi trường staging đang chậm do thiếu tài nguyên database.',
    },
    {
      userId: teammate.user_id,
      speakerName: teammate.full_name,
      text: 'Sáng nay trời mưa lớn nên mình đến muộn mười phút. Nhân tiện điều hòa phòng họp hơi lạnh.',
    },
    {
      userId: host.user_id,
      speakerName: host.full_name,
      text: 'Blocker staging giao cho mình liên hệ DevOps tăng cấu hình database trước 15 giờ hôm nay. Nếu chưa xong sẽ chuyển demo sang dữ liệu local.',
    },
    {
      userId: teammate.user_id,
      speakerName: teammate.full_name,
      text: 'Phần transcript realtime đã nhận đúng người nói. Tuy nhiên hai audio chunk cuối đôi lúc bị trùng nội dung khi mạng chập chờn.',
    },
    {
      userId: host.user_id,
      speakerName: host.full_name,
      text: 'Action item: bổ sung idempotency test cho audio chunk trong sprint hiện tại, hạn thứ Sáu. Không đưa chuyện cà phê, thời tiết hoặc điều hòa vào báo cáo công việc.',
    },
    {
      userId: teammate.user_id,
      speakerName: teammate.full_name,
      text: 'Chốt lại: mình xử lý loading, dependency và test audio chunk; bạn làm việc với DevOps và review pull request. Bản phát hành vẫn giữ lịch cuối tuần.',
    },
  ];

  const connection = await mongoose.createConnection(mongo.uri).asPromise();
  const TranscriptModel = connection.model(
    MeetingTranscript.name,
    MeetingTranscriptSchema,
  );
  let transcriptId: string | null = null;

  try {
    const transcript = await TranscriptModel.create({
      meetingId,
      workspaceId,
      projectId,
      sprintId: null,
      rawTranscript: speakers
        .map((item) => `${item.speakerName}: ${item.text}`)
        .join('\n'),
      speakers,
      liveSegments: [],
      createdBy: host.user_id,
    });
    transcriptId = String(transcript._id);

    await dataSource.transaction(async (manager) => {
      await manager.query(
        `INSERT INTO meetings
          (id, workspace_id, project_id, sprint_id, title, description,
           meeting_type, meeting_date, start_time, end_time, actual_start_time,
           actual_end_time, auto_completed, status, created_by,
           mongo_transcript_id, mongo_summary_id, created_at, updated_at)
         VALUES (?, ?, ?, NULL, ?, ?, 'GENERAL', ?, ?, ?, ?, ?, 0,
                 'COMPLETED', ?, ?, NULL, NOW(6), NOW(6))`,
        [
          meetingId,
          workspaceId,
          projectId,
          title,
          'Dữ liệu kiểm thử khả năng tách nội dung công việc khỏi trò chuyện ngoài lề.',
          meetingDate,
          startTime,
          endTime,
          startTime,
          endTime,
          host.user_id,
          transcriptId,
        ],
      );
      for (const member of members.slice(0, 2)) {
        await manager.query(
          `INSERT INTO meeting_participants
            (id, meeting_id, user_id, role, attended, created_at, updated_at)
           VALUES (?, ?, ?, ?, 1, NOW(6), NOW(6))`,
          [
            randomUUID(),
            meetingId,
            member.user_id,
            member.user_id === host.user_id ? 'HOST' : 'PARTICIPANT',
          ],
        );
      }
    });

    console.log(
      JSON.stringify({
        meetingId,
        projectId,
        transcriptId,
        title,
        speakerLines: speakers.length,
        reused: false,
      }),
    );
  } catch (error) {
    if (transcriptId) await TranscriptModel.deleteOne({ _id: transcriptId });
    throw error;
  } finally {
    await connection.close();
  }
}

main()
  .catch((error) => {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  })
  .finally(async () => {
    if (dataSource.isInitialized) await dataSource.destroy();
  });
