// マザーAI - 管理者API サービス

import apiClient from '../lib/axios';
import {
  ApplicationResponse,
  APIMonitorStatsResponse,
} from '../types/api';
import { User } from '../types';

const BASE_PATH = '/api/v1/admin';

/**
 * 審査待ちの申請一覧を取得
 */
export const getPendingApplications = async (): Promise<ApplicationResponse[]> => {
  const response = await apiClient.get<ApplicationResponse[]>(`${BASE_PATH}/applications`);
  return response.data;
};

/**
 * 申請を承認
 */
export const approveApplication = async (id: string): Promise<{ message: string }> => {
  const response = await apiClient.put<{ data: { message: string; userId: string } }>(
    `${BASE_PATH}/applications/${id}/approve`
  );
  return { message: response.data.data.message };
};

/**
 * 申請を却下
 */
export const rejectApplication = async (
  id: string,
  reason: string
): Promise<{ message: string }> => {
  const response = await apiClient.put<{ data: { message: string; userId: string } }>(
    `${BASE_PATH}/applications/${id}/reject`,
    { reason }
  );
  return { message: response.data.data.message };
};

/**
 * 全ユーザー一覧を取得
 */
export const getAllUsers = async (): Promise<User[]> => {
  const response = await apiClient.get<User[]>(`${BASE_PATH}/users`);
  return response.data;
};

/**
 * ユーザーを停止
 */
export const suspendUser = async (userId: string): Promise<{ message: string }> => {
  const response = await apiClient.post<{ message: string }>(
    `${BASE_PATH}/users/${userId}/suspend`
  );
  return response.data;
};

/**
 * ユーザーを有効化
 */
export const activateUser = async (userId: string): Promise<{ message: string }> => {
  const response = await apiClient.post<{ message: string }>(
    `${BASE_PATH}/users/${userId}/activate`
  );
  return response.data;
};

/**
 * API使用統計を取得
 */
export const getAPIStats = async (): Promise<APIMonitorStatsResponse> => {
  const response = await apiClient.get<any>(`${BASE_PATH}/api-stats`);

  // バックエンドのレスポンス形式をそのまま返す（Phase 1-14統計を含む）
  return {
    total_requests: response.data.total_requests || 0,
    total_cost: response.data.total_cost || 0,
    total_tokens: response.data.total_tokens || 0,
    today_requests: response.data.today_requests || 0,
    today_cost: response.data.today_cost || 0,
    monthly_requests: response.data.total_requests, // Placeholder (月次統計は後で実装)
    monthly_cost: response.data.total_cost, // Placeholder
    top_users: response.data.top_users || [],
    phase_stats: response.data.phase_stats || [],
    today_phase_stats: response.data.today_phase_stats || [],
    cache_stats: response.data.cache_stats || {
      total_cached_requests: 0,
      total_cache_hit_rate: 0,
      today_cached_requests: 0,
      today_cache_hit_rate: 0,
    },
  };
};

export default {
  getPendingApplications,
  approveApplication,
  rejectApplication,
  getAllUsers,
  suspendUser,
  activateUser,
  getAPIStats,
};
