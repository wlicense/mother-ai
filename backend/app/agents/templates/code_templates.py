"""
コード生成テンプレート
Phase 2で使用する実用的なテンプレート集
"""

from typing import Dict, Any


def generate_frontend_templates(project_name: str = "My App", features: list = None) -> Dict[str, str]:
    """
    フロントエンドテンプレートを生成（React + TypeScript + MUI）
    """
    if features is None:
        features = ["dashboard", "list", "detail"]

    safe_name = project_name.lower().replace(" ", "-").replace("_", "-")

    templates = {
        "package.json": f'''{{
  "name": "{safe_name}-frontend",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "scripts": {{
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "type-check": "tsc --noEmit"
  }},
  "dependencies": {{
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "react-router-dom": "^6.28.0",
    "@mui/material": "^6.1.7",
    "@mui/icons-material": "^6.1.7",
    "@emotion/react": "^11.13.5",
    "@emotion/styled": "^11.13.5",
    "axios": "^1.7.9",
    "@tanstack/react-query": "^5.62.7",
    "zustand": "^5.0.2"
  }},
  "devDependencies": {{
    "@types/react": "^18.3.12",
    "@types/react-dom": "^18.3.1",
    "@vitejs/plugin-react": "^4.3.4",
    "typescript": "^5.7.2",
    "vite": "^5.4.11"
  }}
}}''',

        "tsconfig.json": '''{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "isolatedModules": true,
    "moduleDetection": "force",
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedSideEffectImports": true
  },
  "include": ["src"]
}''',

        "vite.config.ts": '''import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },
})''',

        "index.html": f'''<!DOCTYPE html>
<html lang="ja">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>{project_name}</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>''',

        "src/main.tsx": '''import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import App from './App'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5分
      retry: 1,
    },
  },
})

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>,
)''',

        "src/App.tsx": f'''import {{ ThemeProvider }} from '@mui/material/styles'
import {{ CssBaseline }} from '@mui/material'
import {{ Routes, Route }} from 'react-router-dom'
import theme from './theme'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import ItemList from './pages/ItemList'
import ItemDetail from './pages/ItemDetail'

function App() {{
  return (
    <ThemeProvider theme={{theme}}>
      <CssBaseline />
      <Layout>
        <Routes>
          <Route path="/" element={{<Dashboard />}} />
          <Route path="/items" element={{<ItemList />}} />
          <Route path="/items/:id" element={{<ItemDetail />}} />
        </Routes>
      </Layout>
    </ThemeProvider>
  )
}}

export default App''',

        "src/theme.ts": '''import { createTheme } from '@mui/material/styles'

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
  typography: {
    fontFamily: [
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
  },
})

export default theme''',

        "src/types/index.ts": '''export interface Item {
  id: number
  name: string
  description: string
  created_at: string
  updated_at: string
}

export interface ApiResponse<T> {
  data: T
  message?: string
}''',

        "src/lib/axios.ts": '''import axios from 'axios'

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000',
  headers: {
    'Content-Type': 'application/json',
  },
})

// リクエストインターセプター
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// レスポンスインターセプター
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default apiClient''',

        "src/components/Layout.tsx": f'''import {{ Box, AppBar, Toolbar, Typography, Container, Button }} from '@mui/material'
import {{ Link as RouterLink }} from 'react-router-dom'
import HomeIcon from '@mui/icons-material/Home'
import ListIcon from '@mui/icons-material/List'

interface LayoutProps {{
  children: React.ReactNode
}}

export default function Layout({{ children }}: LayoutProps) {{
  return (
    <Box sx={{{{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}}}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{{{ flexGrow: 1 }}}}>
            {project_name}
          </Typography>
          <Button
            color="inherit"
            component={{RouterLink}}
            to="/"
            startIcon={{<HomeIcon />}}
          >
            ダッシュボード
          </Button>
          <Button
            color="inherit"
            component={{RouterLink}}
            to="/items"
            startIcon={{<ListIcon />}}
          >
            一覧
          </Button>
        </Toolbar>
      </AppBar>

      <Container component="main" sx={{{{ flex: 1, py: 4 }}}}>
        {{children}}
      </Container>

      <Box component="footer" sx={{{{ py: 2, bgcolor: 'background.paper', textAlign: 'center' }}}}>
        <Typography variant="body2" color="text.secondary">
          © 2025 {project_name}. Powered by マザーAI.
        </Typography>
      </Box>
    </Box>
  )
}}''',

        "src/pages/Dashboard.tsx": '''import { Box, Typography, Grid, Card, CardContent, Paper } from '@mui/material'
import DashboardIcon from '@mui/icons-material/Dashboard'

export default function Dashboard() {
  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <DashboardIcon sx={{ fontSize: 40, mr: 2 }} />
        <Typography variant="h4" component="h1">
          ダッシュボード
        </Typography>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                総アイテム数
              </Typography>
              <Typography variant="h3" color="primary">
                42
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                今日の追加
              </Typography>
              <Typography variant="h3" color="secondary">
                5
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                アクティブ
              </Typography>
              <Typography variant="h3" color="success.main">
                38
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              最近のアクティビティ
            </Typography>
            <Typography variant="body2" color="text.secondary">
              アクティビティ履歴がここに表示されます
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  )
}''',

        "src/pages/ItemList.tsx": '''import { useState } from 'react'
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  CircularProgress,
  Alert,
} from '@mui/material'
import { useQuery } from '@tanstack/react-query'
import { Link as RouterLink } from 'react-router-dom'
import AddIcon from '@mui/icons-material/Add'
import apiClient from '../lib/axios'
import type { Item } from '../types'

export default function ItemList() {
  const { data: items, isLoading, error } = useQuery({
    queryKey: ['items'],
    queryFn: async () => {
      const response = await apiClient.get<Item[]>('/api/items')
      return response.data
    },
  })

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    )
  }

  if (error) {
    return (
      <Alert severity="error">
        データの読み込みに失敗しました
      </Alert>
    )
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4" component="h1">
          アイテム一覧
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          component={RouterLink}
          to="/items/new"
        >
          新規作成
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>名前</TableCell>
              <TableCell>説明</TableCell>
              <TableCell>作成日</TableCell>
              <TableCell>操作</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {items?.map((item) => (
              <TableRow key={item.id}>
                <TableCell>{item.id}</TableCell>
                <TableCell>{item.name}</TableCell>
                <TableCell>{item.description}</TableCell>
                <TableCell>
                  {new Date(item.created_at).toLocaleDateString('ja-JP')}
                </TableCell>
                <TableCell>
                  <Button
                    size="small"
                    component={RouterLink}
                    to={`/items/${item.id}`}
                  >
                    詳細
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  )
}''',

        "src/pages/ItemDetail.tsx": '''import { useParams, useNavigate } from 'react-router-dom'
import {
  Box,
  Typography,
  Paper,
  Button,
  CircularProgress,
  Alert,
  Grid,
} from '@mui/material'
import { useQuery } from '@tanstack/react-query'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import apiClient from '../lib/axios'
import type { Item } from '../types'

export default function ItemDetail() {
  const { id } = useParams()
  const navigate = useNavigate()

  const { data: item, isLoading, error } = useQuery({
    queryKey: ['item', id],
    queryFn: async () => {
      const response = await apiClient.get<Item>(`/api/items/${id}`)
      return response.data
    },
    enabled: !!id,
  })

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    )
  }

  if (error || !item) {
    return (
      <Alert severity="error">
        データの読み込みに失敗しました
      </Alert>
    )
  }

  return (
    <Box>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate('/items')}
        sx={{ mb: 3 }}
      >
        一覧に戻る
      </Button>

      <Paper sx={{ p: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          {item.name}
        </Typography>

        <Grid container spacing={2} sx={{ mt: 2 }}>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" color="text.secondary">
              ID
            </Typography>
            <Typography variant="body1">
              {item.id}
            </Typography>
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" color="text.secondary">
              作成日
            </Typography>
            <Typography variant="body1">
              {new Date(item.created_at).toLocaleString('ja-JP')}
            </Typography>
          </Grid>

          <Grid item xs={12}>
            <Typography variant="subtitle2" color="text.secondary">
              説明
            </Typography>
            <Typography variant="body1">
              {item.description}
            </Typography>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  )
}''',

        ".gitignore": '''# Dependencies
node_modules
.pnp
.pnp.js

# Testing
coverage

# Production
dist
build

# Misc
.DS_Store
.env.local
.env.development.local
.env.test.local
.env.production.local

npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Editor
.vscode
.idea
*.swp
*.swo
*~''',

        "README.md": f'''# {project_name} - Frontend

React + TypeScript + MUI で構築されたフロントエンドアプリケーション

## 開発環境

```bash
npm install
npm run dev
```

## ビルド

```bash
npm run build
```

## 技術スタック

- React 18
- TypeScript 5
- MUI v6
- Vite 5
- React Router v6
- TanStack Query (React Query)
- Axios

## 生成元

このコードは「マザーAI」によって自動生成されました。
''',
    }

    return templates


def generate_backend_templates(project_name: str = "My App", features: list = None) -> Dict[str, str]:
    """
    バックエンドテンプレートを生成（FastAPI + SQLAlchemy）
    """
    if features is None:
        features = ["items"]

    safe_name = project_name.lower().replace(" ", "-").replace("_", "-")

    templates = {
        "requirements.txt": '''fastapi==0.115.6
uvicorn[standard]==0.32.1
sqlalchemy==2.0.36
psycopg2-binary==2.9.10
pydantic==2.10.3
pydantic-settings==2.6.1
python-jose[cryptography]==3.3.0
passlib[bcrypt]==1.7.4
python-multipart==0.0.20
alembic==1.14.0''',

        "main.py": f'''from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine, Base
from app.routes import items

# データベーステーブル作成
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="{project_name} API",
    description="FastAPI + SQLAlchemy で構築されたバックエンドAPI",
    version="1.0.0"
)

# CORS設定
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ルート登録
app.include_router(items.router, prefix="/api", tags=["items"])

@app.get("/")
async def root():
    return {{
        "message": "Welcome to {project_name} API",
        "docs": "/docs",
        "health": "/health"
    }}

@app.get("/health")
async def health():
    return {{"status": "healthy"}}
''',

        "app/__init__.py": "",

        "app/database.py": '''from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os

DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://user:password@localhost:5432/myapp"
)

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    """データベースセッションを取得"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
''',

        "app/models.py": '''from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.sql import func
from app.database import Base

class Item(Base):
    """アイテムモデル"""
    __tablename__ = "items"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    description = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
''',

        "app/schemas.py": '''from pydantic import BaseModel
from datetime import datetime

class ItemBase(BaseModel):
    name: str
    description: str | None = None

class ItemCreate(ItemBase):
    pass

class ItemUpdate(ItemBase):
    pass

class Item(ItemBase):
    id: int
    created_at: datetime
    updated_at: datetime | None

    class Config:
        from_attributes = True
''',

        "app/routes/__init__.py": "",

        "app/routes/items.py": '''from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models import Item as ItemModel
from app.schemas import Item, ItemCreate, ItemUpdate

router = APIRouter()

@router.get("/items", response_model=List[Item])
async def get_items(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """アイテム一覧を取得"""
    items = db.query(ItemModel).offset(skip).limit(limit).all()
    return items

@router.get("/items/{item_id}", response_model=Item)
async def get_item(item_id: int, db: Session = Depends(get_db)):
    """特定のアイテムを取得"""
    item = db.query(ItemModel).filter(ItemModel.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    return item

@router.post("/items", response_model=Item)
async def create_item(item: ItemCreate, db: Session = Depends(get_db)):
    """新規アイテムを作成"""
    db_item = ItemModel(**item.model_dump())
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item

@router.put("/items/{item_id}", response_model=Item)
async def update_item(item_id: int, item: ItemUpdate, db: Session = Depends(get_db)):
    """アイテムを更新"""
    db_item = db.query(ItemModel).filter(ItemModel.id == item_id).first()
    if not db_item:
        raise HTTPException(status_code=404, detail="Item not found")

    for key, value in item.model_dump().items():
        setattr(db_item, key, value)

    db.commit()
    db.refresh(db_item)
    return db_item

@router.delete("/items/{item_id}")
async def delete_item(item_id: int, db: Session = Depends(get_db)):
    """アイテムを削除"""
    db_item = db.query(ItemModel).filter(ItemModel.id == item_id).first()
    if not db_item:
        raise HTTPException(status_code=404, detail="Item not found")

    db.delete(db_item)
    db.commit()
    return {"message": "Item deleted successfully"}
''',

        "Dockerfile": '''FROM python:3.12-slim

WORKDIR /app

# 依存関係をインストール
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# アプリケーションコードをコピー
COPY . .

# ポート8000を公開
EXPOSE 8000

# Uvicornでアプリケーションを起動
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
''',

        ".env.example": f'''# Database
DATABASE_URL=postgresql://user:password@localhost:5432/{safe_name}

# Security
SECRET_KEY=your-secret-key-here

# CORS
CORS_ORIGINS=http://localhost:5173,http://localhost:3000
''',

        ".gitignore": '''# Python
__pycache__/
*.py[cod]
*$py.class
*.so
.Python
env/
venv/
ENV/
.venv

# Database
*.db
*.sqlite3

# Environment
.env
.env.local

# Editor
.vscode/
.idea/
*.swp
*.swo
*~

# Alembic
alembic/versions/*.pyc
''',

        "README.md": f'''# {project_name} - Backend

FastAPI + SQLAlchemy + PostgreSQL で構築されたバックエンドAPI

## 開発環境

```bash
pip install -r requirements.txt
uvicorn main:app --reload
```

## データベースマイグレーション

```bash
alembic revision --autogenerate -m "Initial migration"
alembic upgrade head
```

## API ドキュメント

- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## 技術スタック

- FastAPI
- SQLAlchemy 2.0
- PostgreSQL
- Pydantic
- Uvicorn

## 生成元

このコードは「マザーAI」によって自動生成されました。
''',
    }

    return templates


def generate_project_code(project_name: str, user_requirements: str = "") -> Dict[str, Dict[str, str]]:
    """
    プロジェクト全体のコードを生成

    Args:
        project_name: プロジェクト名
        user_requirements: ユーザーの要件（キーワード抽出用）

    Returns:
        {"frontend": {...}, "backend": {...}} 形式の辞書
    """
    # ユーザー要件からフィーチャーを推定（簡易版）
    features = []
    if any(kw in user_requirements.lower() for kw in ["一覧", "リスト", "list"]):
        features.append("list")
    if any(kw in user_requirements.lower() for kw in ["詳細", "detail"]):
        features.append("detail")
    if any(kw in user_requirements.lower() for kw in ["ダッシュボード", "dashboard"]):
        features.append("dashboard")

    # デフォルトのフィーチャー
    if not features:
        features = ["dashboard", "list", "detail"]

    frontend_code = generate_frontend_templates(project_name, features)
    backend_code = generate_backend_templates(project_name, features)

    return {
        "frontend": frontend_code,
        "backend": backend_code
    }
