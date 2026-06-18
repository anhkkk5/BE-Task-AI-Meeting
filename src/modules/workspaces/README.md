# Workspaces Module

## Mục tiêu

Quản lý workspace SaaS cơ bản: tạo workspace, tự động gán OWNER, xem danh sách workspace của user, xem chi tiết, cập nhật và archive workspace.

## API

```txt
POST  /api/v1/workspaces
GET   /api/v1/workspaces
GET   /api/v1/workspaces/:workspaceId
PATCH /api/v1/workspaces/:workspaceId
PATCH /api/v1/workspaces/:workspaceId/archive
```

Tất cả API cần access token:

```txt
Authorization: Bearer <access_token>
```

## Database

- `workspaces`
- `workspace_members`

Khi tạo workspace, hệ thống tạo `workspace_members` với:

```txt
role = OWNER
status = ACTIVE
```

## Bảo mật

- Không nhận `ownerId`, `plan`, `status` từ client.
- Chỉ workspace member xem được chi tiết workspace.
- Chỉ OWNER được update/archive workspace.
- Tạo workspace và owner member chạy trong transaction.
