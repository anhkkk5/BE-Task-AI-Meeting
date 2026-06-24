# Daily Updates Module

NV8 luu bao cao hang ngay cua tung user trong workspace/project va co the gan voi sprint.

## API

- `POST /api/v1/workspaces/:workspaceId/projects/:projectId/daily-updates`
- `GET /api/v1/workspaces/:workspaceId/projects/:projectId/daily-updates/me`
- `GET /api/v1/workspaces/:workspaceId/projects/:projectId/daily-updates`
- `GET /api/v1/workspaces/:workspaceId/projects/:projectId/daily-updates/:dailyUpdateId`
- `PATCH /api/v1/workspaces/:workspaceId/projects/:projectId/daily-updates/:dailyUpdateId`
- `PATCH /api/v1/workspaces/:workspaceId/projects/:projectId/daily-updates/:dailyUpdateId/archive`

## Rule chinh

- `userId` lay tu JWT, khong nhan tu body.
- `workspaceId` va `projectId` lay tu params.
- Mot user chi co mot daily update cho cung project trong mot ngay.
- `MEMBER` chi xem/sua daily update cua minh.
- `OWNER`, `SCRUM_MASTER`, `PROJECT_MANAGER` xem duoc daily update team.
- `VIEWER` khong duoc ghi daily update.
- Archive la soft delete bang `deleted_at`.
