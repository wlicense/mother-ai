import { defineConfig, devices } from '@playwright/test';

/**
 * マザーAI - Playwright E2Eテスト設定
 *
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './tests/e2e',

  /* 並列実行の設定 */
  fullyParallel: false, // 順次実行（1個ずつ確実に）

  /* 失敗時のリトライ */
  retries: 0, // リトライなし（確実性重視）

  /* ワーカー数 */
  workers: 1, // 1個ずつ実行

  /* レポーター */
  reporter: 'html',

  /* 共通設定 */
  use: {
    /* ベースURL */
    baseURL: 'http://localhost:3347',

    /* スクリーンショット */
    screenshot: 'only-on-failure',

    /* ビデオ録画 */
    video: 'retain-on-failure',

    /* トレース */
    trace: 'retain-on-failure',
  },

  /* プロジェクト（ブラウザ別） */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  /* 開発サーバー起動（既存サーバーを使用） */
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3347',
    reuseExistingServer: true, // 常に既存サーバーを再利用
    timeout: 120 * 1000,
  },
});
