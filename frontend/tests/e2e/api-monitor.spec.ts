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
   * E2E-A003-002: 基本統計カードの表示
   *
   * 前提条件:
   * - 管理者アカウントでログイン
   *
   * 期待結果:
   * - 総API呼び出し数、総コスト、今日の呼び出し数、今日のコストが表示される
   */
  test('E2E-A003-002: 基本統計カードの表示', async ({ page }) => {
    // 1. 管理者でログイン
    await loginAsAdmin(page);

    // 2. API監視ページにアクセス
    await page.goto('/admin/api-monitor');

    // 3. 基本統計カードの表示を確認
    const totalRequestsCard = page.locator('text=/総API呼び出し数/i').first();
    await expect(totalRequestsCard).toBeVisible({ timeout: 10000 });

    const totalCostCard = page.locator('text=/総コスト/i').first();
    await expect(totalCostCard).toBeVisible();

    const todayRequestsCard = page.locator('text=/今日の呼び出し数/i').first();
    await expect(todayRequestsCard).toBeVisible();

    const todayCostCard = page.locator('text=/今日のコスト/i').first();
    await expect(todayCostCard).toBeVisible();
  });

  /**
   * E2E-A003-003: 追加統計メトリクスの表示
   *
   * 前提条件:
   * - 管理者アカウントでログイン
   *
   * 期待結果:
   * - 総トークン数、平均コスト/リクエスト、アクティブPhase数が表示される
   */
  test('E2E-A003-003: 追加統計メトリクスの表示', async ({ page }) => {
    // 1. 管理者でログイン
    await loginAsAdmin(page);

    // 2. API監視ページにアクセス
    await page.goto('/admin/api-monitor');

    // 3. 追加メトリクスの表示を確認
    const totalTokensCard = page.locator('text=/総トークン数/i').first();
    await expect(totalTokensCard).toBeVisible({ timeout: 10000 });

    const avgCostCard = page.locator('text=/平均コスト/i').first();
    await expect(avgCostCard).toBeVisible();

    const activePhaseCard = page.locator('text=/アクティブPhase数/i').first();
    await expect(activePhaseCard).toBeVisible();
  });

  /**
   * E2E-A003-004: キャッシュ統計の表示
   *
   * 前提条件:
   * - 管理者アカウントでログイン
   *
   * 期待結果:
   * - キャッシュヒット率（全期間・今日）、キャッシュリクエスト数が表示される
   */
  test('E2E-A003-004: キャッシュ統計の表示', async ({ page }) => {
    // 1. 管理者でログイン
    await loginAsAdmin(page);

    // 2. API監視ページにアクセス
    await page.goto('/admin/api-monitor');

    // 3. キャッシュ統計の表示を確認
    const cacheHitRateTotal = page.locator('text=/キャッシュヒット率.*全期間/i').first();
    await expect(cacheHitRateTotal).toBeVisible({ timeout: 10000 });

    const cacheHitRateToday = page.locator('text=/キャッシュヒット率.*今日/i').first();
    await expect(cacheHitRateToday).toBeVisible();

    const totalCachedRequests = page.locator('text=/総キャッシュリクエスト数/i').first();
    await expect(totalCachedRequests).toBeVisible();

    const todayCachedRequests = page.locator('text=/今日のキャッシュリクエスト数/i').first();
    await expect(todayCachedRequests).toBeVisible();
  });

  /**
   * E2E-A003-005: Phase別統計テーブルの表示（全期間）
   *
   * 前提条件:
   * - 管理者アカウントでログイン
   *
   * 期待結果:
   * - Phase別統計テーブルが表示される
   * - Phase、呼び出し数、コスト、トークン数の列が存在する
   */
  test('E2E-A003-005: Phase別統計テーブルの表示（全期間）', async ({ page }) => {
    // 1. 管理者でログイン
    await loginAsAdmin(page);

    // 2. API監視ページにアクセス
    await page.goto('/admin/api-monitor');

    // 3. Phase別統計テーブルの表示を確認
    const phaseStatsTitle = page.locator('text=/Phase別統計.*全期間/i').first();
    await expect(phaseStatsTitle).toBeVisible({ timeout: 10000 });

    // 4. テーブルヘッダーの確認
    const phaseHeader = page.locator('th').filter({ hasText: /^Phase$/i }).first();
    await expect(phaseHeader).toBeVisible();

    const requestsHeader = page.locator('th').filter({ hasText: /呼び出し数/i }).first();
    await expect(requestsHeader).toBeVisible();

    const costHeader = page.locator('th').filter({ hasText: /コスト/i }).first();
    await expect(costHeader).toBeVisible();

    const tokensHeader = page.locator('th').filter({ hasText: /トークン数/i }).first();
    await expect(tokensHeader).toBeVisible();
  });

  /**
   * E2E-A003-006: Phase別統計テーブルの表示（今日）
   *
   * 前提条件:
   * - 管理者アカウントでログイン
   *
   * 期待結果:
   * - 今日のPhase別統計テーブルが表示される
   */
  test('E2E-A003-006: Phase別統計テーブルの表示（今日）', async ({ page }) => {
    // 1. 管理者でログイン
    await loginAsAdmin(page);

    // 2. API監視ページにアクセス
    await page.goto('/admin/api-monitor');

    // 3. 今日のPhase別統計テーブルの表示を確認
    const todayPhaseStatsTitle = page.locator('text=/Phase別統計.*今日/i').first();
    await expect(todayPhaseStatsTitle).toBeVisible({ timeout: 10000 });

    // 4. テーブルヘッダーの確認
    const phaseHeader = page.locator('th').filter({ hasText: /^Phase$/i }).nth(1);
    await expect(phaseHeader).toBeVisible();
  });

  /**
   * E2E-A003-007: トップユーザーテーブルの表示
   *
   * 前提条件:
   * - 管理者アカウントでログイン
   *
   * 期待結果:
   * - トップユーザーテーブルが表示される
   * - ユーザー名、総API呼び出し数、総コストの列が存在する
   */
  test('E2E-A003-007: トップユーザーテーブルの表示', async ({ page }) => {
    // 1. 管理者でログイン
    await loginAsAdmin(page);

    // 2. API監視ページにアクセス
    await page.goto('/admin/api-monitor');

    // 3. トップユーザーテーブルの表示を確認
    const topUsersTitle = page.locator('text=/トップユーザー/i').first();
    await expect(topUsersTitle).toBeVisible({ timeout: 10000 });

    // 4. テーブルヘッダーの確認
    const userNameHeader = page.locator('th').filter({ hasText: /ユーザー名/i }).first();
    await expect(userNameHeader).toBeVisible();

    const requestsHeader = page.locator('th').filter({ hasText: /総API呼び出し数/i }).first();
    await expect(requestsHeader).toBeVisible();

    const costHeader = page.locator('th').filter({ hasText: /総コスト/i }).first();
    await expect(costHeader).toBeVisible();
  });

  /**
   * E2E-A003-008: レスポンシブデザイン検証
   *
   * 前提条件:
   * - 管理者アカウントでログイン
   *
   * 期待結果:
   * - モバイル・タブレット・デスクトップで適切に表示される
   */
  test('E2E-A003-008: レスポンシブデザイン検証', async ({ page }) => {
    // 1. 管理者でログイン
    await loginAsAdmin(page);

    // 2. API監視ページにアクセス
    await page.goto('/admin/api-monitor');

    // 3. モバイルサイズ (375x667)
    await page.setViewportSize({ width: 375, height: 667 });
    const headingMobile = page.locator('h1, h2, h3, h4').filter({ hasText: /API監視/i }).first();
    await expect(headingMobile).toBeVisible({ timeout: 10000 });

    // 4. タブレットサイズ (768x1024)
    await page.setViewportSize({ width: 768, height: 1024 });
    const headingTablet = page.locator('h1, h2, h3, h4').filter({ hasText: /API監視/i }).first();
    await expect(headingTablet).toBeVisible();

    // 5. デスクトップサイズ (1920x1080)
    await page.setViewportSize({ width: 1920, height: 1080 });
    const headingDesktop = page.locator('h1, h2, h3, h4').filter({ hasText: /API監視/i }).first();
    await expect(headingDesktop).toBeVisible();

    // 6. 統計カードが表示されることを確認
    const statsCard = page.locator('text=/総API呼び出し数/i').first();
    await expect(statsCard).toBeVisible();
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
