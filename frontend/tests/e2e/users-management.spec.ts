import { test, expect } from '@playwright/test';
import { loginAsApprovedUser, loginAsAdmin } from './helpers';

/**
 * A-002: ユーザー・プロジェクト管理 E2Eテスト
 */

test.describe('A-002: ユーザー・プロジェクト管理', () => {
  /**
   * E2E-A002-001: 全ユーザー一覧表示
   *
   * 前提条件:
   * - 管理者アカウントでログイン
   *
   * 期待結果:
   * - ユーザー一覧ページが表示される
   * - ページタイトルが表示される
   * - テーブルヘッダーまたは空状態メッセージが表示される
   */
  test('E2E-A002-001: 全ユーザー一覧表示', async ({ page }) => {
    // 1. 管理者でログイン
    await loginAsAdmin(page);

    // 2. ユーザー管理ページにアクセス
    await page.goto('/admin/users');

    // 3. ページタイトルを確認
    const heading = page.locator('h1, h2, h3, h4').filter({ hasText: /ユーザー|管理/i }).first();
    await expect(heading).toBeVisible({ timeout: 5000 });

    // 4. テーブルヘッダーまたは空状態メッセージを確認
    const tableHeader = page.locator('text=/氏名|メール|ステータス|権限/i').first();
    const emptyMessage = page.locator('text=/ユーザーが見つかりません/i').first();

    const hasTable = await tableHeader.isVisible().catch(() => false);
    const hasEmptyMessage = await emptyMessage.isVisible().catch(() => false);

    expect(hasTable || hasEmptyMessage).toBeTruthy();
  });

  /**
   * E2E-A002-101: 非管理者のアクセス
   *
   * 前提条件:
   * - 一般ユーザーでログイン
   *
   * 期待結果:
   * - アクセス拒否（リダイレクトまたはエラーメッセージ）
   */
  test('E2E-A002-101: 非管理者のアクセス', async ({ page }) => {
    // 1. 一般ユーザーでログイン
    await loginAsApprovedUser(page);

    // 2. ユーザー管理ページにアクセスを試みる
    await page.goto('/admin/users');

    // 3. アクセス拒否を確認
    await page.waitForTimeout(3000);

    const currentUrl = page.url();
    const errorMessage = page.locator('text=/アクセス権限がありません|管理者権限が必要です|403/i').first();
    const hasError = await errorMessage.isVisible().catch(() => false);
    const notOnAdminPage = !currentUrl.includes('/admin/users');

    expect(notOnAdminPage || hasError).toBeTruthy();
  });
});
