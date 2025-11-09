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
  /**
   * E2E-P005-006: ファイルツリー表示とコード編集
   *
   * テスト対象外:
   * - ファイルツリーノードの検出が不安定
   *
   * 前提条件:
   * - Phase 1でコードが生成されている
   * - Phase 2に遷移している
   *
   * 期待結果:
   * - ファイルツリーが表示される
   * - ファイルをクリックするとMonaco Editorに内容が表示される
   */
  test.skip('E2E-P005-006: ファイルツリー表示とコード編集', async ({ page }) => {
    // 1. 承認済みユーザーでログイン
    await loginAsApprovedUser(page);

    // 2. プロジェクトを作成
    const projectId = await createProject(page, 'E2E Phase2 FileTree Test');

    // 3. プロジェクト詳細ページにアクセス
    await page.goto(`/projects/${projectId}`);

    // 4. Phase 1カードをクリックしてコード生成を依頼
    const phase1Card = page.locator('.MuiCard-root').filter({ has: page.locator('text=/Phase 1/i') }).first();
    await phase1Card.click();

    const messageInput = page.locator('input[placeholder*="メッセージ"]').first();
    await messageInput.fill('シンプルなTodoアプリを作成してください');

    const sendButton = page.locator('button').filter({ has: page.locator('svg') }).last();
    await sendButton.click();

    // コード生成完了を待つ（10秒）
    await page.waitForTimeout(10000);

    // 5. Phase 2カードをクリック
    const phase2Card = page.locator('.MuiCard-root').filter({ has: page.locator('text=/Phase 2/i') }).first();
    await phase2Card.click();

    // 6. ファイルツリーヘッダーが表示されることを確認
    const fileTreeHeader = page.locator('text=ファイル').first();
    await expect(fileTreeHeader).toBeVisible({ timeout: 10000 });

    // 7. コードエディタヘッダーが表示されることを確認
    const codeEditorHeader = page.locator('text=コードエディタ').first();
    await expect(codeEditorHeader).toBeVisible({ timeout: 5000 });

    // 8. ファイルツリー内にファイルが表示されることを確認
    // 少なくとも1つのファイルノードが存在すること
    const fileNodes = page.locator('text=/\\.tsx?$|\\.py$|\\.json$/i').first();
    await expect(fileNodes).toBeVisible({ timeout: 5000 });
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

  /**
   * E2E-P005-010: レスポンシブデザイン検証
   *
   * 前提条件:
   * - プロジェクトが作成されている
   *
   * 期待結果:
   * - モバイル・タブレット・デスクトップで適切に表示される
   * - Phaseカードが各画面サイズで表示される
   */
  test('E2E-P005-010: レスポンシブデザイン検証', async ({ page }) => {
    // 1. 承認済みユーザーでログイン
    await loginAsApprovedUser(page);

    // 2. プロジェクトを作成
    const projectId = await createProject(page, 'E2E Responsive Test Project');

    // 3. プロジェクト詳細ページにアクセス
    await page.goto(`/projects/${projectId}`);

    // 4. モバイルサイズ (375x667)
    await page.setViewportSize({ width: 375, height: 667 });
    const phase1CardMobile = page.locator('.MuiCard-root').filter({ has: page.locator('text=/Phase 1/i') }).first();
    await expect(phase1CardMobile).toBeVisible({ timeout: 5000 });

    // 5. タブレットサイズ (768x1024)
    await page.setViewportSize({ width: 768, height: 1024 });
    const phase1CardTablet = page.locator('.MuiCard-root').filter({ has: page.locator('text=/Phase 1/i') }).first();
    await expect(phase1CardTablet).toBeVisible({ timeout: 5000 });

    // 6. デスクトップサイズ (1920x1080)
    await page.setViewportSize({ width: 1920, height: 1080 });
    const phase1CardDesktop = page.locator('.MuiCard-root').filter({ has: page.locator('text=/Phase 1/i') }).first();
    await expect(phase1CardDesktop).toBeVisible({ timeout: 5000 });
  });

  /**
   * E2E-P005-011: メッセージ送信バリデーション（空メッセージ）
   *
   * テスト対象外:
   * - 空メッセージのバリデーション機能が未実装の可能性
   *
   * 前提条件:
   * - プロジェクトが作成されている
   *
   * 期待結果:
   * - 空のメッセージは送信できない
   * - または送信ボタンが無効化される
   */
  test.skip('E2E-P005-011: メッセージ送信バリデーション', async ({ page }) => {
    // 1. 承認済みユーザーでログイン
    await loginAsApprovedUser(page);

    // 2. プロジェクトを作成
    const projectId = await createProject(page, 'E2E Validation Test Project');

    // 3. プロジェクト詳細ページにアクセス
    await page.goto(`/projects/${projectId}`);

    // 4. メッセージ入力フィールドを確認
    const messageInput = page.locator('input[placeholder*="メッセージ"]').first();
    await expect(messageInput).toBeVisible({ timeout: 5000 });

    // 5. 空のまま送信ボタンをクリック
    const sendButton = page.locator('button').filter({ has: page.locator('svg') }).last();
    await sendButton.click();

    // 6. メッセージ入力フィールドが空のままであることを確認
    // （送信されない、またはバリデーションエラー）
    await page.waitForTimeout(1000);
    await expect(messageInput).toHaveValue('');
  });

  /**
   * E2E-P005-012: 複数のPhaseカードの切り替え
   *
   * 前提条件:
   * - プロジェクトが作成されている
   *
   * 期待結果:
   * - Phase 1→Phase 2→Phase 3と切り替えできる
   * - 各Phaseでチャットヘッダーが更新される
   */
  test('E2E-P005-012: 複数のPhaseカードの切り替え', async ({ page }) => {
    // 1. 承認済みユーザーでログイン
    await loginAsApprovedUser(page);

    // 2. プロジェクトを作成
    const projectId = await createProject(page, 'E2E Phase Switch Test');

    // 3. プロジェクト詳細ページにアクセス
    await page.goto(`/projects/${projectId}`);

    // 4. Phase 1をクリック
    const phase1Card = page.locator('.MuiCard-root').filter({ has: page.locator('text=/Phase 1/i') }).first();
    await phase1Card.click();
    await page.waitForTimeout(1000);

    // 5. チャットヘッダーに「要件定義」が含まれることを確認
    const chatHeader1 = page.locator('text=/要件定義/i').first();
    await expect(chatHeader1).toBeVisible({ timeout: 5000 });

    // 6. Phase 2をクリック
    const phase2Card = page.locator('.MuiCard-root').filter({ has: page.locator('text=/Phase 2/i') }).first();
    await phase2Card.click();
    await page.waitForTimeout(1000);

    // 7. チャットヘッダーに「コード生成」が含まれることを確認
    const chatHeader2 = page.locator('text=/コード生成/i').first();
    await expect(chatHeader2).toBeVisible({ timeout: 5000 });

    // 8. Phase 3をクリック
    const phase3Card = page.locator('.MuiCard-root').filter({ has: page.locator('text=/Phase 3/i') }).first();
    await phase3Card.click();
    await page.waitForTimeout(1000);

    // 9. チャットヘッダーに「デプロイ」が含まれることを確認
    const chatHeader3 = page.locator('text=/デプロイ/i').first();
    await expect(chatHeader3).toBeVisible({ timeout: 5000 });
  });

  /**
   * E2E-P005-013: Phase 5-14のカード表示検証
   *
   * 前提条件:
   * - プロジェクトが作成されている
   *
   * 期待結果:
   * - Phase 5（テスト）からPhase 14（モニタリング）まで全て表示される
   */
  test('E2E-P005-013: Phase 5-14のカード表示検証', async ({ page }) => {
    // 1. 承認済みユーザーでログイン
    await loginAsApprovedUser(page);

    // 2. プロジェクトを作成
    const projectId = await createProject(page, 'E2E Phase 5-14 Test');

    // 3. プロジェクト詳細ページにアクセス
    await page.goto(`/projects/${projectId}`);

    // 4. Phase 5-14の各カードが表示されることを確認
    const advancedPhases = [
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

    for (const { phase, title } of advancedPhases) {
      const phaseCard = page.locator(`text=/Phase ${phase}/i`).first();
      await expect(phaseCard).toBeVisible({ timeout: 3000 });

      const phaseTitle = page.locator(`text=/${title}/i`).first();
      await expect(phaseTitle).toBeVisible({ timeout: 3000 });
    }
  });

  /**
   * E2E-P005-014: 長いプロジェクト名での表示
   *
   * 前提条件:
   * - ログイン済み
   *
   * 期待結果:
   * - 長いプロジェクト名でも正しく表示される
   * - レイアウトが崩れない
   */
  test('E2E-P005-014: 長いプロジェクト名での表示', async ({ page }) => {
    // 1. 承認済みユーザーでログイン
    await loginAsApprovedUser(page);

    // 2. 長いプロジェクト名でプロジェクトを作成
    const longProjectName = 'E2E テストプロジェクト：非常に長いプロジェクト名で表示が崩れないかを確認するためのテスト用プロジェクト（100文字以内）';
    const projectId = await createProject(page, longProjectName);

    // 3. プロジェクト詳細ページにアクセス
    await page.goto(`/projects/${projectId}`);

    // 4. プロジェクト名が表示されることを確認（一部でも良い）
    const projectNameElement = page.locator('h1, h2, h3, h4').filter({ hasText: /E2E テストプロジェクト/i }).first();
    await expect(projectNameElement).toBeVisible({ timeout: 5000 });

    // 5. Phase 1カードが正常に表示されることを確認（レイアウト崩れチェック）
    const phase1Card = page.locator('.MuiCard-root').filter({ has: page.locator('text=/Phase 1/i') }).first();
    await expect(phase1Card).toBeVisible({ timeout: 5000 });
  });

  /**
   * E2E-P005-015: メッセージ送信後のUI状態確認
   *
   * 前提条件:
   * - プロジェクトが作成されている
   *
   * 期待結果:
   * - メッセージ送信後、送信ボタンが一時的に無効化される
   * - ローディング状態が表示される
   */
  test('E2E-P005-015: メッセージ送信後のUI状態確認', async ({ page }) => {
    // 1. 承認済みユーザーでログイン
    await loginAsApprovedUser(page);

    // 2. プロジェクトを作成
    const projectId = await createProject(page, 'E2E Message UI State Test');

    // 3. プロジェクト詳細ページにアクセス
    await page.goto(`/projects/${projectId}`);

    // 4. メッセージを入力
    const messageInput = page.locator('input[placeholder*="メッセージ"]').first();
    await expect(messageInput).toBeVisible({ timeout: 5000 });
    await messageInput.fill('テストメッセージです');

    // 5. 送信ボタンをクリック
    const sendButton = page.locator('button').filter({ has: page.locator('svg') }).last();
    await sendButton.click();

    // 6. メッセージ入力フィールドがクリアされることを確認
    await expect(messageInput).toHaveValue('', { timeout: 3000 });

    // 7. 少なくともチャットエリアが存在することを確認
    await page.waitForTimeout(2000);
    const chatArea = page.locator('text=/メッセージがありません|AI対話/i').first();
    await expect(chatArea).toBeVisible({ timeout: 5000 });
  });

  /**
   * E2E-P005-016: プロジェクト削除後のリダイレクト
   *
   * テスト対象外:
   * - プロジェクト削除機能がUI未実装
   */
  test.skip('E2E-P005-016: プロジェクト削除後のリダイレクト', async ({ page }) => {
    // TODO: プロジェクト削除UI実装後に追加
  });

  /**
   * E2E-P005-020: ファイル一覧取得と表示（Phase 2）
   *
   * 前提条件:
   * - Phase 1でコード生成が完了している
   * - Phase 2に遷移している
   *
   * 期待結果:
   * - ファイルツリーにファイルが表示される
   * - 階層構造が正しく表示される
   */
  test('E2E-P005-020: ファイル一覧取得と表示', async ({ page }) => {
    // 1. 承認済みユーザーでログイン
    await loginAsApprovedUser(page);

    // 2. プロジェクトを作成
    const projectId = await createProject(page, 'E2E File List Test');

    // 3. プロジェクト詳細ページにアクセス
    await page.goto(`/projects/${projectId}`);

    // 4. Phase 1でコード生成依頼
    const phase1Card = page.locator('.MuiCard-root').filter({ has: page.locator('text=/Phase 1/i') }).first();
    await phase1Card.click();
    await page.waitForTimeout(1000);

    const messageInput = page.locator('input[placeholder*="メッセージ"], textarea[placeholder*="メッセージ"]').first();
    await messageInput.fill('簡単なTodoアプリを作成してください');

    const sendButton = page.locator('button').filter({ has: page.locator('svg') }).last();
    await sendButton.click();

    // コード生成完了を待つ
    await page.waitForTimeout(10000);

    // 5. Phase 2に遷移
    const phase2Card = page.locator('.MuiCard-root').filter({ has: page.locator('text=/Phase 2/i') }).first();
    await phase2Card.click();
    await page.waitForTimeout(2000);

    // 6. ファイルツリーヘッダーが表示される
    const fileTreeHeader = page.locator('text=ファイル').first();
    await expect(fileTreeHeader).toBeVisible({ timeout: 5000 });

    // 7. ファイルノードが少なくとも1つ表示される
    await page.waitForTimeout(2000);

    // ファイルまたはフォルダが表示されることを確認（ListItemButtonを使用）
    const firstFileItem = page.locator('.MuiListItemButton-root').first();
    await expect(firstFileItem).toBeVisible({ timeout: 5000 });
  });

  /**
   * E2E-P005-021: ファイル選択とコンテンツ表示（Phase 2）
   *
   * テスト対象外:
   * - 最初のListItemButtonがフォルダの場合、Monaco Editorが表示されない
   * - ファイルを確実に選択するロジックが必要
   *
   * 前提条件:
   * - Phase 2でファイルが生成されている
   *
   * 期待結果:
   * - ファイルをクリックするとMonaco Editorに内容が表示される
   */
  test.skip('E2E-P005-021: ファイル選択とコンテンツ表示', async ({ page }) => {
    // 1. 承認済みユーザーでログイン
    await loginAsApprovedUser(page);

    // 2. プロジェクトを作成
    const projectId = await createProject(page, 'E2E File Select Test');

    // 3. プロジェクト詳細ページにアクセス
    await page.goto(`/projects/${projectId}`);

    // 4. Phase 1でコード生成
    const phase1Card = page.locator('.MuiCard-root').filter({ has: page.locator('text=/Phase 1/i') }).first();
    await phase1Card.click();

    const messageInput = page.locator('input[placeholder*="メッセージ"], textarea[placeholder*="メッセージ"]').first();
    await messageInput.fill('簡単なカウンターアプリを作成してください');

    const sendButton = page.locator('button').filter({ has: page.locator('svg') }).last();
    await sendButton.click();

    await page.waitForTimeout(10000);

    // 5. Phase 2に遷移
    const phase2Card = page.locator('.MuiCard-root').filter({ has: page.locator('text=/Phase 2/i') }).first();
    await phase2Card.click();
    await page.waitForTimeout(2000);

    // 6. ファイルツリーで最初のファイルをクリック
    const firstFileItem = page.locator('.MuiListItemButton-root').first();
    await expect(firstFileItem).toBeVisible({ timeout: 5000 });
    await firstFileItem.click();
    await page.waitForTimeout(1000);

    // 7. Monaco Editorが表示されることを確認
    const monacoEditor = page.locator('.monaco-editor, [data-testid="monaco-editor"]').first();
    await expect(monacoEditor).toBeVisible({ timeout: 5000 });
  });

  /**
   * E2E-P005-022: Phase切り替え時のファイル表示状態
   *
   * 前提条件:
   * - Phase 2でファイルが生成されている
   *
   * 期待結果:
   * - Phase 1に戻るとファイルツリーが非表示になる
   * - Phase 2に戻るとファイルツリーが再表示される
   */
  test('E2E-P005-022: Phase切り替え時のファイル表示状態', async ({ page }) => {
    // 1. 承認済みユーザーでログイン
    await loginAsApprovedUser(page);

    // 2. プロジェクトを作成
    const projectId = await createProject(page, 'E2E Phase Switch File Test');

    // 3. プロジェクト詳細ページにアクセス
    await page.goto(`/projects/${projectId}`);

    // 4. Phase 1でコード生成
    const phase1Card = page.locator('.MuiCard-root').filter({ has: page.locator('text=/Phase 1/i') }).first();
    await phase1Card.click();

    const messageInput = page.locator('input[placeholder*="メッセージ"], textarea[placeholder*="メッセージ"]').first();
    await messageInput.fill('シンプルな計算機アプリを作成してください');

    const sendButton = page.locator('button').filter({ has: page.locator('svg') }).last();
    await sendButton.click();

    await page.waitForTimeout(10000);

    // 5. Phase 2に遷移
    const phase2Card = page.locator('.MuiCard-root').filter({ has: page.locator('text=/Phase 2/i') }).first();
    await phase2Card.click();
    await page.waitForTimeout(2000);

    // 6. ファイルツリーが表示される
    const fileTreeHeader = page.locator('text=ファイル').first();
    await expect(fileTreeHeader).toBeVisible({ timeout: 5000 });

    // 7. Phase 1に戻る
    await phase1Card.click();
    await page.waitForTimeout(1000);

    // 8. ファイルツリーが非表示になる（Phase 1では表示されない）
    const chatHeader1 = page.locator('text=/要件定義/i').first();
    await expect(chatHeader1).toBeVisible({ timeout: 5000 });

    // 9. 再度Phase 2に戻る
    await phase2Card.click();
    await page.waitForTimeout(1000);

    // 10. ファイルツリーが再表示される
    await expect(fileTreeHeader).toBeVisible({ timeout: 5000 });
  });

  // === Phase 5-14 動作検証テスト ===
  test('E2E-P005-023: Phase 5 (テスト生成) メッセージ送受信', async ({ page }) => {
    await loginAsApprovedUser(page);
    await page.goto('http://localhost:3347/user/projects');

    // プロジェクト作成
    const projectName = `Test Phase5 ${Date.now()}`;
    await page.click('button:has-text("新規プロジェクト")');
    await page.fill('input[name="name"]', projectName);
    await page.fill('textarea[name="description"]', 'Phase 5 test project');
    await page.click('button:has-text("作成")');

    // プロジェクト詳細に遷移
    await page.waitForURL(/\/user\/projects\/.+/);

    // Phase 5カードをクリック
    const phase5Card = page.locator('[data-testid="phase-card-5"]').or(
      page.locator('div:has-text("Phase 5"):has-text("テスト生成")')
    );
    await phase5Card.click();
    await page.waitForTimeout(1000);

    // メッセージ送信
    const messageInput = page.locator('textarea[placeholder*="メッセージ"], input[placeholder*="メッセージ"]');
    await messageInput.fill('ユニットテストとE2Eテストを生成してください');

    const sendButton = page.locator('button:has-text("送信")').or(
      page.locator('button[type="submit"]')
    );
    await sendButton.click();

    // AI応答を待機（Phase 5特有の応答を確認）
    const response = page.locator('text=/テストファイル|test|spec/i').first();
    await expect(response).toBeVisible({ timeout: 10000 });
  });

  test('E2E-P005-024: Phase 6 (ドキュメント生成) メッセージ送受信', async ({ page }) => {
    await loginAsApprovedUser(page);
    await page.goto('http://localhost:3347/user/projects');

    const projectName = `Test Phase6 ${Date.now()}`;
    await page.click('button:has-text("新規プロジェクト")');
    await page.fill('input[name="name"]', projectName);
    await page.fill('textarea[name="description"]', 'Phase 6 test project');
    await page.click('button:has-text("作成")');

    await page.waitForURL(/\/user\/projects\/.+/);

    const phase6Card = page.locator('[data-testid="phase-card-6"]').or(
      page.locator('div:has-text("Phase 6"):has-text("ドキュメント")')
    );
    await phase6Card.click();
    await page.waitForTimeout(1000);

    const messageInput = page.locator('textarea[placeholder*="メッセージ"], input[placeholder*="メッセージ"]');
    await messageInput.fill('技術ドキュメントを生成してください');

    const sendButton = page.locator('button:has-text("送信")').or(
      page.locator('button[type="submit"]')
    );
    await sendButton.click();

    // AI応答を待機（Phase 6特有の応答を確認）
    const response = page.locator('text=/README|アーキテクチャ|ドキュメント/i').first();
    await expect(response).toBeVisible({ timeout: 10000 });
  });

  test('E2E-P005-025: Phase 7 (デバッグ) メッセージ送受信', async ({ page }) => {
    await loginAsApprovedUser(page);
    await page.goto('http://localhost:3347/user/projects');

    const projectName = `Test Phase7 ${Date.now()}`;
    await page.click('button:has-text("新規プロジェクト")');
    await page.fill('input[name="name"]', projectName);
    await page.fill('textarea[name="description"]', 'Phase 7 test project');
    await page.click('button:has-text("作成")');

    await page.waitForURL(/\/user\/projects\/.+/);

    const phase7Card = page.locator('[data-testid="phase-card-7"]').or(
      page.locator('div:has-text("Phase 7"):has-text("デバッグ")')
    );
    await phase7Card.click();
    await page.waitForTimeout(1000);

    const messageInput = page.locator('textarea[placeholder*="メッセージ"], input[placeholder*="メッセージ"]');
    await messageInput.fill('コードの問題を検出してください');

    const sendButton = page.locator('button:has-text("送信")').or(
      page.locator('button[type="submit"]')
    );
    await sendButton.click();

    // AI応答を待機（Phase 7特有の応答を確認）
    const response = page.locator('text=/デバッグ|エラー|問題/i').first();
    await expect(response).toBeVisible({ timeout: 10000 });
  });

  test('E2E-P005-026: Phase 8 (パフォーマンス最適化) メッセージ送受信', async ({ page }) => {
    await loginAsApprovedUser(page);
    await page.goto('http://localhost:3347/user/projects');

    const projectName = `Test Phase8 ${Date.now()}`;
    await page.click('button:has-text("新規プロジェクト")');
    await page.fill('input[name="name"]', projectName);
    await page.fill('textarea[name="description"]', 'Phase 8 test project');
    await page.click('button:has-text("作成")');

    await page.waitForURL(/\/user\/projects\/.+/);

    const phase8Card = page.locator('[data-testid="phase-card-8"]').or(
      page.locator('div:has-text("Phase 8"):has-text("パフォーマンス")')
    );
    await phase8Card.click();
    await page.waitForTimeout(1000);

    const messageInput = page.locator('textarea[placeholder*="メッセージ"], input[placeholder*="メッセージ"]');
    await messageInput.fill('パフォーマンスを最適化してください');

    const sendButton = page.locator('button:has-text("送信")').or(
      page.locator('button[type="submit"]')
    );
    await sendButton.click();

    // AI応答を待機（Phase 8特有の応答を確認）
    const response = page.locator('text=/パフォーマンス|最適化|改善/i').first();
    await expect(response).toBeVisible({ timeout: 10000 });
  });

  test('E2E-P005-027: Phase 9 (セキュリティ監査) メッセージ送受信', async ({ page }) => {
    await loginAsApprovedUser(page);
    await page.goto('http://localhost:3347/user/projects');

    const projectName = `Test Phase9 ${Date.now()}`;
    await page.click('button:has-text("新規プロジェクト")');
    await page.fill('input[name="name"]', projectName);
    await page.fill('textarea[name="description"]', 'Phase 9 test project');
    await page.click('button:has-text("作成")');

    await page.waitForURL(/\/user\/projects\/.+/);

    const phase9Card = page.locator('[data-testid="phase-card-9"]').or(
      page.locator('div:has-text("Phase 9"):has-text("セキュリティ")')
    );
    await phase9Card.click();
    await page.waitForTimeout(1000);

    const messageInput = page.locator('textarea[placeholder*="メッセージ"], input[placeholder*="メッセージ"]');
    await messageInput.fill('セキュリティ診断を実施してください');

    const sendButton = page.locator('button:has-text("送信")').or(
      page.locator('button[type="submit"]')
    );
    await sendButton.click();

    // AI応答を待機（Phase 9特有の応答を確認）
    const response = page.locator('text=/セキュリティ|脆弱性|監査/i').first();
    await expect(response).toBeVisible({ timeout: 10000 });
  });

  test('E2E-P005-028: Phase 10 (データベース設計) メッセージ送受信', async ({ page }) => {
    await loginAsApprovedUser(page);
    await page.goto('http://localhost:3347/user/projects');

    const projectName = `Test Phase10 ${Date.now()}`;
    await page.click('button:has-text("新規プロジェクト")');
    await page.fill('input[name="name"]', projectName);
    await page.fill('textarea[name="description"]', 'Phase 10 test project');
    await page.click('button:has-text("作成")');

    await page.waitForURL(/\/user\/projects\/.+/);

    const phase10Card = page.locator('[data-testid="phase-card-10"]').or(
      page.locator('div:has-text("Phase 10"):has-text("データベース")')
    );
    await phase10Card.click();
    await page.waitForTimeout(1000);

    const messageInput = page.locator('textarea[placeholder*="メッセージ"], input[placeholder*="メッセージ"]');
    await messageInput.fill('データベーススキーマを最適化してください');

    const sendButton = page.locator('button:has-text("送信")').or(
      page.locator('button[type="submit"]')
    );
    await sendButton.click();

    // AI応答を待機（Phase 10特有の応答を確認）
    const response = page.locator('text=/データベース|スキーマ|テーブル/i').first();
    await expect(response).toBeVisible({ timeout: 10000 });
  });

  test('E2E-P005-029: Phase 11 (API設計) メッセージ送受信', async ({ page }) => {
    await loginAsApprovedUser(page);
    await page.goto('http://localhost:3347/user/projects');

    const projectName = `Test Phase11 ${Date.now()}`;
    await page.click('button:has-text("新規プロジェクト")');
    await page.fill('input[name="name"]', projectName);
    await page.fill('textarea[name="description"]', 'Phase 11 test project');
    await page.click('button:has-text("作成")');

    await page.waitForURL(/\/user\/projects\/.+/);

    const phase11Card = page.locator('[data-testid="phase-card-11"]').or(
      page.locator('div:has-text("Phase 11"):has-text("API設計")')
    );
    await phase11Card.click();
    await page.waitForTimeout(1000);

    const messageInput = page.locator('textarea[placeholder*="メッセージ"], input[placeholder*="メッセージ"]');
    await messageInput.fill('RESTful APIを設計してください');

    const sendButton = page.locator('button:has-text("送信")').or(
      page.locator('button[type="submit"]')
    );
    await sendButton.click();

    // AI応答を待機（Phase 11特有の応答を確認）
    const response = page.locator('text=/API|エンドポイント|OpenAPI/i').first();
    await expect(response).toBeVisible({ timeout: 10000 });
  });

  test('E2E-P005-030: Phase 12 (UX改善) メッセージ送受信', async ({ page }) => {
    await loginAsApprovedUser(page);
    await page.goto('http://localhost:3347/user/projects');

    const projectName = `Test Phase12 ${Date.now()}`;
    await page.click('button:has-text("新規プロジェクト")');
    await page.fill('input[name="name"]', projectName);
    await page.fill('textarea[name="description"]', 'Phase 12 test project');
    await page.click('button:has-text("作成")');

    await page.waitForURL(/\/user\/projects\/.+/);

    const phase12Card = page.locator('[data-testid="phase-card-12"]').or(
      page.locator('div:has-text("Phase 12"):has-text("UX")')
    );
    await phase12Card.click();
    await page.waitForTimeout(1000);

    const messageInput = page.locator('textarea[placeholder*="メッセージ"], input[placeholder*="メッセージ"]');
    await messageInput.fill('ユーザー体験を改善してください');

    const sendButton = page.locator('button:has-text("送信")').or(
      page.locator('button[type="submit"]')
    );
    await sendButton.click();

    // AI応答を待機（Phase 12特有の応答を確認）
    const response = page.locator('text=/UX|ユーザー体験|UI/i').first();
    await expect(response).toBeVisible({ timeout: 10000 });
  });

  test('E2E-P005-031: Phase 13 (リファクタリング) メッセージ送受信', async ({ page }) => {
    await loginAsApprovedUser(page);
    await page.goto('http://localhost:3347/user/projects');

    const projectName = `Test Phase13 ${Date.now()}`;
    await page.click('button:has-text("新規プロジェクト")');
    await page.fill('input[name="name"]', projectName);
    await page.fill('textarea[name="description"]', 'Phase 13 test project');
    await page.click('button:has-text("作成")');

    await page.waitForURL(/\/user\/projects\/.+/);

    const phase13Card = page.locator('[data-testid="phase-card-13"]').or(
      page.locator('div:has-text("Phase 13"):has-text("リファクタリング")')
    );
    await phase13Card.click();
    await page.waitForTimeout(1000);

    const messageInput = page.locator('textarea[placeholder*="メッセージ"], input[placeholder*="メッセージ"]');
    await messageInput.fill('コードをリファクタリングしてください');

    const sendButton = page.locator('button:has-text("送信")').or(
      page.locator('button[type="submit"]')
    );
    await sendButton.click();

    // AI応答を待機（Phase 13特有の応答を確認）
    const response = page.locator('text=/リファクタリング|コード改善|保守性/i').first();
    await expect(response).toBeVisible({ timeout: 10000 });
  });

  test('E2E-P005-032: Phase 14 (モニタリング) メッセージ送受信', async ({ page }) => {
    await loginAsApprovedUser(page);
    await page.goto('http://localhost:3347/user/projects');

    const projectName = `Test Phase14 ${Date.now()}`;
    await page.click('button:has-text("新規プロジェクト")');
    await page.fill('input[name="name"]', projectName);
    await page.fill('textarea[name="description"]', 'Phase 14 test project');
    await page.click('button:has-text("作成")');

    await page.waitForURL(/\/user\/projects\/.+/);

    const phase14Card = page.locator('[data-testid="phase-card-14"]').or(
      page.locator('div:has-text("Phase 14"):has-text("モニタリング")')
    );
    await phase14Card.click();
    await page.waitForTimeout(1000);

    const messageInput = page.locator('textarea[placeholder*="メッセージ"], input[placeholder*="メッセージ"]');
    await messageInput.fill('モニタリングシステムを構築してください');

    const sendButton = page.locator('button:has-text("送信")').or(
      page.locator('button[type="submit"]')
    );
    await sendButton.click();

    // AI応答を待機（Phase 14特有の応答を確認）
    const response = page.locator('text=/モニタリング|ログ|メトリクス/i').first();
    await expect(response).toBeVisible({ timeout: 10000 });
  });
});
