import { test, expect } from '@playwright/test';

/**
 * P-002: 利用申請フォーム E2Eテスト
 */

test.describe('P-002: 利用申請フォーム', () => {
  /**
   * E2E-P002-001: 申請フォーム表示
   *
   * 前提条件:
   * - なし（ゲストアクセス可能）
   *
   * 期待結果:
   * - 申請フォームが表示される
   * - 必要なフィールドが全て表示される
   */
  test('E2E-P002-001: 申請フォーム表示', async ({ page }) => {
    // 1. /apply にアクセス
    await page.goto('/apply');

    // 2. ページタイトルを確認
    const heading = page.getByRole('heading', { name: /利用申請/i });
    await expect(heading).toBeVisible({ timeout: 5000 });

    // 3. 各フィールドが表示されることを確認
    const nameField = page.getByLabel('お名前');
    await expect(nameField).toBeVisible();

    const emailField = page.getByLabel('メールアドレス');
    await expect(emailField).toBeVisible();

    // パスワードフィールドを確認（type="password"で識別）
    const passwordFields = page.locator('input[type="password"]');
    await expect(passwordFields.first()).toBeVisible();
    await expect(passwordFields.nth(1)).toBeVisible();

    const purposeField = page.getByLabel('利用目的');
    await expect(purposeField).toBeVisible();

    // 4. 申請ボタンが表示されることを確認
    const submitButton = page.getByRole('button', { name: /申請/i });
    await expect(submitButton).toBeVisible();

    // 5. ログインリンクが表示されることを確認
    const loginLink = page.locator('text=/すでにアカウントをお持ちですか/i');
    await expect(loginLink).toBeVisible();
  });

  /**
   * E2E-P002-002: 申請成功
   *
   * 前提条件:
   * - なし
   *
   * 期待結果:
   * - 申請が成功する
   * - 成功メッセージが表示される
   */
  test('E2E-P002-002: 申請成功', async ({ page }) => {
    // 1. /apply にアクセス
    await page.goto('/apply');

    // 2. フォームに入力（ユニークなメールアドレスを生成）
    const timestamp = Date.now();
    const testEmail = `test-apply-${timestamp}@example.com`;

    await page.getByLabel('お名前').fill('E2Eテストユーザー');
    await page.getByLabel('メールアドレス').fill(testEmail);

    // パスワードフィールド（1つ目）
    const passwordFields = page.locator('input[type="password"]');
    await passwordFields.first().fill('TestPassword123!');
    await passwordFields.nth(1).fill('TestPassword123!');
    await page.getByLabel('利用目的').fill('E2Eテストのための申請です。このアカウントは自動テストで作成されました。');

    // 3. 申請ボタンをクリック
    const submitButton = page.getByRole('button', { name: /申請/i });
    await submitButton.click();

    // 4. 成功メッセージが表示されることを確認（MUI Alertコンポーネント内）
    const successAlert = page.locator('.MuiAlert-root').filter({ hasText: /申請を受け付けました/i });
    await expect(successAlert).toBeVisible({ timeout: 15000 });

    // 5. 審査完了のメッセージが表示されることを確認
    const reviewMessage = page.locator('text=/審査が完了次第/i').first();
    await expect(reviewMessage).toBeVisible();
  });

  /**
   * E2E-P002-003: パスワード不一致エラー
   *
   * 前提条件:
   * - なし
   *
   * 期待結果:
   * - エラーメッセージが表示される
   */
  test('E2E-P002-003: パスワード不一致エラー', async ({ page }) => {
    // 1. /apply にアクセス
    await page.goto('/apply');

    // 2. パスワードを不一致で入力
    await page.getByLabel('お名前').fill('テストユーザー');
    await page.getByLabel('メールアドレス').fill('test@example.com');

    const passwordFields = page.locator('input[type="password"]');
    await passwordFields.first().fill('Password123!');
    await passwordFields.nth(1).fill('DifferentPassword123!');
    await page.getByLabel('利用目的').fill('テスト用の申請です。最低20文字以上入力します。');

    // 3. 申請ボタンをクリック
    const submitButton = page.getByRole('button', { name: /申請/i });
    await submitButton.click();

    // 4. エラーメッセージが表示されることを確認
    const errorAlert = page.locator('.MuiAlert-root').first();
    await expect(errorAlert).toBeVisible({ timeout: 5000 });
    await expect(errorAlert).toContainText(/パスワードが一致しません/i);
  });

  /**
   * E2E-P002-004: 利用目的が20文字未満エラー
   *
   * 前提条件:
   * - なし
   *
   * 期待結果:
   * - エラーメッセージが表示される
   */
  test('E2E-P002-004: 利用目的が20文字未満エラー', async ({ page }) => {
    // 1. /apply にアクセス
    await page.goto('/apply');

    // 2. 利用目的を20文字未満で入力
    await page.getByLabel('お名前').fill('テストユーザー');
    await page.getByLabel('メールアドレス').fill('test@example.com');

    const passwordFields = page.locator('input[type="password"]');
    await passwordFields.first().fill('Password123!');
    await passwordFields.nth(1).fill('Password123!');
    await page.getByLabel('利用目的').fill('短すぎる目的');

    // 3. 申請ボタンをクリック
    const submitButton = page.getByRole('button', { name: /申請/i });
    await submitButton.click();

    // 4. エラーメッセージが表示されることを確認
    const errorAlert = page.locator('.MuiAlert-root').first();
    await expect(errorAlert).toBeVisible({ timeout: 5000 });
    await expect(errorAlert).toContainText(/20文字以上/i);
  });

  /**
   * E2E-P002-005: すでに登録済みのメールアドレスエラー
   *
   * 前提条件:
   * - e2etest@example.com が既に登録されている
   *
   * 期待結果:
   * - エラーメッセージが表示される
   */
  test('E2E-P002-005: すでに登録済みのメールアドレスエラー', async ({ page }) => {
    // 1. /apply にアクセス
    await page.goto('/apply');

    // 2. 既存のメールアドレスで申請
    await page.getByLabel('お名前').fill('テストユーザー');
    await page.getByLabel('メールアドレス').fill('e2etest@example.com');

    const passwordFields = page.locator('input[type="password"]');
    await passwordFields.first().fill('NewPassword123!');
    await passwordFields.nth(1).fill('NewPassword123!');
    await page.getByLabel('利用目的').fill('既存メールアドレスでのテスト申請です。20文字以上入力しています。');

    // 3. 申請ボタンをクリック
    const submitButton = page.getByRole('button', { name: /申請/i });
    await submitButton.click();

    // 4. エラーメッセージが表示されることを確認
    const errorAlert = page.locator('.MuiAlert-root').first();
    await expect(errorAlert).toBeVisible({ timeout: 10000 });

    // バックエンドからのエラーメッセージを確認
    const errorText = await errorAlert.textContent();
    expect(errorText).toContain('このメールアドレスは既に登録されています');
  });

  /**
   * E2E-P002-006: OAuth連携
   *
   * テスト対象外:
   * - OAuth認証フローは外部サービスに依存
   */
  test.skip('E2E-P002-006: Google OAuth連携', async ({ page }) => {
    // TODO: OAuthモックまたは統合テスト環境が必要
  });

  /**
   * E2E-P002-007: GitHub OAuth連携
   *
   * テスト対象外:
   * - OAuth認証フローは外部サービスに依存
   */
  test.skip('E2E-P002-007: GitHub OAuth連携', async ({ page }) => {
    // TODO: OAuthモックまたは統合テスト環境が必要
  });

  /**
   * E2E-P002-008: ログインページへの遷移
   *
   * 前提条件:
   * - なし
   *
   * 期待結果:
   * - ログインリンクをクリックすると /login に遷移
   */
  test('E2E-P002-008: ログインページへの遷移', async ({ page }) => {
    // 1. /apply にアクセス
    await page.goto('/apply');

    // 2. ログインリンクをクリック
    const loginLink = page.locator('text=/ログイン/i').last();
    await loginLink.click();

    // 3. /login に遷移することを確認
    await expect(page).toHaveURL(/.*login/, { timeout: 5000 });

    // 4. ログインフォームが表示されることを確認
    const emailInput = page.locator('input[type="email"]').first();
    await expect(emailInput).toBeVisible();
  });

  /**
   * E2E-P002-101: バリデーション表示
   *
   * テスト対象外:
   * - HTML5のrequired属性によりブラウザレベルでブロックされる
   *
   * 前提条件:
   * - なし
   *
   * 期待結果:
   * - 空のフォーム送信時にエラーメッセージが表示される
   */
  test.skip('E2E-P002-101: バリデーション表示', async ({ page }) => {
    // TODO: HTML5バリデーションをバイパスしてテストする必要がある
  });

  /**
   * E2E-P002-201: レスポンシブデザイン検証
   *
   * 前提条件:
   * - なし
   *
   * 期待結果:
   * - モバイル・タブレット・デスクトップで適切に表示される
   */
  test('E2E-P002-201: レスポンシブデザイン検証', async ({ page }) => {
    // 1. /apply にアクセス
    await page.goto('/apply');

    // 2. モバイルサイズ (375x667)
    await page.setViewportSize({ width: 375, height: 667 });
    const applyCardMobile = page.locator('.MuiCard-root').first();
    await expect(applyCardMobile).toBeVisible();

    // 3. タブレットサイズ (768x1024)
    await page.setViewportSize({ width: 768, height: 1024 });
    const applyCardTablet = page.locator('.MuiCard-root').first();
    await expect(applyCardTablet).toBeVisible();

    // 4. デスクトップサイズ (1920x1080)
    await page.setViewportSize({ width: 1920, height: 1080 });
    const applyCardDesktop = page.locator('.MuiCard-root').first();
    await expect(applyCardDesktop).toBeVisible();

    // 5. フォームが正常に動作することを確認
    const nameField = page.getByLabel('お名前');
    await expect(nameField).toBeVisible();
  });
});
