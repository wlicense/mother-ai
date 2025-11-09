import { test, expect } from '@playwright/test';

/**
 * P-001: ランディングページ E2Eテスト
 */

test.describe('P-001: ランディングページ', () => {
  /**
   * E2E-P001-001: ランディングページ表示
   *
   * 前提条件:
   * - なし（ゲストアクセス可能）
   *
   * 期待結果:
   * - ランディングページが正常に表示される
   * - サービス名が表示される
   * - CTA（利用申請、ログイン）ボタンが表示される
   */
  test('E2E-P001-001: ランディングページ表示', async ({ page }) => {
    // 1. / にアクセス
    await page.goto('/');

    // 2. ページが正常に読み込まれることを確認
    await expect(page).toHaveURL(/.*\/$|.*\/$/);

    // 3. サービス名「マザーAI」が表示されることを確認
    const serviceName = page.locator('text=/マザーAI|Mother AI/i').first();
    await expect(serviceName).toBeVisible({ timeout: 5000 });

    // 4. CTAボタン（利用申請またはログイン）が表示されることを確認
    const applyButton = page.getByRole('button', { name: /利用申請/i }).first();
    const loginButton = page.getByRole('button', { name: /ログイン/i }).first();

    await expect(applyButton).toBeVisible();
    await expect(loginButton).toBeVisible();

    // 5. 機能カードが表示されることを確認
    const featureCards = page.locator('.MuiCard-root');
    await expect(featureCards.first()).toBeVisible();
  });

  /**
   * E2E-P001-002: 申請フォームへ遷移
   *
   * 期待結果:
   * - 「利用申請」ボタンをクリックすると /apply に遷移
   */
  test('E2E-P001-002: 申請フォームへ遷移', async ({ page }) => {
    // 1. / にアクセス
    await page.goto('/');

    // 2. 「利用申請」ボタンをクリック
    const applyButton = page.getByRole('button', { name: /利用申請/i }).first();
    await applyButton.click();

    // 3. /apply に遷移することを確認
    await expect(page).toHaveURL(/.*apply/, { timeout: 5000 });

    // 4. 申請フォームが表示されることを確認
    const applyTitle = page.getByRole('heading', { name: /利用申請/i });
    await expect(applyTitle).toBeVisible();
  });

  /**
   * E2E-P001-003: ログインページへ遷移
   *
   * 期待結果:
   * - 「ログイン」ボタンをクリックすると /login に遷移
   */
  test('E2E-P001-003: ログインページへ遷移', async ({ page }) => {
    // 1. / にアクセス
    await page.goto('/');

    // 2. 「ログイン」ボタンをクリック
    const loginButton = page.getByRole('button', { name: /ログイン/i }).first();
    await loginButton.click();

    // 3. /login に遷移することを確認
    await expect(page).toHaveURL(/.*login/, { timeout: 5000 });

    // 4. ログインフォームが表示されることを確認
    const emailInput = page.locator('input[type="email"]').first();
    await expect(emailInput).toBeVisible();
  });

  /**
   * E2E-P001-004: 機能紹介セクション表示
   *
   * 期待結果:
   * - Phase 1-14の機能紹介カードが表示される
   */
  test('E2E-P001-004: 機能紹介セクション表示', async ({ page }) => {
    // 1. / にアクセス
    await page.goto('/');

    // 2. 機能カードが複数表示されることを確認
    const featureCards = page.locator('.MuiCard-root');
    const cardCount = await featureCards.count();
    expect(cardCount).toBeGreaterThan(0);

    // 3. 主要な機能説明のいずれかが表示されることを確認
    const mainFeatures = page.locator('text=/要件定義|コード生成|デプロイ|Phase/i').first();
    await expect(mainFeatures).toBeVisible({ timeout: 5000 });
  });

  /**
   * E2E-P001-101: レスポンシブデザイン検証（モバイル）
   *
   * 期待結果:
   * - モバイルサイズでもコンテンツが正常に表示される
   */
  test('E2E-P001-101: レスポンシブデザイン検証', async ({ page }) => {
    // 1. モバイルビューポートに設定
    await page.setViewportSize({ width: 375, height: 667 });

    // 2. / にアクセス
    await page.goto('/');

    // 3. サービス名が表示されることを確認
    const serviceName = page.locator('text=/マザーAI|Mother AI/i').first();
    await expect(serviceName).toBeVisible({ timeout: 5000 });

    // 4. CTAボタンが表示されることを確認
    const applyButton = page.getByRole('button', { name: /利用申請/i }).first();
    await expect(applyButton).toBeVisible();
  });
});
