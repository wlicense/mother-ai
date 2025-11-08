"""
テスト生成テンプレート
Phase 5で使用するテストコード生成テンプレート集
"""

from typing import Dict


def generate_test_files(project_name: str = "My App", generated_code: Dict = None) -> Dict[str, str]:
    """
    テストファイルを生成

    Args:
        project_name: プロジェクト名
        generated_code: Phase 2で生成されたコード（オプション）

    Returns:
        テストファイルの辞書
    """
    safe_name = project_name.lower().replace(" ", "-").replace("_", "-")

    test_files = {
        # フロントエンドテスト設定
        "frontend/vitest.config.ts": '''import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/test/',
      ],
    },
  },
})''',

        "frontend/src/test/setup.ts": '''import { expect, afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'
import matchers from '@testing-library/jest-dom/matchers'

// Extend Vitest matchers
expect.extend(matchers)

// Cleanup after each test
afterEach(() => {
  cleanup()
})''',

        "frontend/src/test/utils.tsx": '''import { ReactElement } from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter } from 'react-router-dom'
import { ThemeProvider } from '@mui/material/styles'
import theme from '../theme'

const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
})

interface AllTheProvidersProps {
  children: React.ReactNode
}

const AllTheProviders = ({ children }: AllTheProvidersProps) => {
  const testQueryClient = createTestQueryClient()

  return (
    <QueryClientProvider client={testQueryClient}>
      <ThemeProvider theme={theme}>
        <BrowserRouter>
          {children}
        </BrowserRouter>
      </ThemeProvider>
    </QueryClientProvider>
  )
}

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options })

export * from '@testing-library/react'
export { customRender as render }''',

        # コンポーネントテスト例
        "frontend/src/pages/Dashboard.test.tsx": '''import { describe, it, expect } from 'vitest'
import { render, screen } from '../test/utils'
import Dashboard from './Dashboard'

describe('Dashboard', () => {
  it('renders dashboard heading', () => {
    render(<Dashboard />)
    expect(screen.getByText('ダッシュボード')).toBeInTheDocument()
  })

  it('displays metric cards', () => {
    render(<Dashboard />)
    expect(screen.getByText('総アイテム数')).toBeInTheDocument()
    expect(screen.getByText('今日の追加')).toBeInTheDocument()
    expect(screen.getByText('アクティブ')).toBeInTheDocument()
  })

  it('shows activity section', () => {
    render(<Dashboard />)
    expect(screen.getByText('最近のアクティビティ')).toBeInTheDocument()
  })
})''',

        "frontend/src/pages/ItemList.test.tsx": '''import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '../test/utils'
import ItemList from './ItemList'
import * as apiClient from '../lib/axios'

// Mock API client
vi.mock('../lib/axios', () => ({
  default: {
    get: vi.fn(),
  },
}))

describe('ItemList', () => {
  const mockItems = [
    {
      id: 1,
      name: 'Test Item 1',
      description: 'Description 1',
      created_at: new Date().toISOString(),
    },
    {
      id: 2,
      name: 'Test Item 2',
      description: 'Description 2',
      created_at: new Date().toISOString(),
    },
  ]

  it('renders loading state initially', () => {
    vi.mocked(apiClient.default.get).mockImplementation(() =>
      new Promise(() => {}) // Never resolves
    )

    render(<ItemList />)
    expect(screen.getByRole('progressbar')).toBeInTheDocument()
  })

  it('renders items after loading', async () => {
    vi.mocked(apiClient.default.get).mockResolvedValue({
      data: mockItems,
    })

    render(<ItemList />)

    await waitFor(() => {
      expect(screen.getByText('Test Item 1')).toBeInTheDocument()
      expect(screen.getByText('Test Item 2')).toBeInTheDocument()
    })
  })

  it('renders error state on API failure', async () => {
    vi.mocked(apiClient.default.get).mockRejectedValue(
      new Error('API Error')
    )

    render(<ItemList />)

    await waitFor(() => {
      expect(screen.getByText('データの読み込みに失敗しました')).toBeInTheDocument()
    })
  })
})''',

        # E2Eテスト設定
        "frontend/playwright.config.ts": f'''import {{ defineConfig, devices }} from '@playwright/test'

export default defineConfig({{
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {{
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
  }},

  projects: [
    {{
      name: 'chromium',
      use: {{ ...devices['Desktop Chrome'] }},
    }},
    {{
      name: 'firefox',
      use: {{ ...devices['Desktop Firefox'] }},
    }},
    {{
      name: 'webkit',
      use: {{ ...devices['Desktop Safari'] }},
    }},
  ],

  webServer: {{
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
  }},
}})''',

        "frontend/e2e/dashboard.spec.ts": f'''import {{ test, expect }} from '@playwright/test'

test.describe('Dashboard', () => {{
  test('should display dashboard with metrics', async ({{ page }}) => {{
    await page.goto('/')

    // Check heading
    await expect(page.getByRole('heading', {{ name: 'ダッシュボード' }})).toBeVisible()

    // Check metric cards
    await expect(page.getByText('総アイテム数')).toBeVisible()
    await expect(page.getByText('今日の追加')).toBeVisible()
    await expect(page.getByText('アクティブ')).toBeVisible()
  }})

  test('should navigate to item list', async ({{ page }}) => {{
    await page.goto('/')

    // Click navigation link
    await page.getByRole('link', {{ name: '一覧' }}).click()

    // Verify navigation
    await expect(page).toHaveURL('/items')
  }})
}})''',

        "frontend/e2e/items.spec.ts": '''import { test, expect } from '@playwright/test'

test.describe('Item List', () => {
  test('should display item list', async ({ page }) => {
    await page.goto('/items')

    // Check heading
    await expect(page.getByRole('heading', { name: 'アイテム一覧' })).toBeVisible()

    // Check new item button
    await expect(page.getByRole('link', { name: '新規作成' })).toBeVisible()
  })

  test('should navigate to item detail', async ({ page }) => {
    await page.goto('/items')

    // Wait for items to load
    await page.waitForSelector('table')

    // Click first item detail button
    const detailButton = page.getByRole('link', { name: '詳細' }).first()
    if (await detailButton.isVisible()) {
      await detailButton.click()

      // Verify navigation
      await expect(page.url()).toContain('/items/')
    }
  })
})''',

        # バックエンドテスト設定
        "backend/pytest.ini": '''[pytest]
testpaths = tests
python_files = test_*.py
python_classes = Test*
python_functions = test_*
addopts =
    -v
    --strict-markers
    --tb=short
    --cov=app
    --cov-report=html
    --cov-report=term-missing
markers =
    unit: Unit tests
    integration: Integration tests
    e2e: End-to-end tests
''',

        "backend/tests/__init__.py": "",

        "backend/tests/conftest.py": '''import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.main import app
from app.core.database import Base, get_db

# テスト用インメモリDB
SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False}
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

@pytest.fixture(scope="function")
def db_session():
    """テスト用DBセッション"""
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()
        Base.metadata.drop_all(bind=engine)

@pytest.fixture(scope="function")
def client(db_session):
    """テストクライアント"""
    def override_get_db():
        try:
            yield db_session
        finally:
            db_session.close()

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()

@pytest.fixture
def auth_headers():
    """認証ヘッダー"""
    return {"Authorization": "Bearer test_token"}
''',

        "backend/tests/test_items.py": '''import pytest
from fastapi import status

def test_get_items_empty(client, db_session):
    """アイテム一覧取得（空）"""
    response = client.get("/api/items")
    assert response.status_code == status.HTTP_200_OK
    assert response.json() == []

def test_create_item(client, db_session):
    """アイテム作成"""
    item_data = {
        "name": "Test Item",
        "description": "Test Description"
    }
    response = client.post("/api/items", json=item_data)
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["name"] == item_data["name"]
    assert data["description"] == item_data["description"]
    assert "id" in data

def test_get_item(client, db_session):
    """アイテム個別取得"""
    # Create item
    item_data = {"name": "Test Item", "description": "Test Description"}
    create_response = client.post("/api/items", json=item_data)
    item_id = create_response.json()["id"]

    # Get item
    response = client.get(f"/api/items/{item_id}")
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["id"] == item_id
    assert data["name"] == item_data["name"]

def test_get_item_not_found(client, db_session):
    """存在しないアイテム取得"""
    response = client.get("/api/items/999")
    assert response.status_code == status.HTTP_404_NOT_FOUND

def test_update_item(client, db_session):
    """アイテム更新"""
    # Create item
    item_data = {"name": "Test Item", "description": "Test Description"}
    create_response = client.post("/api/items", json=item_data)
    item_id = create_response.json()["id"]

    # Update item
    update_data = {"name": "Updated Item", "description": "Updated Description"}
    response = client.put(f"/api/items/{item_id}", json=update_data)
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["name"] == update_data["name"]
    assert data["description"] == update_data["description"]

def test_delete_item(client, db_session):
    """アイテム削除"""
    # Create item
    item_data = {"name": "Test Item", "description": "Test Description"}
    create_response = client.post("/api/items", json=item_data)
    item_id = create_response.json()["id"]

    # Delete item
    response = client.delete(f"/api/items/{item_id}")
    assert response.status_code == status.HTTP_200_OK

    # Verify deletion
    get_response = client.get(f"/api/items/{item_id}")
    assert get_response.status_code == status.HTTP_404_NOT_FOUND
''',

        # package.json更新（テスト用スクリプト追加）
        "frontend/package.json.test-scripts": '''{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui"
  },
  "devDependencies": {
    "vitest": "^1.0.4",
    "@vitest/ui": "^1.0.4",
    "@testing-library/react": "^14.1.2",
    "@testing-library/jest-dom": "^6.1.5",
    "@testing-library/user-event": "^14.5.1",
    "jsdom": "^23.0.1",
    "@playwright/test": "^1.40.1",
    "@vitest/coverage-v8": "^1.0.4"
  }
}''',

        # requirements.txt更新（テスト用）
        "backend/requirements-test.txt": '''pytest==7.4.3
pytest-cov==4.1.0
pytest-asyncio==0.21.1
httpx==0.25.2
''',

        "README_TESTING.md": f'''# {project_name} - テストガイド

このドキュメントは「マザーAI」Phase 5エージェントによって生成されました。

## 📋 テスト構成

### フロントエンド
- **ユニットテスト**: Vitest + React Testing Library
- **E2Eテスト**: Playwright
- **カバレッジ**: v8

### バックエンド
- **ユニットテスト**: pytest
- **カバレッジ**: pytest-cov
- **テストDB**: SQLite（インメモリ）

## 🚀 テスト実行

### フロントエンド

```bash
cd frontend

# ユニットテスト実行
npm run test

# UIモードで実行
npm run test:ui

# カバレッジ付き実行
npm run test:coverage

# E2Eテスト実行
npm run test:e2e

# E2E UIモードで実行
npm run test:e2e:ui
```

### バックエンド

```bash
cd backend

# 全テスト実行
pytest

# カバレッジ付き実行
pytest --cov=app --cov-report=html

# 特定のテストファイルのみ
pytest tests/test_items.py

# マーカー指定実行
pytest -m unit
pytest -m integration
```

## 📊 カバレッジ目標

- **フロントエンド**: 80%以上
- **バックエンド**: 90%以上

## ✅ テストチェックリスト

### ユニットテスト
- [ ] 全コンポーネントのレンダリングテスト
- [ ] 全APIエンドポイントのテスト
- [ ] エラーハンドリングのテスト
- [ ] バリデーションのテスト

### 統合テスト
- [ ] API連携テスト
- [ ] データベース操作テスト
- [ ] 認証・認可テスト

### E2Eテスト
- [ ] 主要ユーザーフローのテスト
- [ ] クロスブラウザテスト
- [ ] レスポンシブデザインテスト

## 🐛 CI/CD統合

GitHub Actionsでテストを自動実行:

```yaml
# .github/workflows/test.yml に既に設定済み
- Pull Request作成時
- mainブランチへのpush時
```

---

*このテストガイドは「マザーAI」Phase 5エージェントによって自動生成されました。*
''',
    }

    return test_files
