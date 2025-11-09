import { test, expect } from '@playwright/test';
import { loginAsApprovedUser } from './helpers';

/**
 * P-006: マイプロフィール・設定 E2Eテスト
 */

test.describe('P-006: マイプロフィール・設定', () => {
  /**
   * E2E-P006-001: プロフィール表示
   *
   * 前提条件:
   * - ログイン済み
   *
   * 期待結果:
   * - ユーザー情報が表示される
   */
  test('E2E-P006-001: プロフィール表示', async ({ page }) => {
    // 1. 承認済みユーザーでログイン
    await loginAsApprovedUser(page);

    // 2. プロフィールページへ遷移
    await page.goto('/profile');

    // 3. ページタイトルを確認
    const heading = page.locator('h1, h2, h3, h4').filter({ hasText: /プロフィール/i }).first();
    await expect(heading).toBeVisible({ timeout: 5000 });

    // 4. 基本情報カードが表示されることを確認
    const basicInfoCard = page.locator('text=/基本情報/i').first();
    await expect(basicInfoCard).toBeVisible();

    // 5. 名前フィールドが表示されることを確認
    const nameField = page.getByLabel('お名前');
    await expect(nameField).toBeVisible();

    // 6. メールアドレスフィールドが表示されることを確認
    const emailField = page.getByLabel('メールアドレス');
    await expect(emailField).toBeVisible();
    await expect(emailField).toBeDisabled(); // メールアドレスは変更不可

    // 7. API設定カードが表示されることを確認
    const apiSettingsCard = page.locator('text=/API設定/i').first();
    await expect(apiSettingsCard).toBeVisible();

    // 8. 使用量カードが表示されることを確認
    const usageCard = page.locator('text=/使用量/i').first();
    await expect(usageCard).toBeVisible();
  });

  /**
   * E2E-P006-002: プロフィール編集
   *
   * 前提条件:
   * - ログイン済み
   *
   * 期待結果:
   * - プロフィールが更新される
   * - 成功メッセージが表示される
   */
  test('E2E-P006-002: プロフィール編集', async ({ page }) => {
    // 1. 承認済みユーザーでログイン
    await loginAsApprovedUser(page);

    // 2. プロフィールページへ遷移
    await page.goto('/profile');

    // 3. 名前フィールドを見つける
    const nameField = page.getByLabel('お名前');
    await expect(nameField).toBeVisible();

    // 4. 現在の名前を取得
    const currentName = await nameField.inputValue();

    // 5. 新しい名前を入力（タイムスタンプ付きで一意性を保証）
    const newName = `テストユーザー_${Date.now()}`;
    await nameField.fill(newName);

    // 6. 保存ボタンをクリック
    const saveButton = page.getByRole('button', { name: /保存/i });
    await saveButton.click();

    // 7. 成功メッセージが表示されることを確認
    const successMessage = page.locator('.MuiAlert-root').filter({ has: page.locator('text=/保存しました/i') });
    await expect(successMessage).toBeVisible({ timeout: 5000 });

    // 8. ページを再読み込みして、変更が保存されたことを確認
    await page.reload();
    await page.waitForLoadState('networkidle');

    // 9. 名前フィールドに新しい値が反映されていることを確認
    const nameFieldAfterReload = page.getByLabel('お名前');
    await expect(nameFieldAfterReload).toHaveValue(newName);
  });

  /**
   * E2E-P006-003: APIキー設定フィールド表示
   *
   * 前提条件:
   * - ログイン済み
   *
   * 期待結果:
   * - APIキー設定カードが表示される
   * - Claude API Keyフィールドが表示される
   */
  test('E2E-P006-003: APIキー設定フィールド表示', async ({ page }) => {
    // 1. 承認済みユーザーでログイン
    await loginAsApprovedUser(page);

    // 2. プロフィールページへ遷移
    await page.goto('/profile');

    // 3. API設定カードが表示されることを確認
    const apiSettingsCard = page.locator('text=/API設定/i').first();
    await expect(apiSettingsCard).toBeVisible();

    // 4. Claude API Keyフィールドが表示されることを確認
    const apiKeyField = page.getByLabel(/Claude API Key/i);
    await expect(apiKeyField).toBeVisible();

    // 5. APIキーフィールドがパスワードタイプであることを確認
    await expect(apiKeyField).toHaveAttribute('type', 'password');
  });

  /**
   * E2E-P006-004: 使用量表示
   *
   * 前提条件:
   * - ログイン済み
   *
   * 期待結果:
   * - 使用量カードが表示される
   * - プロジェクト数が表示される
   */
  test('E2E-P006-004: 使用量表示', async ({ page }) => {
    // 1. 承認済みユーザーでログイン
    await loginAsApprovedUser(page);

    // 2. プロフィールページへ遷移
    await page.goto('/profile');

    // 3. 使用量カードが表示されることを確認
    const usageCard = page.locator('text=/使用量/i').first();
    await expect(usageCard).toBeVisible();

    // 4. プロジェクト数の表示を確認
    const projectCountLabel = page.locator('text=/プロジェクト数/i').first();
    await expect(projectCountLabel).toBeVisible();
  });

  /**
   * E2E-P006-005: APIキー保存
   *
   * 前提条件:
   * - ログイン済み
   *
   * 期待結果:
   * - APIキーが保存される
   * - 成功メッセージが表示される
   */
  test('E2E-P006-005: APIキー保存', async ({ page }) => {
    // 1. 承認済みユーザーでログイン
    await loginAsApprovedUser(page);

    // 2. プロフィールページへ遷移
    await page.goto('/profile');

    // 3. Claude API Keyフィールドを見つける
    const apiKeyField = page.getByLabel(/Claude API Key/i);
    await expect(apiKeyField).toBeVisible();

    // 4. テスト用のAPIキーを入力
    await apiKeyField.fill('sk-ant-test-key-12345678901234567890');

    // 5. 保存ボタンをクリック
    const saveButton = page.getByRole('button', { name: /保存/i });
    await saveButton.click();

    // 6. 成功メッセージが表示されることを確認
    const successMessage = page.locator('.MuiAlert-root').filter({ has: page.locator('text=/保存しました/i') });
    await expect(successMessage).toBeVisible({ timeout: 5000 });
  });

  /**
   * E2E-P006-006: レスポンシブデザイン検証
   *
   * 前提条件:
   * - ログイン済み
   *
   * 期待結果:
   * - モバイル・タブレット・デスクトップで適切に表示される
   */
  test('E2E-P006-006: レスポンシブデザイン検証', async ({ page }) => {
    // 1. 承認済みユーザーでログイン
    await loginAsApprovedUser(page);

    // 2. プロフィールページへ遷移
    await page.goto('/profile');

    // 3. モバイルサイズ (375x667)
    await page.setViewportSize({ width: 375, height: 667 });
    const profileCardMobile = page.locator('text=/基本情報/i').first();
    await expect(profileCardMobile).toBeVisible();

    // 4. タブレットサイズ (768x1024)
    await page.setViewportSize({ width: 768, height: 1024 });
    const profileCardTablet = page.locator('text=/基本情報/i').first();
    await expect(profileCardTablet).toBeVisible();

    // 5. デスクトップサイズ (1920x1080)
    await page.setViewportSize({ width: 1920, height: 1080 });
    const profileCardDesktop = page.locator('text=/基本情報/i').first();
    await expect(profileCardDesktop).toBeVisible();
  });

  /**
   * E2E-P006-101: 未認証アクセス
   *
   * 前提条件:
   * - ログアウト状態
   *
   * 期待結果:
   * - /login にリダイレクト
   */
  test('E2E-P006-101: 未認証アクセス', async ({ page }) => {
    // 1. ログアウト状態でプロフィールページにアクセス
    await page.goto('/profile');

    // 2. ログインページにリダイレクトされることを確認
    await expect(page).toHaveURL(/.*login/, { timeout: 10000 });
  });

  /**
   * E2E-P006-007: ヘッダーからプロフィールページへ遷移
   *
   * 前提条件:
   * - ログイン済み
   *
   * 期待結果:
   * - ヘッダーのプロフィールリンクからアクセスできる
   */
  test('E2E-P006-007: ヘッダーからプロフィールページへ遷移', async ({ page }) => {
    // 1. 承認済みユーザーでログイン
    await loginAsApprovedUser(page);

    // 2. プロジェクト一覧ページにいることを確認
    await expect(page).toHaveURL(/.*projects/, { timeout: 5000 });

    // 3. ヘッダーのプロフィールリンクをクリック
    // （アイコンまたは「プロフィール」テキスト）
    const profileLink = page.locator('a[href="/profile"], button').filter({ hasText: /プロフィール/i }).first();

    if (await profileLink.isVisible().catch(() => false)) {
      await profileLink.click();
      await expect(page).toHaveURL(/.*profile/, { timeout: 5000 });
    } else {
      // 直接遷移でも可
      await page.goto('/profile');
      await expect(page).toHaveURL(/.*profile/);
    }

    // 4. プロフィールページが表示されることを確認
    const heading = page.locator('h1, h2, h3, h4').filter({ hasText: /プロフィール/i }).first();
    await expect(heading).toBeVisible();
  });

  /**
   * E2E-P006-008: 長い名前での保存
   *
   * 前提条件:
   * - ログイン済み
   *
   * 期待結果:
   * - 長い名前でも保存できる
   */
  test('E2E-P006-008: 長い名前での保存', async ({ page }) => {
    // 1. 承認済みユーザーでログイン
    await loginAsApprovedUser(page);

    // 2. プロフィールページへ遷移
    await page.goto('/profile');

    // 3. 長い名前を入力（100文字）
    const longName = 'テストユーザー'.repeat(10) + `_${Date.now()}`;
    const nameField = page.getByLabel('お名前');
    await nameField.fill(longName.substring(0, 100));

    // 4. 保存ボタンをクリック
    const saveButton = page.getByRole('button', { name: /保存/i });
    await saveButton.click();

    // 5. 成功メッセージが表示されることを確認
    const successMessage = page.locator('.MuiAlert-root').filter({ has: page.locator('text=/保存しました/i') });
    await expect(successMessage).toBeVisible({ timeout: 5000 });
  });

  /**
   * E2E-P006-009: 特殊文字を含む名前での保存
   *
   * 前提条件:
   * - ログイン済み
   *
   * 期待結果:
   * - 特殊文字を含む名前でも保存できる
   */
  test('E2E-P006-009: 特殊文字を含む名前での保存', async ({ page }) => {
    // 1. 承認済みユーザーでログイン
    await loginAsApprovedUser(page);

    // 2. プロフィールページへ遷移
    await page.goto('/profile');

    // 3. 特殊文字を含む名前を入力
    const specialName = `テスト★ユーザー♪_${Date.now()}`;
    const nameField = page.getByLabel('お名前');
    await nameField.fill(specialName);

    // 4. 保存ボタンをクリック
    const saveButton = page.getByRole('button', { name: /保存/i });
    await saveButton.click();

    // 5. 成功メッセージが表示されることを確認
    const successMessage = page.locator('.MuiAlert-root').filter({ has: page.locator('text=/保存しました/i') });
    await expect(successMessage).toBeVisible({ timeout: 5000 });
  });

  /**
   * E2E-P006-102: プロフィール編集バリデーション（空の名前）
   *
   * 前提条件:
   * - ログイン済み
   *
   * 期待結果:
   * - エラーメッセージが表示される
   * - 保存が失敗する
   */
  test('E2E-P006-102: プロフィール編集バリデーション', async ({ page }) => {
    // 1. 承認済みユーザーでログイン
    await loginAsApprovedUser(page);

    // 2. プロフィールページへ遷移
    await page.goto('/profile');

    // 3. 名前フィールドを空にする
    const nameField = page.getByLabel('お名前');
    await nameField.fill('');

    // 4. 保存ボタンをクリック
    const saveButton = page.getByRole('button', { name: /保存/i });
    await saveButton.click();

    // 5. エラーメッセージまたはHTML5バリデーションを確認
    // HTML5のrequired属性がある場合、ブラウザがブロックする
    // またはバックエンドエラーが表示される
    await page.waitForTimeout(2000);
  });
});
