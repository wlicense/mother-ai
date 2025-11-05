// モック認証サービス - バックエンド実装前の開発用

export interface MockUser {
  id: string
  email: string
  name: string
  role: 'user' | 'admin'
  status: 'pending' | 'approved' | 'rejected' | 'suspended'
  avatar?: string
}

export interface AuthResponse {
  user: MockUser
  token: string
  refreshToken: string
}

// デモ用のユーザーデータベース
const MOCK_USERS: MockUser[] = [
  {
    id: '1',
    email: 'demo@example.com',
    name: 'デモユーザー',
    role: 'user',
    status: 'approved',
    avatar: '/avatars/user.png',
  },
  {
    id: '2',
    email: 'admin@example.com',
    name: '管理者',
    role: 'admin',
    status: 'approved',
    avatar: '/avatars/admin.png',
  },
  {
    id: '3',
    email: 'pending@example.com',
    name: '審査待ちユーザー',
    role: 'user',
    status: 'pending',
  },
  {
    id: '4',
    email: 'test@motherai.local',
    name: 'テストユーザー',
    role: 'user',
    status: 'approved',
  },
]

// パスワードは全て「demo123」で固定（開発用）
const MOCK_PASSWORD = 'demo123'

// JWTトークン生成（モック）
const generateMockToken = (userId: string): string => {
  const payload = {
    userId,
    iat: Date.now(),
    exp: Date.now() + 24 * 60 * 60 * 1000, // 24時間
  }
  return btoa(JSON.stringify(payload))
}

export class MockAuthService {
  // ログイン
  static async login(email: string, password: string): Promise<AuthResponse> {
    // 実際のAPI呼び出しをシミュレート
    await new Promise((resolve) => setTimeout(resolve, 500))

    const user = MOCK_USERS.find((u) => u.email === email)

    if (!user || password !== MOCK_PASSWORD) {
      throw new Error('メールアドレスまたはパスワードが正しくありません')
    }

    if (user.status === 'suspended') {
      throw new Error('アカウントが停止されています')
    }

    const token = generateMockToken(user.id)
    const refreshToken = generateMockToken(user.id + '_refresh')

    return {
      user,
      token,
      refreshToken,
    }
  }

  // トークンリフレッシュ
  static async refreshToken(refreshToken: string): Promise<AuthResponse> {
    await new Promise((resolve) => setTimeout(resolve, 300))

    try {
      const payload = JSON.parse(atob(refreshToken))
      const userId = payload.userId.replace('_refresh', '')
      const user = MOCK_USERS.find((u) => u.id === userId)

      if (!user) {
        throw new Error('ユーザーが見つかりません')
      }

      const newToken = generateMockToken(user.id)
      const newRefreshToken = generateMockToken(user.id + '_refresh')

      return {
        user,
        token: newToken,
        refreshToken: newRefreshToken,
      }
    } catch (error) {
      throw new Error('トークンの更新に失敗しました')
    }
  }

  // ログアウト
  static async logout(): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 200))
    // ローカルストレージのクリアは呼び出し側で行う
  }

  // 現在のユーザー情報取得
  static async getCurrentUser(token: string): Promise<MockUser> {
    await new Promise((resolve) => setTimeout(resolve, 300))

    try {
      const payload = JSON.parse(atob(token))
      const user = MOCK_USERS.find((u) => u.id === payload.userId)

      if (!user) {
        throw new Error('ユーザーが見つかりません')
      }

      return user
    } catch (error) {
      throw new Error('ユーザー情報の取得に失敗しました')
    }
  }

  // ユーザー登録（申請）
  static async register(data: {
    email: string
    name: string
    password: string
    purpose: string
  }): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 800))

    // 既存のメールアドレスチェック
    const existingUser = MOCK_USERS.find((u) => u.email === data.email)
    if (existingUser) {
      throw new Error('このメールアドレスは既に使用されています')
    }

    // 実際にはバックエンドでDBに保存
    console.log('User registration:', data)
  }

  // パスワードリセット要求
  static async requestPasswordReset(email: string): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 500))

    const user = MOCK_USERS.find((u) => u.email === email)
    if (!user) {
      // セキュリティのため、エラーは返さない
      console.log('Password reset requested for:', email)
    }
  }

  // デモユーザー情報の取得（開発用）
  static getDemoUsers(): MockUser[] {
    return MOCK_USERS.filter((u) => u.status === 'approved')
  }
}
