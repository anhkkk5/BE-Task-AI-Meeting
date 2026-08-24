# Bộ dữ liệu đánh giá trích xuất Action Item

Bộ dữ liệu này dùng để đánh giá khả năng trích xuất action item từ transcript cuộc họp tiếng Việt, tách biệt với dữ liệu production.

## Quy mô v1

- 60 transcript, 300 action item tham chiếu.
- 12 transcript `development` để phát triển prompt; 48 transcript `test` không dùng để sửa prompt.
- 5 loại cuộc họp: Daily Standup, Sprint Planning, Sprint Review, Retrospective, Technical Discussion.
- Có câu nhiễu, câu chỉ là ý tưởng, action item thiếu assignee và action item thiếu deadline.

## Chạy

Tại thư mục `backend`:

```bash
npm run dataset:action-items:generate
npm run dataset:action-items:validate
```

`v1/transcripts.jsonl` lưu mỗi transcript cùng action item chuẩn gồm `text`, `assigneeName`, `assigneeUserId`, `dueDate`, `status`, `source` và `evidenceSegmentIds`. `v1/manifest.json` lưu thống kê quy mô.

## Xác minh nhãn trước khi dùng trong luận văn

Phiên bản sinh tự động mang trạng thái `SYNTHETIC_DRAFT`. Để trở thành ground truth cuối cùng:

1. Hai người đọc và gán nhãn độc lập 48 transcript thuộc tập `test`.
2. Xác nhận nội dung, assignee, deadline và câu bằng chứng của từng action item.
3. Ghi lại bất đồng và thống nhất nhãn cuối cùng.
4. Sau đó mới đổi trạng thái thành `HUMAN_VERIFIED` và sử dụng để báo cáo Precision/Recall/F1.

Không mô tả dữ liệu tổng hợp chưa được kiểm tra là dữ liệu thực tế hoặc ground truth do con người gán nhãn.
# Pipeline đánh giá tự động

Dataset này đi kèm pipeline đo chất lượng trích xuất Action Item theo Precision,
Recall và F1. Nhãn hiện mang trạng thái `SYNTHETIC_DRAFT`; cần hai người duyệt độc
lập trước khi dùng làm ground truth cuối cùng trong luận văn.

## 1. Kiểm tra pipeline không tốn API

```powershell
npm run dataset:action-items:validate
npm run dataset:action-items:oracle
$env:EVAL_PREDICTIONS_PATH='datasets/action-item-evaluation/v1/oracle-predictions.jsonl'
$env:EVAL_OUTPUT_DIR='datasets/action-item-evaluation/v1/oracle-results'
npm run dataset:action-items:evaluate
Remove-Item Env:EVAL_PREDICTIONS_PATH
Remove-Item Env:EVAL_OUTPUT_DIR
```

Oracle phải đạt Precision/Recall/F1 bằng 1. Đây chỉ là phép kiểm tra code chấm,
không được dùng làm kết quả AI trong báo cáo.

## 2. Chạy inference thật bằng provider của backend

Lệnh mặc định từ chối chạy để tránh tiêu OpenAI credit. Nên thử đúng một mẫu:

```powershell
$env:EVAL_CONFIRM_COST='YES'
$env:EVAL_LIMIT='1'
npm run dataset:action-items:infer
```

Sau khi kiểm tra prediction, tăng `EVAL_LIMIT`. Script có resume mặc định nên
không gọi lại các transcript đã có. Muốn chạy lại từ đầu, xóa file prediction
hoặc đặt `EVAL_RESUME=false`.

```powershell
$env:EVAL_LIMIT='48'
npm run dataset:action-items:infer
npm run dataset:action-items:evaluate
```

## 3. Kết quả

- `results/summary.json`: Precision/Recall/F1 tổng, độ đúng assignee/deadline,
  hiệu năng và kết quả theo loại cuộc họp.
- `results/per-transcript.csv`: số TP/FP/FN và F1 của từng transcript.
- `results/matches.csv`: từng cặp khớp, false positive, false negative để audit.

Biến cấu hình: `EVAL_SPLIT` (mặc định `test`), `EVAL_MATCH_THRESHOLD` (mặc định
`0.5`), `EVAL_DATASET_PATH`, `EVAL_PREDICTIONS_PATH`, `EVAL_OUTPUT_DIR`.

## 4. Hai người gán nhãn độc lập

```powershell
npm run dataset:action-items:annotation:prepare
```

Gửi riêng `annotation/annotator-a.xlsx` và `annotation/annotator-b.xlsx` cho hai
người. Mỗi người đọc transcript và điền `actionItemsJson`, không trao đổi hoặc
xem file của người còn lại. Sau khi nhận lại đủ hai file:

```powershell
npm run dataset:action-items:annotation:agreement
```

Kết quả gồm `annotation/agreement.json` và `annotation/disagreements.csv`.
Phải phân xử toàn bộ bất đồng trước khi đổi trạng thái nhãn thành
`HUMAN_VERIFIED`.

## 5. Phân xử và đóng băng Ground Truth

Sau khi đo độ đồng thuận, tạo workbook dành cho người thứ ba phân xử:

```powershell
npm run dataset:action-items:annotation:adjudicate
```

Mở `v1/annotation/adjudication.xlsx`, đọc transcript và hai kết quả gán nhãn. Điền
`finalActionItemsJson`, sau đó chỉ đổi `adjudicationStatus` thành `APPROVED` khi đã
kiểm tra trực tiếp. Kể cả khi hai người gán nhãn giống nhau, người phân xử vẫn phải
xác nhận; script không tự động duyệt.

Khi toàn bộ 48 dòng đã được duyệt:

```powershell
npm run dataset:action-items:annotation:finalize
```

Lệnh này cố ý thất bại nếu còn một dòng `PENDING`, thiếu nhãn cuối hoặc JSON sai.
Nếu hợp lệ, nó tạo `v1/human-verified-transcripts.jsonl` và
`v1/human-verified-manifest.json`. Để đánh giá AI trên Ground Truth cuối:

```powershell
$env:EVAL_DATASET_PATH='datasets/action-item-evaluation/v1/human-verified-transcripts.jsonl'
npm run dataset:action-items:evaluate
Remove-Item Env:EVAL_DATASET_PATH
```
