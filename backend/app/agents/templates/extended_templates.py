"""
Phase 7-14用のテンプレート
各Phaseのモックモード用の出力を生成
"""

from typing import Dict, List


def generate_debug_report(project_name: str, generated_code: Dict) -> Dict[str, str]:
    """Phase 7: デバッグ支援レポート生成"""

    debug_report = f"""# 🔧 デバッグレポート - {project_name}

## 実行日時
{import_datetime()}

## 自動検出された問題

### 1. コードスメル
- **未使用のインポート**: 3箇所検出
  - `src/utils/helper.ts`: line 5 - `import {{{{ unused }}}} from 'lodash'`
  - `src/pages/Dashboard.tsx`: line 2 - `import {{{{ FC }}}} from 'react'`

- **デッドコード**: 2箇所検出
  - `src/services/api.ts`: line 45-60 - 未使用の関数 `deprecatedFetch()`

### 2. 潜在的なバグ
- **Null参照の可能性**: 5箇所検出
  - `src/pages/ItemList.tsx`: line 23 - `items.map()` の前にnullチェック推奨

- **型安全性**: 3箇所検出
  - `src/types/index.ts`: line 12 - `any`型の使用を避けるべき

### 3. パフォーマンス問題
- **不要な再レンダリング**: 4箇所検出
  - `src/components/Header.tsx`: useCallback推奨

- **メモリリーク**: 1箇所検出
  - `src/hooks/useWebSocket.ts`: クリーンアップ関数が不足

## 推奨される修正

### 優先度: 高
1. **Null参照の修正**
   ```typescript
   // Before
   items.map(item => ...)

   // After
   items?.map(item => ...) ?? []
   ```

2. **メモリリーク修正**
   ```typescript
   useEffect(() => {{{{
     const ws = new WebSocket(url)

     return () => {{{{
       ws.close() // クリーンアップ追加
     }}}}
   }}}}, [url])
   ```

### 優先度: 中
3. **未使用インポートの削除**
4. **デッドコードの削除**
5. **型安全性の向上**（any型を具体的な型に）

### 優先度: 低
6. **useCallbackの適用**（パフォーマンス最適化）

## デバッグツール設定

### ESLint設定
```json
{{{{
  "extends": ["eslint:recommended", "plugin:@typescript-eslint/recommended"],
  "rules": {{{{
    "@typescript-eslint/no-unused-vars": "error",
    "@typescript-eslint/no-explicit-any": "warn"
  }}}}
}}}}
```

### Prettier設定
```json
{{{{
  "semi": true,
  "singleQuote": true,
  "trailingComma": "es5"
}}}}
```

---
*このレポートは「マザーAI」Phase 7デバッグ支援エージェントによって自動生成されました。*
"""

    return {
        "DEBUG_REPORT.md": debug_report
    }


def generate_performance_report(project_name: str) -> Dict[str, str]:
    """Phase 8: パフォーマンス最適化レポート生成"""

    report = f"""# ⚡ パフォーマンス最適化レポート - {project_name}

## 実行日時
{import_datetime()}

## パフォーマンス計測結果

### Lighthouse スコア（推定）
- **Performance**: 72/100 ⚠️ 改善推奨
- **Accessibility**: 95/100 ✅
- **Best Practices**: 88/100 ✅
- **SEO**: 90/100 ✅

### Core Web Vitals
- **LCP** (Largest Contentful Paint): 3.2s ⚠️ 目標: <2.5s
- **FID** (First Input Delay): 85ms ✅ 目標: <100ms
- **CLS** (Cumulative Layout Shift): 0.15 ⚠️ 目標: <0.1

## 検出された問題

### 1. バンドルサイズ
- **現在のサイズ**: 850 KB（gzip圧縮前）
- **目標サイズ**: <500 KB
- **問題**: MUIとMonaco Editorが大きい

**推奨対策**:
```javascript
// vite.config.ts
export default {{{{
  build: {{{{
    rollupOptions: {{{{
      output: {{{{
        manualChunks: {{{{
          'mui': ['@mui/material'],
          'monaco': ['@monaco-editor/react'],
        }}}}
      }}}}
    }}}}
  }}}}
}}}}
```

### 2. 画像最適化
- **未圧縮画像**: 5個検出
- **推定削減サイズ**: ~200 KB

**推奨対策**:
- WebP形式への変換
- レスポンシブ画像の使用
- 遅延ロード（lazy loading）

### 3. 不要な再レンダリング
- **検出箇所**: 8箇所
- **影響**: FPSが60から45に低下

**推奨対策**:
```typescript
// React.memo の適用
export const ExpensiveComponent = React.memo(({{{{ data }}}}) => {{{{
  // ...
}}}})

// useMemo の活用
const expensiveData = useMemo(() => {{{{
  return heavyCalculation(input)
}}}}, [input])
```

### 4. APIレスポンス時間
- **平均レスポンス**: 450ms
- **目標**: <200ms

**推奨対策**:
- キャッシング戦略の導入（SWR, React Query）
- APIの並列化
- 不要なフィールドの削除

## 最適化プラン

### Phase 1: 即座の改善（1-2日）
1. ✅ バンドルサイズ削減（code splitting）
2. ✅ 画像最適化（WebP変換）
3. ✅ 遅延ロード実装

### Phase 2: 中期改善（3-5日）
4. ⏳ React.memoの適用
5. ⏳ APIキャッシングの導入
6. ⏳ 不要な再レンダリング削減

### Phase 3: 長期改善（1-2週間）
7. ⏳ サーバーサイドレンダリング（SSR）検討
8. ⏳ CDNの活用
9. ⏳ Service Workerの導入

## モニタリング設定

### Web Vitalsモニタリング
```typescript
import {{{{ getCLS, getFID, getLCP }}}} from 'web-vitals'

getCLS(console.log)
getFID(console.log)
getLCP(console.log)
```

---
*このレポートは「マザーAI」Phase 8パフォーマンス最適化エージェントによって自動生成されました。*
"""

    return {
        "PERFORMANCE_REPORT.md": report
    }


def generate_security_audit(project_name: str) -> Dict[str, str]:
    """Phase 9: セキュリティ監査レポート生成"""

    audit = f"""# 🔒 セキュリティ監査レポート - {project_name}

## 実行日時
{import_datetime()}

## セキュリティスコア: B+ (82/100)

## 検出された脆弱性

### 🔴 高リスク（即座の対応必要）

#### 1. SQL インジェクション脆弱性
- **箇所**: `backend/app/api/items.py`: line 45
- **詳細**: ユーザー入力を直接SQLクエリに使用
```python
# 危険なコード
query = f"SELECT * FROM items WHERE name = '{{{{user_input}}}}'"

# 修正案
query = "SELECT * FROM items WHERE name = :name"
db.execute(query, {{{{"name": user_input}}}})
```

#### 2. 認証トークンの安全性
- **箇所**: JWT秘密鍵がハードコード
- **修正案**: 環境変数から読み込む
```python
# .env
JWT_SECRET=your-secret-key-here

# Python
import os
JWT_SECRET = os.getenv('JWT_SECRET')
```

### 🟡 中リスク（計画的な対応推奨）

#### 3. XSS (Cross-Site Scripting)
- **箇所**: `frontend/src/pages/ItemDetail.tsx`: line 67
- **詳細**: `dangerouslySetInnerHTML` の使用
```typescript
// 修正案: DOMPurifyを使用
import DOMPurify from 'dompurify'

<div dangerouslySetInnerHTML={{{{
  __html: DOMPurify.sanitize(content)
}}}} />
```

#### 4. CORS設定
- **問題**: ワイルドカード `*` を使用
```python
# 現在（危険）
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"]
)

# 推奨
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://yourdomain.com"]
)
```

### 🟢 低リスク（監視継続）

#### 5. パスワードポリシー
- 最小長: 8文字 ✅
- 複雑性要件: なし ⚠️
- **推奨**: 大文字・小文字・数字・記号を必須に

#### 6. レート制限
- 現在: 未実装 ⚠️
- **推奨**: 1分あたり60リクエストに制限

## セキュリティ強化プラン

### 即座の対応（今週中）
1. ✅ SQL インジェクション修正
2. ✅ JWT秘密鍵を環境変数に
3. ✅ XSS対策（DOMPurify導入）

### 中期対応（今月中）
4. ⏳ CORS設定の厳格化
5. ⏳ レート制限の実装
6. ⏳ パスワードポリシー強化

### 長期対応（3ヶ月以内）
7. ⏳ 定期的な依存関係の脆弱性スキャン
8. ⏳ セキュリティヘッダーの追加
9. ⏳ WAF（Web Application Firewall）の導入検討

## 推奨ツール

### 依存関係のスキャン
```bash
# npm audit
npm audit
npm audit fix

# Python
pip install safety
safety check
```

### セキュリティヘッダー
```python
from fastapi.middleware.trustedhost import TrustedHostMiddleware

app.add_middleware(TrustedHostMiddleware, allowed_hosts=["yourdomain.com"])
```

---
*このレポートは「マザーAI」Phase 9セキュリティ監査エージェントによって自動生成されました。*
"""

    return {
        "SECURITY_AUDIT.md": audit
    }


def generate_database_schema(project_name: str) -> Dict[str, str]:
    """Phase 10: データベース設計提案生成"""

    schema = f"""# 🗄️ データベース設計書 - {project_name}

## ER図（Mermaid）

```mermaid
erDiagram
    users ||--o{{{{ projects : creates
    projects ||--o{{{{ messages : contains
    projects ||--o{{{{ project_files : has
    projects ||--o{{{{ deployments : deploys

    users {{{{
        string id PK
        string email UK
        string password_hash
        string name
        boolean is_approved
        boolean is_admin
        datetime created_at
        datetime updated_at
    }}}}

    projects {{{{
        string id PK
        string user_id FK
        string name
        string description
        integer current_phase
        json generated_code
        datetime created_at
        datetime updated_at
    }}}}

    messages {{{{
        string id PK
        string project_id FK
        string role
        text content
        integer phase
        datetime created_at
    }}}}

    project_files {{{{
        string id PK
        string project_id FK
        string file_path UK
        text content
        string language
        datetime created_at
        datetime updated_at
    }}}}

    deployments {{{{
        string id PK
        string project_id FK
        string status
        string deploy_url
        json config
        datetime created_at
    }}}}
```

## テーブル設計

### users テーブル
**目的**: ユーザー情報の管理

| カラム名 | 型 | 制約 | 説明 |
|---------|----|----|------|
| id | VARCHAR(50) | PK | ユーザーID（UUID） |
| email | VARCHAR(255) | UNIQUE, NOT NULL | メールアドレス |
| password_hash | VARCHAR(255) | NOT NULL | パスワードハッシュ（bcrypt） |
| name | VARCHAR(100) | NOT NULL | ユーザー名 |
| is_approved | BOOLEAN | DEFAULT FALSE | 承認フラグ |
| is_admin | BOOLEAN | DEFAULT FALSE | 管理者フラグ |
| created_at | TIMESTAMP | DEFAULT NOW() | 作成日時 |
| updated_at | TIMESTAMP | DEFAULT NOW() | 更新日時 |

**インデックス**:
- PRIMARY KEY (id)
- UNIQUE INDEX (email)
- INDEX (is_approved, created_at)

### projects テーブル
**目的**: プロジェクト情報の管理

| カラム名 | 型 | 制約 | 説明 |
|---------|----|----|------|
| id | VARCHAR(50) | PK | プロジェクトID（UUID） |
| user_id | VARCHAR(50) | FK, NOT NULL | 所有者ID |
| name | VARCHAR(200) | NOT NULL | プロジェクト名 |
| description | TEXT | | プロジェクト説明 |
| current_phase | INTEGER | DEFAULT 1 | 現在のPhase（1-14） |
| generated_code | JSON | | 生成されたコード（Phase 2） |
| created_at | TIMESTAMP | DEFAULT NOW() | 作成日時 |
| updated_at | TIMESTAMP | DEFAULT NOW() | 更新日時 |

**インデックス**:
- PRIMARY KEY (id)
- FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
- INDEX (user_id, created_at DESC)

### messages テーブル
**目的**: AI対話履歴の管理

| カラム名 | 型 | 制約 | 説明 |
|---------|----|----|------|
| id | VARCHAR(50) | PK | メッセージID（UUID） |
| project_id | VARCHAR(50) | FK, NOT NULL | プロジェクトID |
| role | VARCHAR(20) | NOT NULL | user/assistant |
| content | TEXT | NOT NULL | メッセージ内容 |
| phase | INTEGER | NOT NULL | 対応するPhase（1-14） |
| created_at | TIMESTAMP | DEFAULT NOW() | 作成日時 |

**インデックス**:
- PRIMARY KEY (id)
- FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
- INDEX (project_id, phase, created_at)

## 最適化提案

### 1. パフォーマンス最適化
- `messages`テーブルにパーティショニング（月別）
- `generated_code` JSONフィールドの圧縮
- 読み取り専用レプリカの活用

### 2. データ整合性
- トランザクション処理の徹底
- 外部キー制約の適切な設定
- カスケード削除の慎重な利用

### 3. スケーラビリティ
- シャーディング戦略（user_id）
- キャッシュ戦略（Redis）
- 全文検索（Elasticsearch）

## マイグレーション

### 初期マイグレーション
```sql
-- Alembic migration script
-- Revision: 001_initial_schema

CREATE TABLE users (
    id VARCHAR(50) PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(100) NOT NULL,
    is_approved BOOLEAN DEFAULT FALSE,
    is_admin BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ... other tables
```

---
*この設計書は「マザーAI」Phase 10データベースエージェントによって自動生成されました。*
"""

    return {
        "DATABASE_SCHEMA.md": schema,
        "migrations/001_initial.sql": "-- Migration script placeholder"
    }


def generate_api_design(project_name: str) -> Dict[str, str]:
    """Phase 11: API設計書生成"""

    api_doc = f"""# 📡 API設計書 - {project_name}

## OpenAPI仕様（v3.0）

### ベースURL
```
本番: https://api.{project_name.lower().replace(' ', '-')}.com/api/v1
開発: http://localhost:8572/api/v1
```

### 認証
**方式**: Bearer Token (JWT)

```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## エンドポイント一覧

### 認証 (Authentication)

#### POST /auth/login
ユーザーログイン

**リクエスト**:
```json
{{{{
  "email": "user@example.com",
  "password": "password123"
}}}}
```

**レスポンス** (200 OK):
```json
{{{{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "user": {{{{
    "id": "user-123",
    "email": "user@example.com",
    "name": "John Doe"
  }}}}
}}}}
```

#### POST /auth/register
新規ユーザー登録

**リクエスト**:
```json
{{{{
  "email": "new@example.com",
  "password": "password123",
  "name": "Jane Smith"
}}}}
```

**レスポンス** (201 Created):
```json
{{{{
  "id": "user-456",
  "message": "申請を受け付けました。承認をお待ちください。"
}}}}
```

### プロジェクト (Projects)

#### GET /projects
プロジェクト一覧取得

**クエリパラメータ**:
- `page` (integer, optional): ページ番号（デフォルト: 1）
- `limit` (integer, optional): 1ページあたりの件数（デフォルト: 20）

**レスポンス** (200 OK):
```json
{{{{
  "projects": [
    {{{{
      "id": "proj-123",
      "name": "My Project",
      "description": "Project description",
      "current_phase": 2,
      "created_at": "2025-11-09T00:00:00Z"
    }}}}
  ],
  "total": 10,
  "page": 1,
  "limit": 20
}}}}
```

#### POST /projects
プロジェクト作成

**リクエスト**:
```json
{{{{
  "name": "New Project",
  "description": "Project description"
}}}}
```

**レスポンス** (201 Created):
```json
{{{{
  "id": "proj-789",
  "name": "New Project",
  "current_phase": 1,
  "created_at": "2025-11-09T00:00:00Z"
}}}}
```

### メッセージ (Messages)

#### POST /projects/{{{{project_id}}}}/messages
AIにメッセージ送信（SSE）

**リクエスト**:
```json
{{{{
  "message": "ECサイトを作りたいです",
  "phase": 1
}}}}
```

**レスポンス** (SSE Stream):
```
event: token
data: {{{{"token": "了解"}}}}

event: token
data: {{{{"token": "しました"}}}}

event: complete
data: {{{{"message_id": "msg-123"}}}}
```

## エラーレスポンス

### 標準エラーフォーマット
```json
{{{{
  "error": "エラーメッセージ",
  "code": "ERROR_CODE",
  "details": {{{{}}}}
}}}}
```

### エラーコード一覧

| コード | HTTPステータス | 説明 |
|-------|--------------|------|
| UNAUTHORIZED | 401 | 認証エラー |
| FORBIDDEN | 403 | アクセス権限なし |
| NOT_FOUND | 404 | リソースが存在しない |
| VALIDATION_ERROR | 422 | バリデーションエラー |
| INTERNAL_ERROR | 500 | サーバーエラー |

## レート制限

- **制限**: 60リクエスト/分
- **ヘッダー**:
  - `X-RateLimit-Limit`: 60
  - `X-RateLimit-Remaining`: 45
  - `X-RateLimit-Reset`: 1699564800

## ベストプラクティス

### 1. ページネーション
```
GET /projects?page=1&limit=20
```

### 2. フィルタリング
```
GET /projects?status=active&phase=2
```

### 3. ソート
```
GET /projects?sort=created_at&order=desc
```

### 4. フィールド選択
```
GET /projects?fields=id,name,current_phase
```

---
*このAPI設計書は「マザーAI」Phase 11 API設計エージェントによって自動生成されました。*
"""

    openapi_spec = """openapi: 3.0.0
info:
  title: マザーAI API
  version: 1.0.0
  description: AI開発支援プラットフォーム

servers:
  - url: http://localhost:8572/api/v1
    description: Development server

paths:
  /auth/login:
    post:
      summary: ユーザーログイン
      tags: [Authentication]
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                email:
                  type: string
                password:
                  type: string
      responses:
        '200':
          description: ログイン成功
          content:
            application/json:
              schema:
                type: object
                properties:
                  access_token:
                    type: string
                  user:
                    type: object
"""

    return {
        "API_REFERENCE.md": api_doc,
        "openapi.yaml": openapi_spec
    }


def generate_ux_review(project_name: str) -> Dict[str, str]:
    """Phase 12: UX/UIレビューレポート生成"""

    review = f"""# 🎨 UX/UIレビューレポート - {project_name}

## レビュー実施日
{import_datetime()}

## 総合評価: B+ (85/100)

### ユーザビリティスコア
- **学習のしやすさ**: 90/100 ✅
- **効率性**: 80/100 ⚠️
- **記憶のしやすさ**: 85/100 ✅
- **エラー防止**: 75/100 ⚠️
- **満足度**: 88/100 ✅

## 検出された問題

### 🔴 クリティカル（即座の修正必要）

#### 1. アクセシビリティ問題
- **問題**: ボタンにaria-labelがない
- **影響**: スクリーンリーダー非対応
- **修正案**:
```tsx
<button aria-label="プロジェクトを作成">
  <AddIcon />
</button>
```

#### 2. モバイル対応
- **問題**: タップターゲットが小さい（32px未満）
- **影響**: モバイルで操作しづらい
- **修正案**: 最小44x44pxに拡大

### 🟡 改善推奨

#### 3. フィードバック不足
- **問題**: ローディング状態が不明瞭
- **修正案**: Skeletonローダーの追加
```tsx
import {{{{ Skeleton }}}} from '@mui/material'

<Skeleton variant="rectangular" height={200} />
```

#### 4. 色のコントラスト
- **問題**: テキストが読みづらい箇所（3箇所）
- **修正案**: WCAGコントラスト比4.5:1以上に

#### 5. エラーメッセージ
- **問題**: エラーが抽象的
- **例**: "エラーが発生しました" → "メールアドレスの形式が正しくありません"

### 🟢 良好な点

✅ **一貫したデザインシステム** - MUIの統一的な使用
✅ **レスポンシブデザイン** - モバイル・タブレット対応
✅ **直感的なナビゲーション** - わかりやすいメニュー構造

## UX改善提案

### 1. オンボーディング強化
```
初回ログイン時:
1. チュートリアル表示
2. サンプルプロジェクト作成
3. 主要機能のツアー
```

### 2. プログレスインジケーター
- Phase進行状況の視覚化
- ステップバイステップガイド
- 完了率の表示

### 3. ユーザーフィードバック
- 操作後の成功メッセージ
- エラーの具体的な説明
- ヘルプドキュメントへのリンク

## デザインシステム推奨事項

### カラーパレット
```typescript
const theme = {{{{
  primary: '#1976d2',      // メイン色
  secondary: '#9c27b0',    // アクセント色
  error: '#d32f2f',        // エラー
  warning: '#ed6c02',      // 警告
  success: '#2e7d32',      // 成功
  info: '#0288d1',         // 情報
}}}}
```

### タイポグラフィ
- **見出し**: Roboto Bold, 24-32px
- **本文**: Roboto Regular, 14-16px
- **キャプション**: Roboto Light, 12px

### スペーシング
- **基本単位**: 8px
- **セクション間**: 24px
- **コンポーネント間**: 16px

## アクセシビリティチェックリスト

- [ ] キーボードナビゲーション対応
- [ ] ARIAラベルの適切な使用
- [ ] 色のコントラスト比（WCAG AA準拠）
- [ ] フォーカスインジケーター
- [ ] スクリーンリーダー対応

## 次のステップ

### 即座の修正（今週）
1. ✅ ボタンにaria-label追加
2. ✅ タップターゲット拡大
3. ✅ ローディング状態改善

### 中期改善（今月）
4. ⏳ オンボーディング実装
5. ⏳ エラーメッセージ改善
6. ⏳ 色のコントラスト調整

### 長期改善（3ヶ月）
7. ⏳ デザインシステム文書化
8. ⏳ ユーザビリティテスト実施
9. ⏳ ダークモード対応

---
*このレビューは「マザーAI」Phase 12 UX/UIレビューエージェントによって自動生成されました。*
"""

    return {
        "UX_REVIEW.md": review
    }


def generate_refactoring_plan(project_name: str, generated_code: Dict) -> Dict[str, str]:
    """Phase 13: リファクタリング計画生成"""

    plan = f"""# ♻️ リファクタリング計画 - {project_name}

## 実施日時
{import_datetime()}

## コード品質評価: B (78/100)

### 品質指標
- **可読性**: 82/100 ✅
- **保守性**: 75/100 ⚠️
- **テストカバレッジ**: 65/100 ⚠️
- **コード重複**: 20% ⚠️
- **循環的複雑度**: やや高い ⚠️

## リファクタリング対象

### 🔴 優先度: 高

#### 1. 重複コードの削除
**箇所**: `src/pages/Dashboard.tsx`, `src/pages/Projects.tsx`

**問題**:
```typescript
// Dashboard.tsx
const fetchData = async () => {{{{
  const response = await axios.get('/api/data')
  setData(response.data)
}}}}

// Projects.tsx（重複）
const fetchProjects = async () => {{{{
  const response = await axios.get('/api/projects')
  setProjects(response.data)
}}}}
```

**リファクタリング後**:
```typescript
// hooks/useApi.ts
export const useApi = <T>(url: string) => {{{{
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(false)

  const fetchData = async () => {{{{
    setLoading(true)
    const response = await axios.get(url)
    setData(response.data)
    setLoading(false)
  }}}}

  return {{{{ data, loading, fetchData }}}}
}}}}
```

#### 2. 長すぎる関数の分割
**箇所**: `src/services/projectService.ts`: `createProject()` (150行)

**問題**: 1つの関数が150行で複雑すぎる

**リファクタリング後**:
```typescript
// Before: 1つの長い関数
const createProject = async (data) => {{{{
  // 150行の処理...
}}}}

// After: 小さな関数に分割
const validateProjectData = (data) => {{{{ /* ... */ }}}}
const prepareProjectPayload = (data) => {{{{ /* ... */ }}}}
const saveProjectToDb = (payload) => {{{{ /* ... */ }}}}
const notifyProjectCreation = (project) => {{{{ /* ... */ }}}}

const createProject = async (data) => {{{{
  validateProjectData(data)
  const payload = prepareProjectPayload(data)
  const project = await saveProjectToDb(payload)
  await notifyProjectCreation(project)
  return project
}}}}
```

#### 3. マジックナンバーの定数化
**箇所**: 複数ファイル

**問題**:
```typescript
if (phase > 14) {{{{ /* ... */ }}}}  // 14は何？
setTimeout(() => {{{{}}}}, 5000)     // 5000は何？
```

**リファクタリング後**:
```typescript
const MAX_PHASE = 14
const TIMEOUT_MS = 5000

if (phase > MAX_PHASE) {{{{ /* ... */ }}}}
setTimeout(() => {{{{}}}}, TIMEOUT_MS)
```

### 🟡 優先度: 中

#### 4. 型安全性の向上
**箇所**: `src/types/index.ts`

**問題**: `any`型の使用（5箇所）

**リファクタリング後**:
```typescript
// Before
const handleData = (data: any) => {{{{ /* ... */ }}}}

// After
interface ProjectData {{{{
  id: string
  name: string
  phase: number
}}}}

const handleData = (data: ProjectData) => {{{{ /* ... */ }}}}
```

#### 5. エラーハンドリングの統一
**箇所**: 複数のAPIコール

**問題**: エラーハンドリングが各所でバラバラ

**リファクタリング後**:
```typescript
// utils/errorHandler.ts
export const handleApiError = (error: AxiosError) => {{{{
  if (error.response?.status === 401) {{{{
    // 認証エラー処理
  }}}} else if (error.response?.status === 404) {{{{
    // Not Found処理
  }}}}
  // ...
}}}}

// 使用例
try {{{{
  await api.get('/data')
}}}} catch (error) {{{{
  handleApiError(error as AxesError)
}}}}
```

### 🟢 優先度: 低

#### 6. コメントの追加
- 複雑なロジックへのコメント追加
- JSDocの追加（関数説明）

#### 7. 命名の改善
- 略語の使用を減らす
- より説明的な変数名に

## リファクタリングスケジュール

### Week 1: 基礎強化
- [x] 重複コード削除
- [x] 長い関数の分割
- [x] マジックナンバーの定数化

### Week 2: 品質向上
- [ ] 型安全性の向上
- [ ] エラーハンドリング統一
- [ ] テストカバレッジ80%達成

### Week 3: 仕上げ
- [ ] コメント追加
- [ ] 命名改善
- [ ] ドキュメント更新

## テスト戦略

### ユニットテスト
```typescript
describe('createProject', () => {{{{
  it('should create project successfully', async () => {{{{
    const data = {{{{ name: 'Test Project' }}}}
    const result = await createProject(data)
    expect(result).toBeDefined()
    expect(result.name).toBe('Test Project')
  }}}})

  it('should throw error for invalid data', async () => {{{{
    const data = {{{{ name: '' }}}}
    await expect(createProject(data)).rejects.toThrow()
  }}}})
}}}})
```

### リファクタリング前後の比較テスト
- 機能が変わっていないことを確認
- パフォーマンスの改善を測定

## 期待される効果

### コード品質
- **可読性**: 82 → 90
- **保守性**: 75 → 88
- **テストカバレッジ**: 65% → 85%

### 開発効率
- バグ修正時間: 30%短縮
- 新機能追加時間: 20%短縮
- コードレビュー時間: 25%短縮

---
*この計画は「マザーAI」Phase 13リファクタリングエージェントによって自動生成されました。*
"""

    return {
        "REFACTORING_PLAN.md": plan
    }


def generate_monitoring_setup(project_name: str) -> Dict[str, str]:
    """Phase 14: モニタリング設定生成"""

    monitoring = f"""# 📊 モニタリング設定 - {project_name}

## 設定日時
{import_datetime()}

## モニタリング戦略

### 監視対象

#### 1. アプリケーションメトリクス
- **レスポンスタイム**: 平均・p95・p99
- **エラー率**: 4xx/5xxエラーの割合
- **スループット**: リクエスト/秒
- **アクティブユーザー数**: 同時接続数

#### 2. インフラメトリクス
- **CPU使用率**: <70%を維持
- **メモリ使用率**: <80%を維持
- **ディスク使用率**: <85%で警告
- **ネットワークトラフィック**: 帯域幅監視

#### 3. ビジネスメトリクス
- **新規ユーザー登録数**: 日次/週次
- **プロジェクト作成数**: 日次/週次
- **Phase完了率**: Phase別の完了率
- **ユーザー離脱率**: チャーン率

## 実装例

### 1. フロントエンドモニタリング（Sentry）

```typescript
// frontend/src/main.tsx
import * as Sentry from "@sentry/react"

Sentry.init({{{{
  dsn: import.meta.env.VITE_SENTRY_DSN,
  integrations: [
    new Sentry.BrowserTracing(),
    new Sentry.Replay(),
  ],
  tracesSampleRate: 0.1,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
}}}})

// エラーキャプチャ
try {{{{
  riskyOperation()
}}}} catch (error) {{{{
  Sentry.captureException(error)
}}}}
```

### 2. バックエンドモニタリング（Prometheus + Grafana）

```python
# backend/app/monitoring.py
from prometheus_client import Counter, Histogram, generate_latest

# メトリクス定義
request_count = Counter(
    'http_requests_total',
    'Total HTTP requests',
    ['method', 'endpoint', 'status']
)

request_duration = Histogram(
    'http_request_duration_seconds',
    'HTTP request duration',
    ['method', 'endpoint']
)

# FastAPIミドルウェア
@app.middleware("http")
async def monitor_requests(request: Request, call_next):
    start_time = time.time()

    response = await call_next(request)

    duration = time.time() - start_time

    request_count.labels(
        method=request.method,
        endpoint=request.url.path,
        status=response.status_code
    ).inc()

    request_duration.labels(
        method=request.method,
        endpoint=request.url.path
    ).observe(duration)

    return response

# メトリクスエンドポイント
@app.get("/metrics")
def metrics():
    return Response(generate_latest(), media_type="text/plain")
```

### 3. ログ集約（Loki）

```python
# backend/app/logging_config.py
import logging
import logging_loki

handler = logging_loki.LokiHandler(
    url="https://loki.example.com/loki/api/v1/push",
    tags={{{{"application": "mother-ai"}}}},
    version="1",
)

logger = logging.getLogger("mother-ai")
logger.addHandler(handler)
logger.setLevel(logging.INFO)

# 使用例
logger.info("Project created", extra={{{{
    "project_id": project.id,
    "user_id": user.id,
    "phase": project.current_phase
}}}})
```

## ダッシュボード設定

### Grafanaダッシュボード

#### パネル1: レスポンスタイム
```
Query: rate(http_request_duration_seconds_sum[5m]) / rate(http_request_duration_seconds_count[5m])
Legend: {{{{method}}}} {{{{endpoint}}}}
```

#### パネル2: エラー率
```
Query: sum(rate(http_requests_total{{{{status=~"5.."}}}}[5m])) / sum(rate(http_requests_total[5m]))
Alert: > 0.01 (1%のエラー率で警告)
```

#### パネル3: アクティブユーザー数
```
Query: count(active_users)
Refresh: 1m
```

## アラート設定

### クリティカルアラート（即座の対応）
```yaml
alerts:
  - name: HighErrorRate
    condition: error_rate > 0.05  # 5%
    duration: 5m
    action: PagerDuty + Slack

  - name: ServiceDown
    condition: up == 0
    duration: 1m
    action: PagerDuty + SMS

  - name: HighLatency
    condition: p95_latency > 2s
    duration: 10m
    action: Slack
```

### 警告アラート（監視継続）
```yaml
warnings:
  - name: HighCPU
    condition: cpu_usage > 70%
    duration: 15m
    action: Slack

  - name: HighMemory
    condition: memory_usage > 80%
    duration: 15m
    action: Slack
```

## ヘルスチェック

### エンドポイント
```python
@app.get("/health")
def health_check():
    return {{{{
        "status": "healthy",
        "database": check_database(),
        "cache": check_cache(),
        "external_apis": check_external_apis(),
        "timestamp": datetime.utcnow().isoformat()
    }}}}
```

### 自動復旧
```bash
# Kubernetes liveness probe
livenessProbe:
  httpGet:
    path: /health
    port: 8000
  initialDelaySeconds: 30
  periodSeconds: 10
  failureThreshold: 3
```

## パフォーマンス追跡

### APM (Application Performance Monitoring)
```typescript
// New Relic設定例
import newrelic from 'newrelic'

newrelic.setTransactionName('CreateProject')
newrelic.addCustomAttribute('user_id', userId)
newrelic.addCustomAttribute('project_type', projectType)
```

## データ保持ポリシー

| データ種別 | 保持期間 | 保存先 |
|-----------|---------|--------|
| メトリクス | 30日 | Prometheus |
| ログ | 90日 | Loki |
| トレース | 7日 | Jaeger |
| アラート履歴 | 1年 | Alertmanager |

## 運用手順書

### 障害発生時
1. アラート受信
2. ダッシュボードで状況確認
3. ログで原因特定
4. 対応実施
5. インシデントレポート作成

### 定期メンテナンス
- **日次**: ログレビュー、エラー確認
- **週次**: パフォーマンストレンド分析
- **月次**: キャパシティプランニング

---
*この設定は「マザーAI」Phase 14モニタリングエージェントによって自動生成されました。*
"""

    prometheus_config = """# prometheus.yml
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'mother-ai-backend'
    static_configs:
      - targets: ['localhost:8000']
    metrics_path: '/metrics'

  - job_name: 'mother-ai-frontend'
    static_configs:
      - targets: ['localhost:3000']
"""

    return {
        "MONITORING_SETUP.md": monitoring,
        "prometheus.yml": prometheus_config,
        "grafana-dashboard.json": '{"dashboard": "placeholder"}'
    }


def import_datetime() -> str:
    """現在時刻を日本語フォーマットで返す"""
    from datetime import datetime
    return datetime.now().strftime("%Y年%m月%d日 %H:%M:%S")
