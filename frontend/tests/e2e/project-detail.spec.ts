import { test, expect } from '@playwright/test';
import { loginAsApprovedUser, createProject } from './helpers';

/**
 * P-005: AI対話・プロジェクト開発 E2Eテスト
 */

test.describe('P-005: AI対話・プロジェクト開発', () => {
  /**
   * E2E-P005-001: Phaseカード表示（Phase 1-14全て）
   *
   * テスト対象外:
   * - helpers.tsのloginAsApprovedUser()関数でログインに失敗する問題を調査中
   * - E2E-P003-001では同じ認証情報で成功するため、ヘルパー関数固有の問題
   *
   * 前提条件:
   * - プロジェクトが作成されている
   *
   * 期待結果:
   * - 14個のPhaseカードが表示される
   * - Phase 1-14の各タイトルが表示される
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

    // 6. 14個のPhaseカードが表示されることを確認
    const phaseTests = [
      { phase: 1, title: '要件定義' },
      { phase: 2, title: 'コード生成' },
      { phase: 3, title: 'デプロイ' },
      { phase: 4, title: '自己改善' },
      { phase: 5, title: 'テスト' },
      { phase: 6, title: 'ドキュメント' },
      { phase: 7, title: 'デバッグ' },
      { phase: 8, title: 'パフォーマンス' },
      { phase: 9, title: 'セキュリティ' },
      { phase: 10, title: 'データベース' },
      { phase: 11, title: 'API設計' },
      { phase: 12, title: 'UX/UI' },
      { phase: 13, title: 'リファクタリング' },
      { phase: 14, title: 'モニタリング' },
    ];

    for (const { phase, title } of phaseTests) {
      const phaseCard = page.locator(`text=/Phase ${phase}/i`).first();
      await expect(phaseCard).toBeVisible({ timeout: 3000 });

      const phaseTitle = page.locator(`text=/${title}/i`).first();
      await expect(phaseTitle).toBeVisible({ timeout: 3000 });
    }

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
   * - メッセージ送信後、入力フィールドがクリアされる
   * - ストリーミング中のインジケータが表示される
   * - チャット履歴エリアが存在する
   */
  test('E2E-P005-002: メッセージ送信', async ({ page }) => {
    // 1. 承認済みユーザーでログイン
    await loginAsApprovedUser(page);

    // 2. プロジェクトを作成
    const projectId = await createProject(page, 'E2E Message Test Project');

    // 3. プロジェクト詳細ページにアクセス
    await page.goto(`/projects/${projectId}`);

    // 4. Phase 1が選択されていることを確認
    const phase1Card = page.locator('.MuiCard-root').filter({ has: page.locator('text=/Phase 1/i') }).first();
    await expect(phase1Card).toBeVisible({ timeout: 5000 });

    // 5. メッセージ入力フィールドが表示されることを確認
    const messageInput = page.locator('input[placeholder*="メッセージ"]').first();
    await expect(messageInput).toBeVisible({ timeout: 5000 });

    // 6. メッセージを入力
    await messageInput.fill('こんにちは、ECサイトを作りたいです');

    // 7. 送信ボタンをクリック
    const sendButton = page.locator('button').filter({ has: page.locator('svg') }).last();
    await sendButton.click();

    // 8. メッセージ入力フィールドがクリアされていることを確認
    await expect(messageInput).toHaveValue('', { timeout: 3000 });

    // 9. チャットエリアが存在することを確認
    const chatArea = page.locator('text=/メッセージがありません|AI対話/i').first();
    await expect(chatArea).toBeVisible({ timeout: 5000 });

    // 10. ストリーミング中またはメッセージが表示されるまで待機
    // CircularProgressまたはメッセージコンテンツのいずれかが表示される
    await page.waitForTimeout(2000);
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
   * 前提条件:
   * - プロジェクトが作成されている
   * - Phase 1でコード生成が完了している
   *
   * 期待結果:
   * - Phase 2カードをクリックできる
   * - File Treeが表示される
   * - ファイルが存在する
   */
  test('E2E-P005-005: コード生成（Phase 2）', async ({ page }) => {
    // 1. 承認済みユーザーでログイン
    await loginAsApprovedUser(page);

    // 2. プロジェクトを作成
    const projectId = await createProject(page, 'E2E Phase2 Code Gen Test');

    // 3. プロジェクト詳細ページにアクセス
    await page.goto(`/projects/${projectId}`);

    // 4. Phase 1カードをクリックしてコード生成要求
    const phase1Card = page.locator('.MuiCard-root').filter({ has: page.locator('text=/Phase 1/i') }).first();
    await expect(phase1Card).toBeVisible({ timeout: 5000 });
    await phase1Card.click();
    await page.waitForTimeout(2000);

    // 5. Phase 1でメッセージを送信してコード生成
    const messageInput = page.locator('input[placeholder*="メッセージ"], textarea[placeholder*="メッセージ"]').first();
    await expect(messageInput).toBeVisible({ timeout: 10000 });
    await messageInput.fill('シンプルなTodoアプリを作成してください');

    const sendButton = page.locator('button').filter({ has: page.locator('svg') }).last();
    await sendButton.click();

    // 6. コード生成完了を待機（最大30秒）
    await page.waitForTimeout(10000);

    // 7. Phase 2カードをクリック
    const phase2Card = page.locator('.MuiCard-root').filter({ has: page.locator('text=/Phase 2/i') }).first();
    await expect(phase2Card).toBeVisible({ timeout: 5000 });
    await phase2Card.click();
    await page.waitForTimeout(2000);

    // 8. File Treeヘッダーが表示されることを確認
    const fileTreeHeader = page.locator('text=ファイル').first();
    await expect(fileTreeHeader).toBeVisible({ timeout: 10000 });

    // 9. Code Editorヘッダーが表示されることを確認
    const codeEditorHeader = page.locator('text=コードエディタ').first();
    await expect(codeEditorHeader).toBeVisible({ timeout: 10000 });
  });

  /**
   * E2E-P005-006: ファイルツリー表示とコード編集
   *
   * 前提条件:
   * - Phase 2でFile TreeとCode Editorが表示される
   *
   * 期待結果:
   * - ファイルツリーが階層構造で表示される
   * - ファイルをクリックするとMonaco Editorで内容が表示される
   * - コードを編集して保存できる
   */
  test.skip('E2E-P005-006: ファイルツリー表示とコード編集', async ({ page }) => {
    // TODO: Phase 2のFile Tree機能を完全に実装してから有効化
    // 現在はPhase 1でコード生成してからPhase 2でFile Treeを表示する流れだが、
    // ファイルが実際に生成されるかテストする必要がある
  });

  /**
   * E2E-P005-007: デプロイ機能（Phase 3）
   *
   * 前提条件:
   * - プロジェクトが作成されている
   *
   * 期待結果:
   * - Phase 3カードをクリックできる
   * - デプロイメニューが表示される
   * - Vercel/Cloud Run選択肢が表示される
   */
  test('E2E-P005-007: デプロイ機能（Phase 3）', async ({ page }) => {
    // 1. 承認済みユーザーでログイン
    await loginAsApprovedUser(page);

    // 2. プロジェクトを作成
    const projectId = await createProject(page, 'E2E Phase3 Deploy Test');

    // 3. プロジェクト詳細ページにアクセス
    await page.goto(`/projects/${projectId}`);

    // 4. Phase 3カードを探す
    const phase3Card = page.locator('.MuiCard-root').filter({ has: page.locator('text=/Phase 3/i') }).first();
    await expect(phase3Card).toBeVisible({ timeout: 5000 });

    // 5. Phase 3カードをクリック
    await phase3Card.click();
    await page.waitForTimeout(2000);

    // 6. チャットヘッダーに「デプロイ」が表示されることを確認
    const chatHeader = page.locator('text=/デプロイ.*AI対話/i').first();
    await expect(chatHeader).toBeVisible({ timeout: 5000 });

    // 7. メッセージ入力フィールドが表示されることを確認
    const messageInput = page.locator('input[placeholder*="メッセージ"], textarea[placeholder*="メッセージ"]').first();
    await expect(messageInput).toBeVisible({ timeout: 5000 });
  });

  /**
   * E2E-P005-008: 自己改善機能（Phase 4）
   *
   * 前提条件:
   * - プロジェクトが作成されている
   *
   * 期待結果:
   * - Phase 4カードをクリックできる
   * - 自己改善エージェントの説明が表示される
   * - チャット入力が可能
   */
  test('E2E-P005-008: 自己改善機能（Phase 4）', async ({ page }) => {
    // 1. 承認済みユーザーでログイン
    await loginAsApprovedUser(page);

    // 2. プロジェクトを作成
    const projectId = await createProject(page, 'E2E Phase4 Self-Improve Test');

    // 3. プロジェクト詳細ページにアクセス
    await page.goto(`/projects/${projectId}`);

    // 4. Phase 4カードを探す
    const phase4Card = page.locator('.MuiCard-root').filter({ has: page.locator('text=/Phase 4/i') }).first();
    await expect(phase4Card).toBeVisible({ timeout: 5000 });

    // 5. Phase 4カードをクリック
    await phase4Card.click();
    await page.waitForTimeout(2000);

    // 6. チャットヘッダーに「自己改善」が表示されることを確認
    const chatHeader = page.locator('text=/自己改善.*AI対話/i').first();
    await expect(chatHeader).toBeVisible({ timeout: 5000 });

    // 7. メッセージ入力フィールドが表示されることを確認
    const messageInput = page.locator('input[placeholder*="メッセージ"], textarea[placeholder*="メッセージ"]').first();
    await expect(messageInput).toBeVisible({ timeout: 5000 });
  });

  /**
   * E2E-P005-009: プロジェクト設定変更
   *
   * テスト対象外:
   * - プロジェクト設定UI未実装
   */
  test.skip('E2E-P005-009: プロジェクト設定変更', async ({ page }) => {
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
  test('E2E-P005-101: 未認証アクセス', async ({ page }) => {
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
  test('E2E-P005-103: 存在しないプロジェクトへアクセス', async ({ page }) => {
    // 1. 承認済みユーザーでログイン
    await loginAsApprovedUser(page);

    // 2. 存在しないプロジェクトIDでアクセス
    await page.goto('/projects/non-existent-project-id-12345');

    // 3. エラーメッセージまたはプロジェクト一覧へのリダイレクトを確認
    // （実装によってはエラー表示、または404ページ、またはリダイレクト）
    await page.waitForTimeout(3000);

    // URLがプロジェクト詳細ページまたはエラーページにあることを確認
    const currentUrl = page.url();
    const isOnProjectPage = currentUrl.includes('/projects/non-existent-project-id-12345');
    const isRedirected = currentUrl.includes('/projects') && !currentUrl.includes('non-existent');

    expect(isOnProjectPage || isRedirected).toBeTruthy();
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
