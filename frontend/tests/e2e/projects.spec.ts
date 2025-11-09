import { test, expect } from '@playwright/test';
import { loginAsApprovedUser } from './helpers';

/**
 * P-004: プロジェクト一覧・管理 E2Eテスト
 */

test.describe('P-004: プロジェクト一覧・管理', () => {
  /**
   * E2E-P004-001: プロジェクト一覧表示
   *
   * 前提条件:
   * - ログイン済み
   * - ユーザーが少なくとも1つのプロジェクトを所有（または0個でも可）
   *
   * 期待結果:
   * - プロジェクト一覧ページが表示される
   * - プロジェクトカードまたは空状態メッセージが表示される
   * - 「新規プロジェクト作成」ボタンが表示される
   */
  test('E2E-P004-001: プロジェクト一覧表示', async ({ page }) => {
    // 1. 承認済みユーザーでログイン
    await loginAsApprovedUser(page);

    // 2. プロジェクト一覧ページが表示されていることを確認
    await expect(page).toHaveURL(/.*projects/, { timeout: 10000 });

    // 3. ページタイトルまたは見出しを確認
    const heading = page.locator('h1, h2, h3, h4').filter({ hasText: /プロジェクト|Projects/i }).first();
    await expect(heading).toBeVisible({ timeout: 5000 });

    // 4. 新規作成ボタンが表示されることを確認
    const createButton = page.getByRole('button', { name: /新規|作成|プロジェクト/i });
    await expect(createButton.first()).toBeVisible();

    // 5. プロジェクトカードまたは空状態が表示されることを確認
    // (プロジェクトがあればカード、なければ空状態メッセージ)
    const projectCards = page.locator('[data-testid="project-card"]');
    const emptyMessage = page.locator('[data-testid="empty-projects-message"]');

    // どちらかが表示されていればOK（タイムアウトを待つ）
    await page.waitForSelector('[data-testid="project-card"], [data-testid="empty-projects-message"]', { timeout: 10000 })
      .catch(() => {
        // タイムアウトした場合、どちらも表示されていない
        throw new Error('プロジェクトカードも空状態メッセージも表示されませんでした');
      });

    const hasCards = await projectCards.first().isVisible().catch(() => false);
    const hasEmptyMessage = await emptyMessage.isVisible().catch(() => false);

    expect(hasCards || hasEmptyMessage).toBeTruthy();
  });

  /**
   * E2E-P004-002: 新規プロジェクト作成
   *
   * 前提条件:
   * - ログイン済み
   *
   * 期待結果:
   * - プロジェクトが作成される
   * - /projects/{id} にリダイレクト
   * - Phase 1が自動的に開始される
   */
  test('E2E-P004-002: 新規プロジェクト作成', async ({ page }) => {
    // 1. 承認済みユーザーでログイン
    await loginAsApprovedUser(page);

    // 2. 新規プロジェクト作成ボタンをクリック
    const createButton = page.getByRole('button', { name: '新規プロジェクト' });
    await createButton.click();

    // 3. ダイアログが表示されるのを待つ
    const dialogTitle = page.getByRole('heading', { name: '新規プロジェクト作成' });
    await expect(dialogTitle).toBeVisible({ timeout: 5000 });

    // 4. プロジェクト名を入力（MUIのTextFieldはlabelで識別）
    const projectNameInput = page.getByLabel('プロジェクト名');
    await projectNameInput.fill('E2Eテストプロジェクト');

    // 5. 作成ボタンをクリック（ダイアログ内の「作成」ボタン）
    const submitButton = page.getByRole('button', { name: '作成', exact: true });
    await submitButton.click();

    // 6. ダイアログが閉じられることを確認
    await expect(dialogTitle).not.toBeVisible({ timeout: 5000 });

    // 7. 自動的にプロジェクト詳細ページに遷移することを確認
    await expect(page).toHaveURL(/.*projects\/[a-zA-Z0-9-]+$/, { timeout: 5000 });

    // 8. プロジェクト一覧に戻る
    await page.goto('/projects');

    // 9. 作成したプロジェクトが一覧に表示されることを確認
    const projectCard = page.locator('text=E2Eテストプロジェクト').first();
    await expect(projectCard).toBeVisible({ timeout: 5000 });

    // 10. Phase 1が表示されることを確認
    const phase1Chip = page.locator('text=/Phase 1/i').first();
    await expect(phase1Chip).toBeVisible({ timeout: 5000 });
  });

  /**
   * E2E-P004-003: プロジェクト削除
   *
   * 前提条件:
   * - ログイン済み
   * - プロジェクトが1つ以上存在
   *
   * 期待結果:
   * - 削除確認ダイアログが表示される
   * - プロジェクトが一覧から削除される
   */
  test('E2E-P004-003: プロジェクト削除', async ({ page }) => {
    // 1. 承認済みユーザーでログイン
    await loginAsApprovedUser(page);

    // 2. プロジェクトを作成
    const createButton = page.getByRole('button', { name: '新規プロジェクト' });
    await createButton.click();

    const dialogTitle = page.getByRole('heading', { name: '新規プロジェクト作成' });
    await expect(dialogTitle).toBeVisible({ timeout: 5000 });

    const projectNameInput = page.getByLabel('プロジェクト名');
    const testProjectName = `削除テスト用プロジェクト_${Date.now()}`;
    await projectNameInput.fill(testProjectName);

    const submitButton = page.getByRole('button', { name: '作成', exact: true });
    await submitButton.click();

    await expect(dialogTitle).not.toBeVisible({ timeout: 5000 });

    // 自動的にプロジェクト詳細ページに遷移するので、一覧ページに戻る
    await page.goto('/projects');

    // 3. 削除ボタンをクリック
    const projectCard = page.locator('text=' + testProjectName).first();
    await expect(projectCard).toBeVisible({ timeout: 5000 });

    // プロジェクトカード内の削除ボタンを見つける
    const deleteButton = page.locator('.MuiCard-root').filter({ has: page.locator(`text=${testProjectName}`) }).getByRole('button', { name: '削除' });
    await deleteButton.click();

    // 4. 削除確認ダイアログが表示されることを確認
    const deleteDialog = page.getByRole('heading', { name: 'プロジェクトの削除' });
    await expect(deleteDialog).toBeVisible({ timeout: 5000 });

    // 5. 削除確認
    const confirmButton = page.getByRole('button', { name: '削除', exact: true });
    await confirmButton.click();

    // 6. ダイアログが閉じられることを確認
    await expect(deleteDialog).not.toBeVisible({ timeout: 5000 });

    // 7. プロジェクトが一覧から削除されていることを確認
    await expect(projectCard).not.toBeVisible({ timeout: 5000 });
  });

  /**
   * E2E-P004-004: プロジェクト詳細へ遷移
   *
   * 前提条件:
   * - ログイン済み
   * - プロジェクトが1つ以上存在
   *
   * 期待結果:
   * - /projects/{id} にリダイレクト
   */
  test('E2E-P004-004: プロジェクト詳細へ遷移', async ({ page }) => {
    // 1. 承認済みユーザーでログイン
    await loginAsApprovedUser(page);

    // 2. 「詳細を見る」ボタンをクリック
    const detailButton = page.getByRole('button', { name: '詳細を見る' }).first();
    await detailButton.click();

    // 3. プロジェクト詳細ページにリダイレクトされることを確認
    await expect(page).toHaveURL(/.*projects\/[a-zA-Z0-9-]+$/, { timeout: 10000 });

    // 4. プロジェクト名が表示されることを確認
    const projectName = page.locator('h1, h2, h3, h4').first();
    await expect(projectName).toBeVisible({ timeout: 5000 });
  });

  /**
   * E2E-P004-005: 空のプロジェクト一覧表示
   *
   * 前提条件:
   * - ユーザーがプロジェクトを1つも持っていない
   *
   * 期待結果:
   * - 「プロジェクトがありません」メッセージ表示
   * - 「新規プロジェクト作成」ボタンが強調表示
   */
  test('E2E-P004-005: 空のプロジェクト一覧表示', async ({ page }) => {
    // 1. 承認済みユーザーでログイン
    await loginAsApprovedUser(page);

    // 2. 既存のプロジェクトを全てAPI経由で削除（UI削除は29件だと時間がかかりすぎるため）
    const token = await page.evaluate(() => localStorage.getItem('auth_token'));
    const apiBaseUrl = 'http://localhost:8572/api/v1';

    // プロジェクト一覧を取得
    const projectsResponse = await page.request.get(`${apiBaseUrl}/projects`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const projects = await projectsResponse.json();

    // 全プロジェクトを削除
    for (const project of projects) {
      await page.request.delete(`${apiBaseUrl}/projects/${project.id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
    }

    // ページをリロードして空状態を表示
    await page.reload();
    await page.waitForLoadState('networkidle');

    // 3. 空状態メッセージが表示されることを確認
    const emptyMessage = page.locator('[data-testid="empty-projects-message"]');
    await expect(emptyMessage).toBeVisible({ timeout: 5000 });

    // 4. 「プロジェクトがありません」メッセージが含まれることを確認
    await expect(emptyMessage).toContainText(/プロジェクトがありません|プロジェクトがまだありません/i);

    // 5. 新規プロジェクト作成ボタンが表示されることを確認
    const createButton = page.getByRole('button', { name: /新規|作成|プロジェクト/i });
    await expect(createButton.first()).toBeVisible();
  });

  /**
   * E2E-P004-101: 削除確認モーダルキャンセル
   *
   * 前提条件:
   * - ログイン済み
   * - プロジェクトが1つ以上存在
   *
   * 期待結果:
   * - キャンセルするとプロジェクトは削除されない
   */
  test('E2E-P004-101: 削除確認モーダルキャンセル', async ({ page }) => {
    // 1. 承認済みユーザーでログイン
    await loginAsApprovedUser(page);

    // 2. テスト用プロジェクトを作成（削除対象として）
    const createButton = page.getByRole('button', { name: '新規プロジェクト' });
    await createButton.click();
    const dialogTitle = page.getByRole('heading', { name: '新規プロジェクト作成' });
    await expect(dialogTitle).toBeVisible({ timeout: 5000 });
    const projectNameInput = page.getByLabel('プロジェクト名');
    await projectNameInput.fill('削除キャンセルテスト用プロジェクト');
    const submitButton = page.getByRole('button', { name: '作成', exact: true });
    await submitButton.click();
    await expect(dialogTitle).not.toBeVisible({ timeout: 5000 });

    // 自動的にプロジェクト詳細ページに遷移するので、一覧ページに戻る
    await page.goto('/projects');

    // 3. 削除ボタンをクリック
    const deleteButton = page.getByRole('button', { name: '削除' }).first();
    await deleteButton.click();

    // 4. 削除確認ダイアログが表示されることを確認
    const deleteDialog = page.getByRole('heading', { name: 'プロジェクトの削除' });
    await expect(deleteDialog).toBeVisible({ timeout: 5000 });

    // 5. キャンセルボタンをクリック
    const cancelButton = page.getByRole('button', { name: 'キャンセル' }).last();
    await cancelButton.click();

    // 6. ダイアログが閉じられることを確認
    await expect(deleteDialog).not.toBeVisible({ timeout: 5000 });

    // 7. プロジェクトが一覧に残っていることを確認
    const projectCard = page.locator('text=削除キャンセルテスト用プロジェクト');
    await expect(projectCard).toBeVisible();
  });

  /**
   * E2E-P004-102: プロジェクト名が長い場合の表示
   *
   * 前提条件:
   * - ログイン済み
   *
   * 期待結果:
   * - 長いプロジェクト名が適切に表示される（省略または折り返し）
   */
  test('E2E-P004-102: プロジェクト名が長い場合の表示', async ({ page }) => {
    // 1. 承認済みユーザーでログイン
    await loginAsApprovedUser(page);

    // 2. 長い名前のプロジェクトを作成
    const longProjectName = 'これは非常に長いプロジェクト名でUIの表示テストを行うための名前です。'.repeat(2);
    const createButton = page.getByRole('button', { name: '新規プロジェクト' });
    await createButton.click();

    const dialogTitle = page.getByRole('heading', { name: '新規プロジェクト作成' });
    await expect(dialogTitle).toBeVisible({ timeout: 5000 });

    const projectNameInput = page.getByLabel('プロジェクト名');
    await projectNameInput.fill(longProjectName);

    const submitButton = page.getByRole('button', { name: '作成', exact: true });
    await submitButton.click();

    await expect(dialogTitle).not.toBeVisible({ timeout: 5000 });

    // 3. プロジェクトカードが表示されることを確認
    const projectCards = page.locator('.MuiCard-root');
    await expect(projectCards.first()).toBeVisible({ timeout: 5000 });

    // 4. カードがページ幅を超えていないことを確認
    const firstCard = projectCards.first();
    const cardBox = await firstCard.boundingBox();
    const viewportSize = page.viewportSize();

    if (cardBox && viewportSize) {
      expect(cardBox.width).toBeLessThanOrEqual(viewportSize.width);
    }
  });
});
