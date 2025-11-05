# マザーAI - API仕様書

## 概要

本ドキュメントは、マザーAIのフロントエンド→バックエンド間で使用される全APIエンドポイントを定義します。

**生成日**: 2025年11月6日
**バージョン**: 1.0
**ベースURL**: `http://localhost:8572/api/v1` (開発環境)

---

## 認証API

### POST /auth/login
メールアドレスとパスワードでログイン

**Request**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response**
```json
{
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "name": "山田 太郎",
      "role": "user",
      "status": "approved"
    },
    "token": "jwt-token",
    "refreshToken": "refresh-token"
  }
}
```

### POST /auth/register
新規ユーザー申請

**Request**
```json
{
  "email": "user@example.com",
  "name": "山田 太郎",
  "password": "password123",
  "purpose": "副業としてWeb制作を始めたい",
  "experienceLevel": "beginner",
  "referralSource": "search"
}
```

**Response**
```json
{
  "data": {
    "id": "application-uuid",
    "status": "pending"
  },
  "message": "申請を受け付けました。審査完了までお待ちください。"
}
```

### POST /auth/oauth/{provider}
OAuth認証（Google/GitHub）

**Parameters**
- `provider`: `google` | `github`

---

## プロジェクトAPI

### GET /projects
ユーザーのプロジェクト一覧取得

**Headers**
```
Authorization: Bearer {token}
```

**Response**
```json
{
  "data": [
    {
      "id": "project-uuid",
      "name": "ECサイト開発",
      "description": "オンラインショップのフルスタック開発",
      "currentPhase": 2,
      "progressPercentage": 60,
      "createdAt": "2025-11-05T10:00:00Z",
      "updatedAt": "2025-11-06T14:30:00Z"
    }
  ]
}
```

### POST /projects
新規プロジェクト作成

**Request**
```json
{
  "name": "プロジェクト名",
  "description": "説明（任意）"
}
```

### GET /projects/{id}
プロジェクト詳細取得

**Response**
```json
{
  "data": {
    "id": "project-uuid",
    "name": "ECサイト開発",
    "phases": [
      {
        "phaseNumber": 1,
        "phaseName": "Phase 1",
        "status": "completed",
        "progress": 100
      }
    ]
  }
}
```

### DELETE /projects/{id}
プロジェクト削除

---

## チャットAPI

### GET /projects/{id}/messages
プロジェクトのチャット履歴取得

**Response**
```json
{
  "data": [
    {
      "id": "message-uuid",
      "role": "user",
      "content": "商品一覧ページを作成してください",
      "createdAt": "2025-11-06T10:00:00Z"
    }
  ]
}
```

### POST /projects/{id}/messages
メッセージ送信（SSE）

**Request**
```json
{
  "content": "ユーザーメッセージ",
  "phaseNumber": 2
}
```

**Response** (Server-Sent Events)
```
data: {"type":"start"}
data: {"type":"token","content":"こんにちは"}
data: {"type":"token","content":"！"}
data: {"type":"end"}
```

---

## ユーザーAPI

### GET /users/me
現在のユーザー情報取得

### PUT /users/me
ユーザー情報更新

### GET /users/me/api-usage
API使用量取得

---

## 管理者API

### GET /admin/applications
申請一覧取得

### PUT /admin/applications/{id}/approve
申請承認

### PUT /admin/applications/{id}/reject
申請却下

### GET /admin/users
全ユーザー一覧

### GET /admin/api-monitor/stats
API監視統計

---

## エラーレスポンス形式

```json
{
  "error": "エラーメッセージ",
  "code": "ERROR_CODE",
  "details": {}
}
```

**エラーコード一覧**
- `UNAUTHORIZED`: 認証エラー
- `FORBIDDEN`: 権限エラー
- `NOT_FOUND`: リソース未検出
- `VALIDATION_ERROR`: バリデーションエラー
- `INTERNAL_ERROR`: サーバーエラー

---

## 注意事項

1. **認証**: JWTトークンを`Authorization: Bearer {token}`ヘッダーで送信
2. **Rate Limiting**: ユーザーごとに1分間100リクエストまで
3. **CORS**: 本番環境では特定ドメインのみ許可
4. **SSE**: チャットAPIはServer-Sent Eventsを使用

---

**更新履歴**
- 2025-11-06: 初版作成
