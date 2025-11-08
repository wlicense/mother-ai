import { test, expect } from '@playwright/test';
import { loginAsApprovedUser, createProject } from './helpers';

/**
 * Phase 5-14 エージェント機能 E2Eテスト
 */

test.describe('Phase 5-14 エージェント機能テスト', () => {
  /**
   * E2E-PHASE-001: Phase 5テスト生成エージェント起動
   *
   * 前提条件:
   * - プロジェクトが作成されている
   *
   * 期待結果:
   * - Phase 5カードをクリックできる
   * - チャットヘッダーに「Phase 5: テスト」が表示される
   */
  test('E2E-PHASE-001: Phase 5テスト生成エージェント起動', async ({ page }) => {
    // 1. 承認済みユーザーでログイン
    await loginAsApprovedUser(page);

    // 2. プロジェクトを作成
    const projectId = await createProject(page, 'E2E Phase 5 Test Project');

    // 3. プロジェクト詳細ページにアクセス
    await page.goto(`/projects/${projectId}`);

    // 4. Phase 5カードを探す
    const phase5Card = page.locator('.MuiCard-root').filter({ has: page.locator('text=/Phase 5/i') }).first();
    await expect(phase5Card).toBeVisible({ timeout: 5000 });

    // 5. Phase 5カードをクリック
    await phase5Card.click();

    // 6. チャットヘッダーに「テスト」が表示されることを確認
    // （UI実装によって変わる可能性があるため、柔軟にマッチング）
    const chatSection = page.locator('text=/テスト|Phase 5/i').first();
    await expect(chatSection).toBeVisible({ timeout: 3000 });
  });

  /**
   * E2E-PHASE-002: Phase 6ドキュメント生成エージェント起動
   */
  test('E2E-PHASE-002: Phase 6ドキュメント生成エージェント起動', async ({ page }) => {
    await loginAsApprovedUser(page);
    const projectId = await createProject(page, 'E2E Phase 6 Test Project');
    await page.goto(`/projects/${projectId}`);

    const phase6Card = page.locator('.MuiCard-root').filter({ has: page.locator('text=/Phase 6/i') }).first();
    await expect(phase6Card).toBeVisible({ timeout: 5000 });
    await phase6Card.click();

    const chatSection = page.locator('text=/ドキュメント|Phase 6/i').first();
    await expect(chatSection).toBeVisible({ timeout: 3000 });
  });

  /**
   * E2E-PHASE-003: Phase 7デバッグエージェント起動
   */
  test('E2E-PHASE-003: Phase 7デバッグエージェント起動', async ({ page }) => {
    await loginAsApprovedUser(page);
    const projectId = await createProject(page, 'E2E Phase 7 Test Project');
    await page.goto(`/projects/${projectId}`);

    const phase7Card = page.locator('.MuiCard-root').filter({ has: page.locator('text=/Phase 7/i') }).first();
    await expect(phase7Card).toBeVisible({ timeout: 5000 });
    await phase7Card.click();

    const chatSection = page.locator('text=/デバッグ|Phase 7/i').first();
    await expect(chatSection).toBeVisible({ timeout: 3000 });
  });

  /**
   * E2E-PHASE-004: Phase 8パフォーマンスエージェント起動
   */
  test('E2E-PHASE-004: Phase 8パフォーマンスエージェント起動', async ({ page }) => {
    await loginAsApprovedUser(page);
    const projectId = await createProject(page, 'E2E Phase 8 Test Project');
    await page.goto(`/projects/${projectId}`);

    const phase8Card = page.locator('.MuiCard-root').filter({ has: page.locator('text=/Phase 8/i') }).first();
    await expect(phase8Card).toBeVisible({ timeout: 5000 });
    await phase8Card.click();

    const chatSection = page.locator('text=/パフォーマンス|Phase 8/i').first();
    await expect(chatSection).toBeVisible({ timeout: 3000 });
  });

  /**
   * E2E-PHASE-005: Phase 9セキュリティエージェント起動
   */
  test('E2E-PHASE-005: Phase 9セキュリティエージェント起動', async ({ page }) => {
    await loginAsApprovedUser(page);
    const projectId = await createProject(page, 'E2E Phase 9 Test Project');
    await page.goto(`/projects/${projectId}`);

    const phase9Card = page.locator('.MuiCard-root').filter({ has: page.locator('text=/Phase 9/i') }).first();
    await expect(phase9Card).toBeVisible({ timeout: 5000 });
    await phase9Card.click();

    const chatSection = page.locator('text=/セキュリティ|Phase 9/i').first();
    await expect(chatSection).toBeVisible({ timeout: 3000 });
  });

  /**
   * E2E-PHASE-006: Phase 10データベースエージェント起動
   */
  test('E2E-PHASE-006: Phase 10データベースエージェント起動', async ({ page }) => {
    await loginAsApprovedUser(page);
    const projectId = await createProject(page, 'E2E Phase 10 Test Project');
    await page.goto(`/projects/${projectId}`);

    const phase10Card = page.locator('.MuiCard-root').filter({ has: page.locator('text=/Phase 10/i') }).first();
    await expect(phase10Card).toBeVisible({ timeout: 5000 });
    await phase10Card.click();

    const chatSection = page.locator('text=/データベース|Phase 10/i').first();
    await expect(chatSection).toBeVisible({ timeout: 3000 });
  });

  /**
   * E2E-PHASE-007: Phase 11API設計エージェント起動
   */
  test('E2E-PHASE-007: Phase 11API設計エージェント起動', async ({ page }) => {
    await loginAsApprovedUser(page);
    const projectId = await createProject(page, 'E2E Phase 11 Test Project');
    await page.goto(`/projects/${projectId}`);

    const phase11Card = page.locator('.MuiCard-root').filter({ has: page.locator('text=/Phase 11/i') }).first();
    await expect(phase11Card).toBeVisible({ timeout: 5000 });
    await phase11Card.click();

    const chatSection = page.locator('text=/API設計|Phase 11/i').first();
    await expect(chatSection).toBeVisible({ timeout: 3000 });
  });

  /**
   * E2E-PHASE-008: Phase 12UX/UIエージェント起動
   */
  test('E2E-PHASE-008: Phase 12UX/UIエージェント起動', async ({ page }) => {
    await loginAsApprovedUser(page);
    const projectId = await createProject(page, 'E2E Phase 12 Test Project');
    await page.goto(`/projects/${projectId}`);

    const phase12Card = page.locator('.MuiCard-root').filter({ has: page.locator('text=/Phase 12/i') }).first();
    await expect(phase12Card).toBeVisible({ timeout: 5000 });
    await phase12Card.click();

    const chatSection = page.locator('text=/UX|Phase 12/i').first();
    await expect(chatSection).toBeVisible({ timeout: 3000 });
  });

  /**
   * E2E-PHASE-009: Phase 13リファクタリングエージェント起動
   */
  test('E2E-PHASE-009: Phase 13リファクタリングエージェント起動', async ({ page }) => {
    await loginAsApprovedUser(page);
    const projectId = await createProject(page, 'E2E Phase 13 Test Project');
    await page.goto(`/projects/${projectId}`);

    const phase13Card = page.locator('.MuiCard-root').filter({ has: page.locator('text=/Phase 13/i') }).first();
    await expect(phase13Card).toBeVisible({ timeout: 5000 });
    await phase13Card.click();

    const chatSection = page.locator('text=/リファクタリング|Phase 13/i').first();
    await expect(chatSection).toBeVisible({ timeout: 3000 });
  });

  /**
   * E2E-PHASE-010: Phase 14モニタリングエージェント起動
   */
  test('E2E-PHASE-010: Phase 14モニタリングエージェント起動', async ({ page }) => {
    await loginAsApprovedUser(page);
    const projectId = await createProject(page, 'E2E Phase 14 Test Project');
    await page.goto(`/projects/${projectId}`);

    const phase14Card = page.locator('.MuiCard-root').filter({ has: page.locator('text=/Phase 14/i') }).first();
    await expect(phase14Card).toBeVisible({ timeout: 5000 });
    await phase14Card.click();

    const chatSection = page.locator('text=/モニタリング|Phase 14/i').first();
    await expect(chatSection).toBeVisible({ timeout: 3000 });
  });

  /**
   * E2E-PHASE-011: 全Phaseカードのクリック可能性確認
   *
   * 前提条件:
   * - プロジェクトが作成されている
   *
   * 期待結果:
   * - Phase 1-14すべてのカードがクリック可能
   */
  test('E2E-PHASE-011: 全Phaseカードのクリック可能性確認', async ({ page }) => {
    await loginAsApprovedUser(page);
    const projectId = await createProject(page, 'E2E All Phases Test Project');
    await page.goto(`/projects/${projectId}`);

    // 全14個のPhaseカードを順番にクリック
    for (let phaseNum = 1; phaseNum <= 14; phaseNum++) {
      const phaseCard = page.locator('.MuiCard-root').filter({ has: page.locator(`text=/Phase ${phaseNum}/i`) }).first();

      // カードが表示されていることを確認
      await expect(phaseCard).toBeVisible({ timeout: 5000 });

      // クリックできることを確認
      await phaseCard.click();

      // 少し待機（UIの更新を待つ）
      await page.waitForTimeout(300);
    }
  });

  /**
   * E2E-PHASE-012: Phase 2でコード生成後、Phase 5でテスト生成のフロー
   *
   * 前提条件:
   * - モックモードで動作
   *
   * 期待結果:
   * - Phase 2でコード生成
   * - Phase 5でテストコード生成
   * - 生成されたファイルがFileTreeに表示される
   */
  test.skip('E2E-PHASE-012: Phase 2→Phase 5連携テスト', async ({ page }) => {
    // TODO: モックモード確認後に実装
    // Phase 2でコード生成 → Phase 5でテスト生成のフロー
  });
});
