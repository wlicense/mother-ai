import { test, expect } from '@playwright/test';
import { loginAsApprovedUser, loginAsAdmin } from './helpers';

/**
 * A-003: API監視ダッシュボード E2Eテスト
 */

test.describe('A-003: API監視ダッシュボード', () => {
  /**
   * E2E-A003-001: リアルタイム監視表示
   *
   * 前提条件:
   * - 管理者アカウントでログイン
   *
   * 期待結果:
   * - API監視ページが表示される
   * - ページタイトルが表示される
   */
  test('E2E-A003-001: リアルタイム監視表示', async ({ page }) => {
    // 1. 管理者でログイン
    await loginAsAdmin(page);

    // 2. API監視ページにアクセス
    await page.goto('/admin/api-monitor');

    // 3. ページタイトルを確認
    const heading = page.locator('h1, h2, h3, h4').filter({ hasText: /API監視|API|監視/i }).first();
    await expect(heading).toBeVisible({ timeout: 5000 });
  });

  /**
   * E2E-A003-101: 非管理者のアクセス
   *
   * 前提条件:
   * - 一般ユーザーでログイン
   *
   * 期待結果:
   * - アクセス拒否（リダイレクトまたはエラーメッセージ）
   */
  test('E2E-A003-101: 非管理者のアクセス', async ({ page }) => {
    // 1. 一般ユーザーでログイン
    await loginAsApprovedUser(page);

    // 2. API監視ページにアクセスを試みる
    await page.goto('/admin/api-monitor');

    // 3. アクセス拒否を確認
    await page.waitForTimeout(3000);

    const currentUrl = page.url();
    const errorMessage = page.locator('text=/アクセス権限がありません|管理者権限が必要です|403/i').first();
    const hasError = await errorMessage.isVisible().catch(() => false);
    const notOnAdminPage = !currentUrl.includes('/admin/api-monitor');

    expect(notOnAdminPage || hasError).toBeTruthy();
  });
});
