import { test, expect } from '@playwright/test';

const PRODUCTION_URL = 'https://frontend-7b8pescz6-wlicenses-projects.vercel.app';
const TEST_USER = {
  email: 'admin@motherai.local',
  password: 'AdminTest2025!'
};

test.describe('本番環境ログインテスト', () => {
  test('管理者アカウントでログインできること', async ({ page }) => {
    // タイムアウトを延長（本番環境は遅い場合がある）
    test.setTimeout(60000);

    console.log('1. フロントエンドにアクセス中...');
    await page.goto(PRODUCTION_URL, { waitUntil: 'networkidle' });

    // スクリーンショットを取得（デバッグ用）
    await page.screenshot({ path: 'e2e-screenshots/01-landing.png', fullPage: true });
    console.log('   ✓ ランディングページ表示完了');

    // ログインページに遷移
    console.log('2. ログインページへ遷移中...');
    const loginButton = page.getByRole('button', { name: /ログイン|login/i }).first();
    await loginButton.click();
    await page.waitForURL(/.*login.*/i, { timeout: 10000 });

    await page.screenshot({ path: 'e2e-screenshots/02-login-page.png', fullPage: true });
    console.log('   ✓ ログインページ表示完了');

    // 認証情報を入力
    console.log('3. 認証情報を入力中...');
    await page.fill('input[type="email"], input[name="email"]', TEST_USER.email);
    await page.fill('input[type="password"], input[name="password"]', TEST_USER.password);

    await page.screenshot({ path: 'e2e-screenshots/03-credentials-entered.png', fullPage: true });
    console.log('   ✓ 認証情報入力完了');

    // ログイン実行
    console.log('4. ログインボタンをクリック中...');
    const submitButton = page.getByRole('button', { name: /ログイン|login|サインイン|sign in/i }).first();
    await submitButton.click();

    // ダッシュボードへの遷移を待機
    console.log('5. ダッシュボードへの遷移を待機中...');
    await page.waitForURL(/.*dashboard|projects.*/i, { timeout: 15000 });

    await page.screenshot({ path: 'e2e-screenshots/04-dashboard.png', fullPage: true });
    console.log('   ✓ ダッシュボード表示完了');

    // ログイン成功の確認
    console.log('6. ログイン成功を検証中...');

    // ユーザー情報が表示されているか確認
    const userInfo = await page.locator('text=/admin|ダッシュボード|プロジェクト/i').first();
    await expect(userInfo).toBeVisible({ timeout: 5000 });

    console.log('   ✓ ログイン成功を確認');

    // 最終スクリーンショット
    await page.screenshot({ path: 'e2e-screenshots/05-logged-in.png', fullPage: true });

    console.log('\n✅ 本番環境でのログインテスト成功！');
  });

  test('バックエンドAPIとの疎通確認', async ({ page }) => {
    test.setTimeout(30000);

    console.log('1. ヘルスチェックAPIを確認中...');
    const response = await page.request.get('https://mother-ai-backend-735112328456.asia-northeast1.run.app/health');

    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    console.log('   ✓ バックエンド応答:', data);

    expect(data).toHaveProperty('status', 'healthy');
    console.log('\n✅ バックエンドAPI疎通確認成功！');
  });
});
