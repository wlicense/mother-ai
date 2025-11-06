import { test, expect } from '@playwright/test';
import { loginAsApprovedUser } from './helpers';

/**
 * A-001: 申請審査ダッシュボード E2Eテスト
 */

test.describe('A-001: 申請審査ダッシュボード', () => {
  /**
   * E2E-A001-001: 申請一覧表示
   *
   * 前提条件:
   * - 管理者アカウントでログイン
   * - 審査待ち申請が存在（または0件）
   *
   * 期待結果:
   * - 申請一覧ページが表示される
   * - テーブルヘッダーが表示される
   * - 空状態メッセージまたは申請リストが表示される
   */
  test.skip('E2E-A001-001: 申請一覧表示', async ({ page }) => {
    // TODO: 管理者ユーザーのテストデータが必要
    // 現在のテストユーザー(e2etest@example.com)は一般ユーザーのため、
    // 管理者権限が必要なこのテストはスキップ

    // 1. 管理者でログイン
    // await loginAsAdmin(page);

    // 2. 申請審査ページにアクセス
    await page.goto('/admin/applications');

    // 3. ページタイトルを確認
    const heading = page.locator('h1, h2, h3, h4').filter({ hasText: /申請審査/i }).first();
    await expect(heading).toBeVisible({ timeout: 5000 });

    // 4. テーブルヘッダーまたは空状態メッセージを確認
    const tableHeader = page.locator('text=/申請日時|氏名|メール/i').first();
    const emptyMessage = page.locator('text=/審査待ちの申請はありません/i').first();

    const hasTable = await tableHeader.isVisible().catch(() => false);
    const hasEmptyMessage = await emptyMessage.isVisible().catch(() => false);

    expect(hasTable || hasEmptyMessage).toBeTruthy();
  });

  /**
   * E2E-A001-002: 申請詳細表示
   *
   * テスト対象外:
   * - 詳細モーダル機能が未実装
   */
  test.skip('E2E-A001-002: 申請詳細表示', async ({ page }) => {
    // TODO: 詳細モーダル機能実装後に追加
  });

  /**
   * E2E-A001-003: 申請承認
   *
   * テスト対象外:
   * - 管理者ユーザーとテストデータのセットアップが必要
   */
  test.skip('E2E-A001-003: 申請承認', async ({ page }) => {
    // TODO: 管理者ユーザーとpending状態の申請データが必要
    // テストデータセットアップ後に実装
  });

  /**
   * E2E-A001-004: 申請却下
   *
   * テスト対象外:
   * - 管理者ユーザーとテストデータのセットアップが必要
   */
  test.skip('E2E-A001-004: 申請却下', async ({ page }) => {
    // TODO: 管理者ユーザーとpending状態の申請データが必要
    // テストデータセットアップ後に実装
  });

  /**
   * E2E-A001-005: 統計表示
   *
   * テスト対象外:
   * - 統計タブ機能が未実装
   */
  test.skip('E2E-A001-005: 統計表示', async ({ page }) => {
    // TODO: 統計タブ実装後に追加
  });

  /**
   * E2E-A001-006: フィルター機能
   *
   * テスト対象外:
   * - フィルター機能が未実装
   */
  test.skip('E2E-A001-006: フィルター機能', async ({ page }) => {
    // TODO: フィルター機能実装後に追加
  });

  /**
   * E2E-A001-101: 非管理者のアクセス
   *
   * 前提条件:
   * - 一般ユーザーでログイン
   *
   * 期待結果:
   * - アクセス拒否（リダイレクトまたはエラーメッセージ）
   */
  test('E2E-A001-101: 非管理者のアクセス', async ({ page }) => {
    // 1. 一般ユーザーでログイン
    await loginAsApprovedUser(page);

    // 2. 管理者ページにアクセスを試みる
    await page.goto('/admin/applications');

    // 3. アクセス拒否を確認
    // オプション1: /projectsにリダイレクトされる
    // オプション2: エラーメッセージが表示される
    // オプション3: 403ページが表示される

    // 5秒待って、どこにいるか確認
    await page.waitForTimeout(3000);

    const currentUrl = page.url();

    // 管理ページに留まっていないことを確認（リダイレクトされるはず）
    // または、エラーメッセージが表示されることを確認
    const errorMessage = page.locator('text=/アクセス権限がありません|管理者権限が必要です|403/i').first();
    const hasError = await errorMessage.isVisible().catch(() => false);

    const notOnAdminPage = !currentUrl.includes('/admin/applications');

    // どちらかが真であればOK（リダイレクトまたはエラー表示）
    expect(notOnAdminPage || hasError).toBeTruthy();
  });

  /**
   * E2E-A001-102: 却下理由が空で却下試行
   *
   * テスト対象外:
   * - 管理者ユーザーとテストデータのセットアップが必要
   */
  test.skip('E2E-A001-102: 却下理由が空で却下試行', async ({ page }) => {
    // TODO: 管理者ユーザーとテストデータ準備後に実装
  });
});
