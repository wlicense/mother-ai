import { test, expect } from '@playwright/test';
import { loginAsApprovedUser, loginAsAdmin } from './helpers';

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
  test('E2E-A001-001: 申請一覧表示', async ({ page }) => {
    // 1. 管理者でログイン
    await loginAsAdmin(page);

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
   * 前提条件:
   * - 管理者アカウントでログイン
   * - pending1@example.com が pending 状態で存在
   *
   * 期待結果:
   * - 承認ボタンをクリックして承認できる
   * - 申請が一覧から消える（approved状態になる）
   */
  test('E2E-A001-003: 申請承認', async ({ page }) => {
    // 1. 管理者でログイン
    await loginAsAdmin(page);

    // 2. 申請審査ページにアクセス
    await page.goto('/admin/applications');
    await page.waitForLoadState('networkidle');

    // 3. pending1@example.comの申請が表示されることを確認
    const pending1Email = page.locator('text=pending1@example.com');
    await expect(pending1Email).toBeVisible({ timeout: 5000 });

    // 4. 承認ボタンを探してクリック
    // pending1@example.comの行にある承認ボタン
    const approveButton = page.locator('tr')
      .filter({ has: page.locator('text=pending1@example.com') })
      .getByRole('button', { name: /承認/i });

    await approveButton.click();

    // 5. pending1@example.comが一覧から消えることを確認
    await expect(pending1Email).not.toBeVisible({ timeout: 5000 });
  });

  /**
   * E2E-A001-004: 申請却下
   *
   * 前提条件:
   * - 管理者アカウントでログイン
   * - pending2@example.com が pending 状態で存在
   *
   * 期待結果:
   * - 却下ボタンをクリックして却下ダイアログが表示される
   * - 却下理由を入力して却下できる
   * - 申請が一覧から消える（rejected状態になる）
   */
  test('E2E-A001-004: 申請却下', async ({ page }) => {
    // 1. 管理者でログイン
    await loginAsAdmin(page);

    // 2. 申請審査ページにアクセス
    await page.goto('/admin/applications');
    await page.waitForLoadState('networkidle');

    // 3. pending2@example.comの申請が表示されることを確認
    const pending2Email = page.locator('text=pending2@example.com');
    await expect(pending2Email).toBeVisible({ timeout: 5000 });

    // 4. 却下ボタンを探してクリック
    const rejectButton = page.locator('tr')
      .filter({ has: page.locator('text=pending2@example.com') })
      .getByRole('button', { name: /却下/i });

    await rejectButton.click();

    // 5. 却下ダイアログが表示されることを確認
    const rejectDialog = page.getByRole('heading', { name: /却下/i });
    await expect(rejectDialog).toBeVisible({ timeout: 5000 });

    // 6. 却下理由を入力
    const reasonInput = page.getByLabel(/理由/i);
    await reasonInput.fill('E2Eテスト用の却下');

    // 7. 却下確定ボタンをクリック
    const confirmRejectButton = page.getByRole('button', { name: /却下/i }).last();
    await confirmRejectButton.click();

    // 8. pending2@example.comが一覧から消えることを確認
    await expect(pending2Email).not.toBeVisible({ timeout: 5000 });
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
   * 前提条件:
   * - 管理者アカウントでログイン
   * - pending3@example.com が pending 状態で存在
   *
   * 期待結果:
   * - 却下ダイアログで理由を入力しないと却下ボタンが無効
   */
  test('E2E-A001-102: 却下理由が空で却下試行', async ({ page }) => {
    // 1. 管理者でログイン
    await loginAsAdmin(page);

    // 2. 申請審査ページにアクセス
    await page.goto('/admin/applications');
    await page.waitForLoadState('networkidle');

    // 3. pending3@example.comの申請が表示されることを確認
    const pending3Email = page.locator('text=pending3@example.com');
    await expect(pending3Email).toBeVisible({ timeout: 5000 });

    // 4. 却下ボタンを探してクリック
    const rejectButton = page.locator('tr')
      .filter({ has: page.locator('text=pending3@example.com') })
      .getByRole('button', { name: /却下/i });

    await rejectButton.click();

    // 5. 却下ダイアログが表示されることを確認
    const rejectDialog = page.getByRole('heading', { name: /却下/i });
    await expect(rejectDialog).toBeVisible({ timeout: 5000 });

    // 6. 却下理由フィールドが空のとき、却下ボタンが無効であることを確認
    const confirmRejectButton = page.getByRole('button', { name: /却下/i }).last();
    await expect(confirmRejectButton).toBeDisabled();

    // 7. キャンセルボタンをクリックしてダイアログを閉じる
    const cancelButton = page.getByRole('button', { name: /キャンセル/i }).last();
    await cancelButton.click();

    // 8. ダイアログが閉じられることを確認
    await expect(rejectDialog).not.toBeVisible({ timeout: 5000 });

    // 9. pending3@example.comが一覧に残っていることを確認（却下されていない）
    await expect(pending3Email).toBeVisible();
  });
});
