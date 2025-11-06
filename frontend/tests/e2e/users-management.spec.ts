import { test, expect } from '@playwright/test';
import { loginAsApprovedUser } from './helpers';

/**
 * A-002: ユーザー・プロジェクト管理 E2Eテスト
 */

test.describe('A-002: ユーザー・プロジェクト管理', () => {
  /**
   * E2E-A002-001: 全ユーザー一覧表示
   *
   * テスト対象外:
   * - 管理者権限が必要
   */
  test.skip('E2E-A002-001: 全ユーザー一覧表示', async ({ page }) => {
    // TODO: 管理者ユーザーのテストデータが必要
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
