/**
 * E2Eテスト共通ヘルパー関数
 *
 * テストの効率化と保守性向上のため、よく使う処理を共通化
 */

import { Page, expect } from '@playwright/test';

/**
 * ログイン処理
 *
 * @param page - Playwrightのpageオブジェクト
 * @param email - ログインメールアドレス（デフォルト: e2etest@example.com）
 * @param password - ログインパスワード（デフォルト: DevTest2025!）
 */
export async function login(
  page: Page,
  email: string = 'e2etest@example.com',
  password: string = 'DevTest2025!'
): Promise<void> {
  await page.goto('/login');

  const emailInput = page.locator('input[type="email"]').first();
  await emailInput.fill(email);

  const passwordInput = page.locator('input[type="password"]').first();
  await passwordInput.fill(password);

  const loginButton = page.getByRole('button', { name: 'ログイン', exact: true });
  await loginButton.click();

  // ログイン成功を待つ（/projectsまたは/pendingへのリダイレクト）
  await expect(page).toHaveURL(/.*projects|.*pending/, { timeout: 10000 });
}

/**
 * ログアウト処理
 *
 * @param page - Playwrightのpageオブジェクト
 */
export async function logout(page: Page): Promise<void> {
  // ヘッダーのメニューまたはログアウトボタンをクリック
  const logoutButton = page.getByRole('button', { name: /ログアウト|Logout/i });
  await logoutButton.click();

  // ログインページにリダイレクトされることを確認
  await expect(page).toHaveURL(/.*login/, { timeout: 5000 });
}

/**
 * 承認済みユーザーでログインし、プロジェクト一覧ページへ遷移
 *
 * @param page - Playwrightのpageオブジェクト
 */
export async function loginAsApprovedUser(page: Page): Promise<void> {
  await login(page);
  await expect(page).toHaveURL(/.*projects/, { timeout: 10000 });
}

/**
 * 管理者でログインし、プロジェクト一覧ページへ遷移
 *
 * @param page - Playwrightのpageオブジェクト
 */
export async function loginAsAdmin(page: Page): Promise<void> {
  await login(page, 'admin@example.com', 'AdminTest2025!');
  await expect(page).toHaveURL(/.*projects/, { timeout: 10000 });
}

/**
 * localStorageのJWTトークンを検証
 *
 * @param page - Playwrightのpageオブジェクト
 * @returns トークンが存在し、JWT形式であればtrue
 */
export async function verifyAuthToken(page: Page): Promise<boolean> {
  const token = await page.evaluate(() => localStorage.getItem('auth_token'));

  if (!token) return false;

  // JWT形式を確認（3つのパートがドットで区切られている）
  const jwtPattern = /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/;
  return jwtPattern.test(token);
}

/**
 * ページが完全に読み込まれるまで待機
 *
 * @param page - Playwrightのpageオブジェクト
 */
export async function waitForPageLoad(page: Page): Promise<void> {
  await page.waitForLoadState('networkidle');
}

/**
 * エラーメッセージの表示を確認
 *
 * @param page - Playwrightのpageオブジェクト
 * @param errorText - 期待するエラーメッセージの一部（正規表現可）
 */
export async function expectErrorMessage(page: Page, errorText: string | RegExp): Promise<void> {
  const errorAlert = page.locator('.MuiAlert-root, [role="alert"]');
  await expect(errorAlert).toBeVisible({ timeout: 5000 });
  await expect(errorAlert).toContainText(errorText);
}

/**
 * 成功メッセージの表示を確認
 *
 * @param page - Playwrightのpageオブジェクト
 * @param successText - 期待する成功メッセージの一部（正規表現可）
 */
export async function expectSuccessMessage(page: Page, successText: string | RegExp): Promise<void> {
  const successAlert = page.locator('.MuiAlert-root, [role="alert"]');
  await expect(successAlert).toBeVisible({ timeout: 5000 });
  await expect(successAlert).toContainText(successText);
}

/**
 * 新規プロジェクトを作成
 *
 * @param page - Playwrightのpageオブジェクト
 * @param projectName - プロジェクト名
 * @param projectDescription - プロジェクト説明（オプション）
 * @returns 作成されたプロジェクトのID
 */
export async function createProject(
  page: Page,
  projectName: string,
  projectDescription: string = ''
): Promise<string> {
  // 現在のURL（プロジェクト一覧ページにいるはず）
  await page.waitForURL(/.*projects$/);

  // 新規プロジェクト作成ボタンをクリック
  const createButton = page.getByRole('button', { name: '新規プロジェクト' });
  await createButton.click();

  // ダイアログが表示されるのを待つ
  const dialogTitle = page.getByRole('heading', { name: '新規プロジェクト作成' });
  await expect(dialogTitle).toBeVisible({ timeout: 5000 });

  // プロジェクト名を入力
  const projectNameInput = page.getByLabel('プロジェクト名');
  await projectNameInput.fill(projectName);

  // プロジェクト説明を入力（指定された場合）
  if (projectDescription) {
    const projectDescInput = page.getByLabel('プロジェクト概要');
    await projectDescInput.fill(projectDescription);
  }

  // 作成ボタンをクリック
  const submitButton = page.getByRole('button', { name: '作成', exact: true });
  await submitButton.click();

  // ダイアログが閉じられるのを待つ
  await expect(dialogTitle).not.toBeVisible({ timeout: 5000 });

  // プロジェクトが一覧に表示されるのを確認
  const projectCard = page.locator('.MuiCard-root').filter({ has: page.locator(`text=${projectName}`) }).first();
  await expect(projectCard).toBeVisible({ timeout: 5000 });

  // 新しく作成したプロジェクトカード内の詳細を見るボタンをクリック
  const detailButton = projectCard.getByRole('button', { name: '詳細を見る' });
  await detailButton.click();

  // URL変更を待つ（/projects/{id} に遷移）
  await page.waitForURL(/.*projects\/[a-zA-Z0-9-]+$/, { timeout: 10000 });

  // URLからプロジェクトIDを取得
  const url = page.url();
  const projectId = url.split('/projects/')[1];

  // プロジェクト一覧ページに戻る
  await page.goto('/projects');

  return projectId;
}
