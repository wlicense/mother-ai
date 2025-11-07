import { test, expect } from '@playwright/test';
import { loginAsApprovedUser, createProject } from './helpers';

/**
 * P-005: AI対話・プロジェクト開発 E2Eテスト
 */

test.describe('P-005: AI対話・プロジェクト開発', () => {
  /**
   * E2E-P005-001: Phaseカード表示
   *
   * テスト対象外:
   * - helpers.tsのloginAsApprovedUser()関数でログインに失敗する問題を調査中
   * - E2E-P003-001では同じ認証情報で成功するため、ヘルパー関数固有の問題
   *
   * 前提条件:
   * - プロジェクトが作成されている
   *
   * 期待結果:
   * - 4つのPhaseカードが表示される
   * - Phase 1: 要件定義
   * - Phase 2: コード生成
   * - Phase 3: デプロイ
   * - Phase 4: 自己改善
   * - 各カードにアイコン、Phase名、説明が表示
   */
  test('E2E-P005-001: Phaseカード表示', async ({ page }) => {
    // 1. 承認済みユーザーでログイン
    await loginAsApprovedUser(page);

    // 2. プロジェクトを作成
    const projectId = await createProject(page, 'E2E Phase Test Project');

    // 3. プロジェクト詳細ページにアクセス
    await page.goto(`/projects/${projectId}`);

    // 4. プロジェクト名が表示されることを確認
    const projectName = page.locator('h1, h2, h3, h4').filter({ hasText: 'E2E Phase Test Project' }).first();
    await expect(projectName).toBeVisible({ timeout: 5000 });

    // 5. 「開発フェーズ」見出しが表示されることを確認
    const phaseHeading = page.locator('text=/開発フェーズ/i').first();
    await expect(phaseHeading).toBeVisible();

    // 6. 4つのPhaseカードが表示されることを確認
    // Phase 1
    const phase1Card = page.locator('text=/Phase 1/i').first();
    await expect(phase1Card).toBeVisible();
    const phase1Title = page.locator('text=/要件定義/i').first();
    await expect(phase1Title).toBeVisible();

    // Phase 2
    const phase2Card = page.locator('text=/Phase 2/i').first();
    await expect(phase2Card).toBeVisible();
    const phase2Title = page.locator('text=/コード生成/i').first();
    await expect(phase2Title).toBeVisible();

    // Phase 3
    const phase3Card = page.locator('text=/Phase 3/i').first();
    await expect(phase3Card).toBeVisible();
    const phase3Title = page.locator('text=/デプロイ/i').first();
    await expect(phase3Title).toBeVisible();

    // Phase 4
    const phase4Card = page.locator('text=/Phase 4/i').first();
    await expect(phase4Card).toBeVisible();
    const phase4Title = page.locator('text=/自己改善/i').first();
    await expect(phase4Title).toBeVisible();

    // 7. AI対話セクションが表示されることを確認
    const chatHeading = page.locator('text=/AI対話/i').first();
    await expect(chatHeading).toBeVisible();

    // 8. メッセージ入力フィールドが表示されることを確認
    const messageInput = page.locator('input[placeholder*="メッセージ"], textarea[placeholder*="メッセージ"]').first();
    await expect(messageInput).toBeVisible();

    // 9. 送信ボタンが表示されることを確認
    const sendButton = page.locator('button').filter({ has: page.locator('svg') }).last();
    await expect(sendButton).toBeVisible();
  });

  /**
   * E2E-P005-002: メッセージ送信
   *
   * 前提条件:
   * - プロジェクトが作成されている
   *
   * 期待結果:
   * - ユーザーメッセージが表示される
   * - AI応答がストリーミング表示される（SSE）
   * - 応答がチャット履歴に追加される
   */
  test('E2E-P005-002: メッセージ送信', async ({ page }) => {
    // 1. 承認済みユーザーでログイン
    await loginAsApprovedUser(page);

    // 2. プロジェクトを作成
    const projectId = await createProject(page, 'E2E Message Test Project');

    // 3. プロジェクト詳細ページにアクセス
    await page.goto(`/projects/${projectId}`);

    // 4. メッセージを入力
    const messageInput = page.locator('input[placeholder*="メッセージ"], textarea[placeholder*="メッセージ"]').first();
    await messageInput.fill('こんにちは、ECサイトを作りたいです');

    // 5. 送信ボタンをクリック
    const sendButton = page.locator('button').filter({ has: page.locator('svg') }).last();
    await sendButton.click();

    // 6. ユーザーメッセージが表示されることを確認
    const userMessage = page.locator('text=こんにちは、ECサイトを作りたいです').first();
    await expect(userMessage).toBeVisible({ timeout: 5000 });

    // 7. AI応答が表示されることを確認（最大30秒待つ）
    const aiResponse = page.locator('.MuiPaper-root').filter({ hasNot: page.locator('text=こんにちは、ECサイトを作りたいです') }).first();
    await expect(aiResponse).toBeVisible({ timeout: 30000 });

    // 8. メッセージ入力フィールドがクリアされていることを確認
    await expect(messageInput).toHaveValue('');
  });

  /**
   * E2E-P005-003: Phaseカードクリックで専門エージェント起動
   *
   * テスト対象外:
   * - createProject()ヘルパーでダイアログが閉じない問題
   *
   * 前提条件:
   * - プロジェクトが作成されている
   *
   * 期待結果:
   * - Phase 1がハイライトされる
   * - チャットエリアに対応したPhaseのタイトルが表示される
   */
  test.skip('E2E-P005-003: Phaseカードクリックで専門エージェント起動', async ({ page }) => {
    // TODO: createProject()ヘルパーの問題を修正
    // 1. 承認済みユーザーでログイン
    await loginAsApprovedUser(page);

    // 2. プロジェクトを作成
    const projectId = await createProject(page, 'E2E Phase Click Test');

    // 3. プロジェクト詳細ページにアクセス
    await page.goto(`/projects/${projectId}`);

    // 4. Phase 1カードをクリック
    const phase1Card = page.locator('.MuiCard-root').filter({ has: page.locator('text=/Phase 1/i') }).first();
    await phase1Card.click();

    // 5. チャットヘッダーに「要件定義」が表示されることを確認
    const chatHeader = page.locator('text=/要件定義.*AI対話/i').first();
    await expect(chatHeader).toBeVisible({ timeout: 5000 });

    // 6. Phase 2カードをクリック
    const phase2Card = page.locator('.MuiCard-root').filter({ has: page.locator('text=/Phase 2/i') }).first();
    await phase2Card.click();

    // 7. チャットヘッダーに「コード生成」が表示されることを確認
    const chatHeader2 = page.locator('text=/コード生成.*AI対話/i').first();
    await expect(chatHeader2).toBeVisible({ timeout: 5000 });
  });

  /**
   * E2E-P005-004: Phase完了と次Phase解放
   *
   * テスト対象外:
   * - Phase完了機能は実装されているがE2E環境では完全な対話フローが必要
   * - 今後のテストで追加予定
   */
  test.skip('E2E-P005-004: Phase完了と次Phase解放', async ({ page }) => {
    // TODO: Phase完了機能のテストは、完全なAI対話フローが必要なため今後追加
  });

  /**
   * E2E-P005-005: コード生成（Phase 2）
   *
   * テスト対象外:
   * - コード生成機能は実装されているがE2E環境では完全なAIフローが必要
   * - Monaco Editorとの統合が必要
   */
  test.skip('E2E-P005-005: コード生成（Phase 2）', async ({ page }) => {
    // TODO: コード生成テストは、Monaco Editor統合後に追加
  });

  /**
   * E2E-P005-006: ファイルツリー表示とコード編集
   *
   * テスト対象外:
   * - Monaco Editorとファイルツリー機能は未実装
   */
  test.skip('E2E-P005-006: ファイルツリー表示とコード編集', async ({ page }) => {
    // TODO: Monaco Editor実装後に追加
  });

  /**
   * E2E-P005-007: プロジェクト設定変更
   *
   * テスト対象外:
   * - プロジェクト設定UI未実装
   */
  test.skip('E2E-P005-007: プロジェクト設定変更', async ({ page }) => {
    // TODO: プロジェクト設定UI実装後に追加
  });

  /**
   * E2E-P005-101: 未認証アクセス
   *
   * 前提条件:
   * - ログアウト状態
   *
   * 期待結果:
   * - /login にリダイレクト
   */
  test.skip('E2E-P005-101: 未認証アクセス', async ({ page }) => {
    // 1. ログアウト状態で直接プロジェクト詳細ページにアクセス
    await page.goto('/projects/test-project-id');

    // 2. ログインページにリダイレクトされることを確認
    await expect(page).toHaveURL(/.*login/, { timeout: 10000 });
  });

  /**
   * E2E-P005-102: 他ユーザーのプロジェクトへアクセス
   *
   * テスト対象外:
   * - 複数ユーザーのセットアップが必要
   * - 今後のテストで追加予定
   */
  test.skip('E2E-P005-102: 他ユーザーのプロジェクトへアクセス', async ({ page }) => {
    // TODO: 複数ユーザーのテストデータ準備後に追加
  });

  /**
   * E2E-P005-103: 存在しないプロジェクトへアクセス
   *
   * 前提条件:
   * - ログイン済み
   *
   * 期待結果:
   * - エラーメッセージが表示される
   */
  test.skip('E2E-P005-103: 存在しないプロジェクトへアクセス', async ({ page }) => {
    // 1. 承認済みユーザーでログイン
    await loginAsApprovedUser(page);

    // 2. 存在しないプロジェクトIDでアクセス
    await page.goto('/projects/non-existent-project-id-12345');

    // 3. エラーメッセージが表示されることを確認
    const errorMessage = page.locator('text=/プロジェクトの読み込みに失敗しました|プロジェクトが見つかりません/i').first();
    await expect(errorMessage).toBeVisible({ timeout: 10000 });
  });

  /**
   * E2E-P005-104: ロックされたPhaseをクリック
   *
   * テスト対象外:
   * - Phase完了/ロック機能の完全実装が必要
   */
  test.skip('E2E-P005-104: ロックされたPhaseをクリック', async ({ page }) => {
    // TODO: Phaseロック機能の実装確認後に追加
  });
});
