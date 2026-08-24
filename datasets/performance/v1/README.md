# Kịch bản đánh giá hiệu năng Chương 4

Bộ đo bao phủ bốn nội dung: API, AI processing, concurrent load và observability.

## Chuẩn bị

1. Sao chép `performance.config.example.json` thành `performance.config.json`.
2. Dùng tài khoản và database thử nghiệm riêng; không chạy tải trên dữ liệu production.
3. Gán access token vào `PERF_BEARER_TOKEN`. Nếu muốn lấy telemetry quản trị trước/sau, gán thêm `PERF_ADMIN_TOKEN`.
4. Gán `WORKSPACE_ID` và `PROJECT_ID` của dữ liệu thử nghiệm.

## Chạy API và concurrent load

```powershell
$env:PERF_BEARER_TOKEN="access-token-test"
npm run performance:run
```

## Chạy thêm AI processing

AI bị tắt mặc định để tránh tiêu tiền ngoài ý muốn. Chỉ bật khi đã kiểm tra cấu hình 3 request:

```powershell
$env:PERF_INCLUDE_AI="true"
$env:PERF_CONFIRM_AI_COST="YES"
$env:WORKSPACE_ID="workspace-uuid"
$env:PROJECT_ID="project-uuid"
npm run performance:run
```

## Chỉ kiểm tra kế hoạch, không gửi request

```powershell
npm run performance:plan
```

Kết quả được ghi vào `latest-results.json` và `LATEST_REPORT.md`, gồm average, p50, p95, p99, throughput, error rate, status code và snapshot observability trước/sau.

## Ngưỡng đề xuất để trình bày

| Nhóm            |                                 Ngưỡng tham chiếu |
| --------------- | ------------------------------------------------: |
| API đọc p95     |                                      dưới 1000 ms |
| API error rate  |                                           dưới 1% |
| AI p95          | báo cáo theo kết quả thực tế, không áp ngưỡng API |
| Concurrent load |                    tối thiểu 10 request đồng thời |

Không điền số giả vào luận văn. Chỉ dùng `LATEST_REPORT.md` sinh ra từ lần chạy thật và ghi rõ ngày chạy, môi trường, commit, số request và cấu hình concurrency.
