// マザーAI - 型定義（フロントエンド）
// ⚠️ 重要: この型定義はバックエンドと同期を保つこと

// ================================
// ユーザー関連
// ================================

export type UserRole = 'user' | 'admin'
export type UserStatus = 'pending' | 'approved' | 'rejected' | 'suspended'

export interface User {
  id: string
  email: string
  name: string
  role: UserRole
  status: UserStatus
  avatar?: string
  createdAt: string
  updatedAt?: string
}

// ================================
// 申請関連
// ================================

export type ExperienceLevel = 'beginner' | 'html_css' | 'other'
export type ReferralSource = 'sns' | 'search' | 'referral' | 'other'
export type OAuthProvider = 'google' | 'github' | null

export interface Application {
  id: string
  email: string
  name: string
  purpose: string
  experienceLevel: ExperienceLevel
  referralSource?: ReferralSource
  oauthProvider?: OAuthProvider
  status: 'pending' | 'approved' | 'rejected'
  createdAt: string
  reviewedAt?: string
  rejectionReason?: string
}

// ================================
// プロジェクト関連
// ================================

export type PhaseStatus = 'locked' | 'available' | 'in_progress' | 'completed'

export interface PhaseProgress {
  phaseNumber: number
  phaseName: string
  status: PhaseStatus
  startedAt?: string
  completedAt?: string
  progress: number // 0-100
}

export interface Project {
  id: string
  name: string
  description?: string
  ownerId: string
  currentPhase: number
  completedPhases: number[]
  progressPercentage: number
  createdAt: string
  updatedAt: string
  deployedUrl?: string
  phases: PhaseProgress[]
}

// ================================
// チャット関連
// ================================

export type MessageRole = 'user' | 'assistant' | 'system'

export interface ChatMessage {
  id: string
  projectId: string
  phaseNumber: number
  role: MessageRole
  content: string
  createdAt: string
  metadata?: Record<string, any>
}

// ================================
// コード生成関連
// ================================

export type CodeLanguage = 'typescript' | 'python' | 'javascript' | 'html' | 'css' | 'json' | 'markdown'

export interface GeneratedCode {
  id: string
  projectId: string
  phaseNumber: number
  fileName: string
  filePath: string
  language: CodeLanguage
  content: string
  version: number
  createdAt: string
}

// ================================
// API使用量関連
// ================================

export interface APIUsageLog {
  id: string
  userId: string
  projectId: string
  model: string
  inputTokens: number
  outputTokens: number
  cachedTokens: number
  cost: number
  createdAt: string
}

export interface APIUsageSummary {
  userId: string
  totalCost: number
  totalInputTokens: number
  totalOutputTokens: number
  totalRequests: number
  period: string // 'daily' | 'monthly'
  startDate: string
  endDate: string
}

// ================================
// 認証関連
// ================================

export interface AuthResponse {
  user: User
  token: string
  refreshToken: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  email: string
  name: string
  password: string
  purpose: string
  experienceLevel: ExperienceLevel
  referralSource?: ReferralSource
  oauthProvider?: OAuthProvider
}

// ================================
// API レスポンス共通型
// ================================

export interface APIError {
  error: string
  code: string
  details?: Record<string, any>
}

export interface APISuccess<T = any> {
  data: T
  message?: string
}

// ================================
// ページネーション
// ================================

export interface PaginationParams {
  page: number
  limit: number
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

// ================================
// フォーム関連
// ================================

export interface FormErrors {
  [key: string]: string | undefined
}

// ================================
// ダッシュボード統計
// ================================

export interface DashboardStats {
  totalProjects: number
  activeProjects: number
  completedProjects: number
  totalAPIUsage: number
  thisMonthCost: number
}
