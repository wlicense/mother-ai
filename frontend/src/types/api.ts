// マザーAI - API型定義
// バックエンドAPIのリクエスト/レスポンス型

import {
  User,
  APIUsageSummary,
  Application,
} from './index';

// ================================
// 認証API
// ================================

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  purpose: string;
}

export interface RegisterResponse {
  message: string;
  user_id: string;
}

// ================================
// プロジェクトAPI
// ================================

export interface CreateProjectRequest {
  name: string;
  description: string;
}

export interface ProjectResponse {
  id: string;
  name: string;
  description: string;
  status: string;
  current_phase: number;
  created_at: string;
}

export interface ProjectDetailResponse extends ProjectResponse {
  messages: Array<{
    id: string;
    role: string;
    content: string;
    phase: number;
    created_at: string;
  }>;
}

export interface SendMessageRequest {
  content: string;
  phase: number;
}

// SSEイベント型
export type SSEEventType = 'start' | 'token' | 'end' | 'error';

export interface SSEEvent {
  type: SSEEventType;
  content?: string;
  messageId?: string;
  message?: string;
}

// ================================
// 管理者API
// ================================

export interface ApplicationResponse extends Application {}

export interface ApproveApplicationRequest {
  // 必要に応じて追加
}

export interface RejectApplicationRequest {
  reason: string;
}

export interface UserListResponse {
  users: User[];
  total: number;
}

export interface PhaseStats {
  phase: number;
  total_requests: number;
  total_cost: number;
  total_tokens: number;
}

export interface TodayPhaseStats {
  phase: number;
  requests: number;
  cost: number;
}

export interface CacheStats {
  total_cached_requests: number;
  total_cache_hit_rate: number;
  today_cached_requests: number;
  today_cache_hit_rate: number;
}

export interface APIMonitorStatsResponse {
  total_requests: number;
  total_cost: number;
  total_tokens: number;
  today_requests: number;
  today_cost: number;
  monthly_requests?: number;
  monthly_cost?: number;
  top_users: Array<{
    user_id: string;
    user_name: string;
    total_requests: number;
    total_cost: number;
  }>;
  phase_stats: PhaseStats[];
  today_phase_stats: TodayPhaseStats[];
  cache_stats: CacheStats;
}

// ================================
// ユーザーAPI
// ================================

export interface UpdateUserProfileRequest {
  name?: string;
  custom_claude_api_key?: string;
}

export interface UserAPIUsageResponse {
  daily: APIUsageSummary;
  monthly: APIUsageSummary;
}

// ================================
// エラーレスポンス
// ================================

export interface APIErrorResponse {
  detail: string;
  error?: string;
  code?: string;
  details?: Record<string, any>;
}
