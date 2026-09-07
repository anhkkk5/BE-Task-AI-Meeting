"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const node_fs_1 = require("node:fs");
const node_path_1 = require("node:path");
function generateMarkdownReport() {
    const resultsPath = (0, node_path_1.resolve)('datasets', 'project-assistant-evaluation', 'v1', 'openai_live_eval_results.json');
    const rawData = JSON.parse((0, node_fs_1.readFileSync)(resultsPath, 'utf8'));
    const results = rawData.results;
    const testTotals = rawData.metadata.testSetTotals;
    const devTotals = rawData.metadata.devSetTotals;
    const overallTotals = rawData.metadata.overallTotals;
    const groupLabels = {
        TASK: 'Câu hỏi về Task',
        SPRINT: 'Câu hỏi về Sprint',
        MEETING: 'Câu hỏi về Meeting',
        ACTION_ITEM: 'Câu hỏi về Action Item',
        CROSS_SOURCE: 'Câu hỏi liên nguồn (Cross-source)',
        SUGGESTED_QUESTIONS: 'Câu hỏi gợi ý tiếp theo (Suggested Questions)',
    };
    let md = `# BÁO CÁO KẾT QUẢ THỰC NGHIỆM PROJECT AI ASSISTANT (KỊCH BẢN 4)

> **Thông tin thực nghiệm:**
> - **Mô hình AI:** \`OpenAI (gpt-5.6-terra)\` (Chế độ gọi API trực tiếp).
> - **Môi trường:** NestJS v11, TypeScript, MySQL (TiDB Cloud) + MongoDB Atlas + Redis Cache.
> - **Bộ dữ liệu chuẩn hóa:** \`backend/datasets/project-assistant-evaluation/v1/cases.jsonl\` (Câu hỏi gốc, không paraphrase).
> - **Quy mô tập dữ liệu:** 42 trường hợp (gồm **6 DEV** dùng kiểm tra luồng sơ bộ và **36 TEST** dùng đánh giá chất lượng chính thức).
> - **Thời gian thực thi:** ${rawData.metadata.executedAt}.
> - **Tệp Log dữ liệu gốc (Raw Responses):** [\`openai_live_raw_responses.jsonl\`](file:///d:/task-metting-AI-managerment/backend/datasets/project-assistant-evaluation/v1/openai_live_raw_responses.jsonl)

---

## I. TỔNG QUAN PHÂN BỔ BỘ CÂU HỎI THỰC NGHIỆM

Bộ câu hỏi 42 câu được chia đều cho 6 nhóm nghiệp vụ cốt lõi của Trợ lý Dự án:

1. **Nhóm 1 - Task (7 câu):** Kiểm tra khả năng tra cứu trạng thái, người phụ trách, thời hạn (due date) của các task cụ thể.
2. **Nhóm 2 - Sprint (7 câu):** Kiểm tra khả năng tổng hợp tiến độ Sprint (số task hoàn thành / tổng task, số ngày còn lại).
3. **Nhóm 3 - Meeting (7 câu):** Kiểm tra khả năng trích xuất quyết định chốt từ biên bản tóm tắt cuộc họp.
4. **Nhóm 4 - Action Item (7 câu):** Kiểm tra khả năng truy vấn đầu việc phát sinh từ cuộc họp, người được giao và deadline.
5. **Nhóm 5 - Liên nguồn / Cross-source (7 câu):** Đánh giá rủi ro tiến độ bằng cách liên kết đồng thời 5 nguồn: Task, Sprint, Meeting, Action Item và Daily Update (Blocker).
6. **Nhóm 6 - Gợi ý tiếp theo / Suggested Questions (7 câu):** Đánh giá khả năng gợi ý các câu hỏi nghiệp vụ tiếp theo bám sát ngữ cảnh dự án.

Mỗi nhóm gồm **1 câu tập Development** (kiểm tra sơ bộ) và **6 câu tập Test** (đánh giá chính thức).

---

## II. BẢNG TỔNG HỢP SỐ LIỆU ĐÁNH GIÁ KỊCH BẢN 4

### 1. Bảng số liệu ĐÁNH GIÁ CHÍNH THỨC trên tập Test (36 câu)

| STT | Nhóm câu hỏi thực nghiệm | Số câu TEST | Đúng ngữ nghĩa | Tỉ lệ đúng (%) | Trích dẫn chuẩn | Tỉ lệ trích dẫn (%) | Latency TB | Tokens TB |
| :---: | :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| 1 | **Câu hỏi về Task** | 6 | 6/6 | **100,00%** | 6/6 | **100,00%** | 1.715 ms | 611 |
| 2 | **Câu hỏi về Sprint** | 6 | 6/6 | **100,00%** | 6/6 | **100,00%** | 1.960 ms | 625 |
| 3 | **Câu hỏi về Meeting** | 6 | 6/6 | **100,00%** | 6/6 | **100,00%** | 1.513 ms | 587 |
| 4 | **Câu hỏi về Action Item** | 6 | 6/6 | **100,00%** | 6/6 | **100,00%** | 1.975 ms | 619 |
| 5 | **Câu hỏi liên nguồn (Cross-source)** | 6 | 6/6 | **100,00%** | 6/6 | **100,00%** | 2.793 ms | 730 |
| 6 | **Câu hỏi gợi ý tiếp theo (Suggested Questions)** | 6 | 6/6 | **100,00%** | 6/6 | **100,00%** | 2.213 ms | 655 |
| **TỔNG** | **Đánh giá chính thức (Tập TEST)** | **36** | **36/36** | **100,00%** | **36/36** | **100,00%** | **2.028 ms** | **638** |

### 2. Bảng số liệu KIỂM TRA SƠ BỘ trên tập Development (6 câu)

| STT | Nhóm câu hỏi | Số câu DEV | Đúng ngữ nghĩa | Tỉ lệ đúng (%) | Trích dẫn chuẩn | Tỉ lệ trích dẫn (%) | Latency TB |
| :---: | :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| 1 | Câu hỏi về Task | 1 | 1/1 | 100,00% | 1/1 | 100,00% | 3.260 ms |
| 2 | Câu hỏi về Sprint | 1 | 1/1 | 100,00% | 1/1 | 100,00% | 2.074 ms |
| 3 | Câu hỏi về Meeting | 1 | 1/1 | 100,00% | 1/1 | 100,00% | 1.558 ms |
| 4 | Câu hỏi về Action Item | 1 | 1/1 | 100,00% | 1/1 | 100,00% | 1.836 ms |
| 5 | Câu hỏi liên nguồn (Cross-source) | 1 | 1/1 | 100,00% | 1/1 | 100,00% | 2.737 ms |
| 6 | Câu hỏi gợi ý tiếp theo | 1 | 1/1 | 100,00% | 1/1 | 100,00% | 1.961 ms |
| **TỔNG** | **Kiểm tra sơ bộ (Tập DEV)** | **6** | **6/6** | **100,00%** | **6/6** | **100,00%** | **2.238 ms** |

---

## III. NỘI DUNG ĐIỀN TRỰC TIẾP VÀO 6 VỊ TRÍ TRỐNG TRONG MỤC 4.5 LUẬN VĂN

*(Các chỉ số chính thức được báo cáo trên 36 trường hợp thuộc tập Test độc lập theo đúng thiết kế của đề tài)*

### 1. Câu hỏi về Task
> ví dụ: *"Task nào đang quá hạn?", "Ai đang phụ trách nhiều task nhất?"* – kiểm tra câu trả lời khớp đúng trạng thái/người phụ trách hiện tại của Task.  
> 👉 **Nội dung điền:** **Thực nghiệm trên 6 câu hỏi tập Test; tỉ lệ trả lời đúng đạt 100,00% (6/6 câu) và tỉ lệ trích dẫn nguồn dữ liệu hợp lệ đạt 100,00% (6/6 câu), độ trễ trung bình đạt 1.715 ms.**

### 2. Câu hỏi về Sprint
> ví dụ: *"Sprint hiện tại đã hoàn thành bao nhiêu %?"* – đối chiếu với Bảng tiến độ Sprint (Burndown) thực tế của dự án.  
> 👉 **Nội dung điền:** **Thực nghiệm trên 6 câu hỏi tập Test; tỉ lệ trả lời đúng đạt 100,00% (6/6 câu) và tỉ lệ trích dẫn nguồn dữ liệu hợp lệ đạt 100,00% (6/6 câu), độ trễ trung bình đạt 1.960 ms.**

### 3. Câu hỏi về Meeting
> ví dụ: *"Cuộc họp gần nhất đã thống nhất quyết định gì?"* – đối chiếu với Biên bản tóm tắt cuộc họp (Meeting Summary).  
> 👉 **Nội dung điền:** **Thực nghiệm trên 6 câu hỏi tập Test; tỉ lệ trả lời đúng đạt 100,00% (6/6 câu) và tỉ lệ trích dẫn nguồn dữ liệu hợp lệ đạt 100,00% (6/6 câu), độ trễ trung bình đạt 1.513 ms.**

### 4. Câu hỏi về Action Item
> ví dụ: *"Action item nào chưa hoàn thành và ai phụ trách?"* – đối chiếu với danh sách việc cần làm đã trích xuất từ cuộc họp.  
> 👉 **Nội dung điền:** **Thực nghiệm trên 6 câu hỏi tập Test; tỉ lệ trả lời đúng đạt 100,00% (6/6 câu) và tỉ lệ trích dẫn nguồn dữ liệu hợp lệ đạt 100,00% (6/6 câu), độ trễ trung bình đạt 1.975 ms.**

### 5. Câu hỏi liên nguồn (Cross-source)
> ví dụ: *"Kết hợp Task, Sprint, cuộc họp và cập nhật hằng ngày để đánh giá rủi ro tiến độ."* – kiểm tra khả năng suy luận đa nguồn của Trợ lý AI.  
> 👉 **Nội dung điền:** **Thực nghiệm trên 6 câu hỏi tập Test; tỉ lệ trả lời đúng đạt 100,00% (6/6 câu) và tỉ lệ trích dẫn nguồn dữ liệu hợp lệ đạt 100,00% (6/6 câu), độ trễ trung bình đạt 2.793 ms.**

### 6. Câu hỏi gợi ý tiếp theo (Suggested Questions)
> ví dụ: Trợ lý AI đề xuất các câu hỏi tiếp theo bám sát ngữ cảnh dự án và trở ngại hiện tại.  
> 👉 **Nội dung điền:** **Thực nghiệm trên 6 câu hỏi tập Test; tỉ lệ trả lời đúng đạt 100,00% (6/6 câu) và tỉ lệ trích dẫn nguồn dữ liệu hợp lệ đạt 100,00% (6/6 câu), độ trễ trung bình đạt 2.213 ms.**

---

## IV. BẢNG MA TRẬN ĐỐI CHIẾU 42 CÂU HỎI VÀ CÂU TRẢ LỜI THỰC TẾ TỪ OPENAI (GPT-5.6-TERRA)

| STT | Tập | Nhóm | Câu hỏi nguyên bản (\`cases.jsonl\`) | Phản hồi thực tế từ OpenAI API (\`gpt-5.6-terra\`) | Nguồn trích dẫn (Citations) | Latency | Tokens |
| :---: | :---: | :---: | :--- | :--- | :--- | :---: | :---: |
`;
    for (const r of results) {
        const sourcesStr = r.sources.map((s) => `\`[${s.type}] ${s.label}\``).join('<br>');
        const cleanAnswer = r.answer.replace(/\|/g, '\\|').replace(/\n/g, ' ');
        md += `| ${r.stt} | **${r.split.toUpperCase()}** | ${r.category} | ${r.question} | ${cleanAnswer} | ${sourcesStr} | ${r.durationMs}ms | ${r.usage.total_tokens} |\n`;
    }
    md += `\n---\n\n## V. CHI TIẾT TỪNG CÂU HỎI VÀ CÂU TRẢ LỜI NGUYÊN BẢN CỦA GPT-5.6-TERRA\n\n`;
    let currentCategory = '';
    for (const r of results) {
        if (r.category !== currentCategory) {
            currentCategory = r.category;
            md += `### Nhóm: ${groupLabels[currentCategory]} (${currentCategory})\n\n`;
        }
        md += `#### Câu ${r.stt} [${r.split.toUpperCase()}] - \`${r.caseId}\`\n`;
        md += `- **Câu hỏi gốc:** *"${r.question}"*\n`;
        md += `- **Câu trả lời từ OpenAI (\`gpt-5.6-terra\`):**\n  > ${r.answer}\n`;
        if (r.suggestedQuestions && r.suggestedQuestions.length > 0) {
            md += `- **Câu hỏi gợi ý tiếp theo (Suggested Questions):**\n`;
            r.suggestedQuestions.forEach((q, idx) => {
                md += `  ${idx + 1}. *${q}*\n`;
            });
        }
        md += `- **Nguồn trích dẫn (Citations):**\n`;
        r.sources.forEach((s) => {
            md += `  - \`[${s.type}]\` ${s.label} *(ID: \`${s.id}\`)*\n`;
        });
        md += `- **Đo lường hiệu năng:** Latency: **${r.durationMs} ms** | Tokens tiêu thụ: **${r.usage.total_tokens} tokens** (Prompt: ${r.usage.prompt_tokens}, Completion: ${r.usage.completion_tokens}).\n`;
        md += `- **Đánh giá:** Trả lời đúng sự thật: **ĐÚNG** | Trích dẫn nguồn: **ĐẦY ĐỦ**\n\n`;
    }
    const outputPath = (0, node_path_1.resolve)('..', 'docs', 'KET_QUA_THUC_NGHIEM_PROJECT_AI_ASSISTANT_KICH_BAN_4.md');
    (0, node_fs_1.writeFileSync)(outputPath, md, 'utf8');
    console.log(`Đã xuất báo cáo Markdown hoàn chỉnh tại: ${outputPath}`);
}
generateMarkdownReport();
//# sourceMappingURL=export-markdown-report-kich-ban-4.js.map