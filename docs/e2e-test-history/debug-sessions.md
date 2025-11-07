# デバッグセッション履歴

総セッション数: 2回
総所要時間: 10分
平均所要時間: 5分/セッション

---

## #DS-002: E2E-P005-001（Vite環境変数未読み込み & helpers.ts問題）

**日時**: 2025-11-07 12:15 - 12:20
**所要時間**: 5分
**担当**: デバッグマスター #2
**対象テストID**: E2E-P005-001
**エスカレーション**: 0回

### 問題
1. frontend/.env.localの環境変数がViteに読み込まれていなかった（Vite再起動が必要）
2. helpers.tsのcreateProject()関数で`.first()`を使用していたため、新しく作成したプロジェクトではなく既存のプロジェクトの詳細ページに遷移していた

### 調査
1. SCOPE_PROGRESS.mdのエラーレポート確認
2. frontend/.env.localの存在確認（ファイルは既に存在）
3. Viteサーバーの状態確認と再起動
4. テスト再実行 → ログイン成功、しかしプロジェクト名不一致
5. error-context.mdで画面状態を確認し、helpers.tsの問題を特定

### 対応
1. Viteサーバーを再起動して環境変数を再読み込み
2. helpers.ts:161-166を修正：
   ```typescript
   // 変更前
   const detailButton = page.getByRole('button', { name: '詳細を見る' }).first();

   // 変更後（新しく作成したプロジェクトカード内のボタンを確実にクリック）
   const projectCard = page.locator('.MuiCard-root').filter({ has: page.locator(`text=${projectName}`) }).first();
   const detailButton = projectCard.getByRole('button', { name: '詳細を見る' });
   ```

### 結果
Pass ✅（E2EテストPass確認 - 6.9秒）

### 学び
- Viteは起動時に.envファイルを読み込むため、環境変数変更時は必ず再起動が必要
- Playwrightの`.first()`は意図しない要素を選択する可能性がある
- プロジェクトカード内の要素を確実に選択するには、`.filter()`でカードを絞り込んでから内部要素を取得
- error-context.mdの画面スナップショットは問題特定に非常に有効

---

## #DS-001: E2E-P003-101（VITE_API_URL環境変数未設定）

**日時**: 2025-11-07 11:20 - 11:25
**所要時間**: 5分
**担当**: デバッグマスター #1
**対象テストID**: E2E-P003-101
**エスカレーション**: 0回

### 問題
VITE_API_URL環境変数が未設定により、フロントエンドがバックエンドAPIに接続できず「Network Error」が表示される問題

### 調査
1. SCOPE_PROGRESS.mdのエラーレポートを確認
2. ルートディレクトリの.env.localを確認 → VITE_API_URLが設定されていることを確認
3. frontend/.env.localの存在を確認 → ファイルが存在しないことを発見
4. Viteの環境変数読み込み仕様を確認 → 実行ディレクトリ（frontend/）の.envファイルを読み込むことを確認

### 対応
1. frontend/.env.localを作成
   ```
   VITE_API_URL=http://localhost:8572/api/v1
   VITE_FRONTEND_URL=http://localhost:3347
   ```
2. フロントエンドサーバーを再起動（Viteは環境変数変更時に再起動が必須）
3. E2Eテスト再実行

### 結果
Pass ✅（E2Eテスト再実行で成功確認 - 5.2秒）

### 学び
- Viteは実行ディレクトリ（frontend/）の.envファイルを読み込む
- ルートディレクトリの.env.localは、Viteからは読み込まれない
- 環境変数変更時は必ずViteを再起動する必要がある
- VITE_プレフィックスが付いた環境変数のみがフロントエンドで利用可能

---
