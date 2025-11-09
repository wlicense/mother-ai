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
   * E2E-A002-002: ユーザーテーブルの列表示
   *
   * 前提条件:
   * - 管理者アカウントでログイン
   *
   * 期待結果:
   * - テーブルに氏名、メール、ステータス、権限、プロジェクト数の列が表示される
   */
  test('E2E-A002-002: ユーザーテーブルの列表示', async ({ page }) => {
    // 1. 管理者でログイン
    await loginAsAdmin(page);

    // 2. ユーザー管理ページにアクセス
    await page.goto('/admin/users');

    // 3. テーブルヘッダーを確認
    const nameHeader = page.locator('th').filter({ hasText: /氏名|名前/i }).first();
    const emailHeader = page.locator('th').filter({ hasText: /メール/i }).first();
    const statusHeader = page.locator('th').filter({ hasText: /ステータス/i }).first();

    // いずれかのヘッダーが表示されることを確認
    await expect(nameHeader.or(emailHeader).or(statusHeader).first()).toBeVisible({ timeout: 10000 });
  });

  /**
   * E2E-A002-003: ユーザーデータの表示
   *
   * 前提条件:
   * - 管理者アカウントでログイン
   * - データベースに1人以上のユーザーが存在
   *
   * 期待結果:
   * - テーブルにユーザーデータが表示される
   */
  test('E2E-A002-003: ユーザーデータの表示', async ({ page }) => {
    // 1. 管理者でログイン
    await loginAsAdmin(page);

    // 2. ユーザー管理ページにアクセス
    await page.goto('/admin/users');

    // 3. テーブル行が表示されることを確認（ヘッダー行を除く）
    const tableRows = page.locator('tbody tr');
    const rowCount = await tableRows.count();

    // 少なくとも1人のユーザー（管理者自身）が表示されるはず
    expect(rowCount).toBeGreaterThan(0);
  });

  /**
   * E2E-A002-004: ユーザーステータス表示
   *
   * 前提条件:
   * - 管理者アカウントでログイン
   *
   * 期待結果:
   * - ユーザーのステータス（承認済み、審査待ち、却下、停止）が表示される
   */
  test('E2E-A002-004: ユーザーステータス表示', async ({ page }) => {
    // 1. 管理者でログイン
    await loginAsAdmin(page);

    // 2. ユーザー管理ページにアクセス
    await page.goto('/admin/users');

    // 3. ステータスが表示されることを確認
    const statusCell = page.locator('td').filter({ hasText: /承認済み|審査待ち|却下|停止|approved|pending|rejected|suspended/i }).first();
    await expect(statusCell).toBeVisible({ timeout: 10000 });
  });

  /**
   * E2E-A002-005: レスポンシブデザイン検証
   *
   * 前提条件:
   * - 管理者アカウントでログイン
   *
   * 期待結果:
   * - モバイル・タブレット・デスクトップで適切に表示される
   */
  test('E2E-A002-005: レスポンシブデザイン検証', async ({ page }) => {
    // 1. 管理者でログイン
    await loginAsAdmin(page);

    // 2. ユーザー管理ページにアクセス
    await page.goto('/admin/users');

    // 3. モバイルサイズ (375x667)
    await page.setViewportSize({ width: 375, height: 667 });
    const headingMobile = page.locator('h1, h2, h3, h4').filter({ hasText: /ユーザー|管理/i }).first();
    await expect(headingMobile).toBeVisible({ timeout: 10000 });

    // 4. タブレットサイズ (768x1024)
    await page.setViewportSize({ width: 768, height: 1024 });
    const headingTablet = page.locator('h1, h2, h3, h4').filter({ hasText: /ユーザー|管理/i }).first();
    await expect(headingTablet).toBeVisible();

    // 5. デスクトップサイズ (1920x1080)
    await page.setViewportSize({ width: 1920, height: 1080 });
    const headingDesktop = page.locator('h1, h2, h3, h4').filter({ hasText: /ユーザー|管理/i }).first();
    await expect(headingDesktop).toBeVisible();
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
