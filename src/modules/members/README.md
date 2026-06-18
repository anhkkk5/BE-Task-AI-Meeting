# Members Module

## API

```txt
GET   /api/v1/workspaces/:workspaceId/members
POST  /api/v1/workspaces/:workspaceId/members
GET   /api/v1/workspaces/:workspaceId/members/me
PATCH /api/v1/workspaces/:workspaceId/members/:memberId/role
PATCH /api/v1/workspaces/:workspaceId/members/:memberId/remove
```

## Quy tắc

- Tất cả API cần access token.
- Member ACTIVE xem được danh sách members và role của mình.
- Chỉ OWNER được add/change role/remove.
- Không cho add/change role sang OWNER.
- Remove member bằng `status = REMOVED`, không hard delete.
- Không remove hoặc hạ role OWNER cuối cùng.
