# Bang chung kiem thu chuc nang - Chuong 4

Bao cao duoc sinh tu ma test luc: 2026-08-25T12:46:30.522Z.

## Quy mo tu dong

| Nhom | So file | So test case |
|---|---:|---:|
| Unit | 41 | 247 |
| Integration + E2E | 14 | 110 |
| Co bang chung RBAC | 27 | 222 |
| Co bang chung Multi-tenancy | 2 | 15 |
| Tong | 55 | 357 |

Luu y: cot RBAC/Multi-tenancy la tap con cua Unit va Integration/E2E, khong cong vao tong lan hai.

## Cach phan loai

- Unit: File *.spec.ts trong src; dependency duoc mock/isolate.
- Integration/E2E: File *.e2e-spec.ts trong test; khoi tao Nest TestingModule va kiem tra luong HTTP/module.
- RBAC: File co guard, WorkspaceRole, ForbiddenException/RBAC/HTTP 403.
- Multi-tenancy: File co assertion ve bien workspace/tenant; danh sach file duoc cong khai de kiem tra thu cong.

## Cac file bang chung bao mat va co lap tenant

| File | Test case | RBAC | Multi-tenancy |
|---|---:|:---:|:---:|
| `src/common/guards/workspace-roles.guard.spec.ts` | 4 | Co | - |
| `src/modules/ai-assistant/schedulers/ai-daily-report-scheduler.service.spec.ts` | 4 | Co | - |
| `src/modules/ai-assistant/services/ai-meeting-action-item-review.service.spec.ts` | 4 | Co | - |
| `src/modules/ai-assistant/services/ai-personalized-meeting-summary.service.spec.ts` | 5 | Co | - |
| `src/modules/ai-assistant/services/ai-report-access.service.spec.ts` | 4 | Co | - |
| `src/modules/ai-assistant/services/ai-team-report-action-item.service.spec.ts` | 9 | Co | - |
| `src/modules/ai-assistant/services/ai-team-report.service.spec.ts` | 11 | Co | - |
| `src/modules/daily-updates/services/daily-updates.service.spec.ts` | 9 | Co | - |
| `src/modules/meetings/services/meeting-participants.service.spec.ts` | 4 | Co | - |
| `src/modules/members/services/members.service.spec.ts` | 11 | Co | - |
| `src/modules/projects/services/project-access.service.spec.ts` | 4 | - | Co |
| `src/modules/projects/services/projects.service.spec.ts` | 8 | Co | - |
| `src/modules/shift-handovers/services/shift-handovers.service.spec.ts` | 11 | Co | - |
| `src/modules/sprints/services/sprints.service.spec.ts` | 12 | Co | - |
| `src/modules/tasks/services/task-access.service.spec.ts` | 3 | Co | - |
| `src/modules/tasks/services/tasks.service.spec.ts` | 13 | Co | - |
| `src/modules/workspaces/services/workspace-access.service.spec.ts` | 11 | Co | Co |
| `src/modules/workspaces/services/workspaces.service.spec.ts` | 6 | Co | - |
| `test/ai-meeting-summaries.e2e-spec.ts` | 6 | Co | - |
| `test/ai-personal-reports.e2e-spec.ts` | 7 | Co | - |
| `test/ai-personalized-meeting-summaries.e2e-spec.ts` | 9 | Co | - |
| `test/ai-team-reports.e2e-spec.ts` | 7 | Co | - |
| `test/daily-updates.e2e-spec.ts` | 10 | Co | - |
| `test/meetings.e2e-spec.ts` | 12 | Co | - |
| `test/members.e2e-spec.ts` | 9 | Co | - |
| `test/projects.e2e-spec.ts` | 10 | Co | - |
| `test/sprints.e2e-spec.ts` | 10 | Co | - |
| `test/tasks.e2e-spec.ts` | 13 | Co | - |

## Cach tai tao ket qua

~~~bash
npm run evidence:functional:generate
npm test -- --runInBand
npm run test:e2e -- --runInBand
~~~

Khong chay E2E truc tiep tren database production. Can dung database test rieng va ghi lai ngay chay, commit, so passed/failed, thoi gian trong phieu thuc nghiem.
