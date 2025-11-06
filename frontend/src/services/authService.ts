// マザーAI - 認証API サービス

import apiClient from '../lib/axios';
import {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
} from '../types/api';
import { User } from '../types';

/**
 * ログイン
 */
export const login = async (email: string, password: string): Promise<LoginResponse> => {
  const response = await apiClient.post<LoginResponse>('/api/v1/auth/login', {
    email,
    password,
  } as LoginRequest);

  // トークンとユーザー情報をローカルストレージに保存
  const { access_token, user } = response.data;
  localStorage.setItem('auth_token', access_token);
  localStorage.setItem('user', JSON.stringify(user));

  return response.data;
};

/**
 * ユーザー登録（申請）
 */
export const register = async (data: RegisterRequest): Promise<RegisterResponse> => {
  const response = await apiClient.post<RegisterResponse>('/api/v1/auth/register', data);
  return response.data;
};

/**
 * ログアウト
 */
export const logout = (): void => {
  // ローカルストレージからトークンとユーザー情報を削除
  localStorage.removeItem('auth_token');
  localStorage.removeItem('user');
};

/**
 * 現在のユーザー情報を取得
 */
export const getCurrentUser = (): User | null => {
  const userStr = localStorage.getItem('user');
  if (!userStr) {
    return null;
  }

  try {
    return JSON.parse(userStr) as User;
  } catch (error) {
    console.error('ユーザー情報のパースエラー:', error);
    return null;
  }
};

/**
 * ログイン状態を確認
 */
export const isAuthenticated = (): boolean => {
  const token = localStorage.getItem('auth_token');
  return !!token;
};

/**
 * ユーザーが承認済みか確認
 */
export const isApproved = (): boolean => {
  const user = getCurrentUser();
  return user?.status === 'approved';
};

/**
 * ユーザーが管理者か確認
 */
export const isAdmin = (): boolean => {
  const user = getCurrentUser();
  return user?.role === 'admin';
};

/**
 * Google OAuth認証
 */
export const loginWithGoogle = (): void => {
  // バックエンドのGoogle OAuth URLにリダイレクト
  const backendUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8572';
  window.location.href = `${backendUrl}/api/v1/auth/oauth/google`;
};

/**
 * GitHub OAuth認証
 */
export const loginWithGitHub = (): void => {
  // バックエンドのGitHub OAuth URLにリダイレクト
  const backendUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8572';
  window.location.href = `${backendUrl}/api/v1/auth/oauth/github`;
};

/**
 * OAuth コールバック処理
 * URLからトークンを取得してローカルストレージに保存
 */
export const handleOAuthCallback = (token: string): void => {
  localStorage.setItem('auth_token', token);

  // ユーザー情報を取得（必要に応じて実装）
  // 現在はトークンのみ保存
};

/**
 * プロフィール更新
 */
export const updateProfile = async (data: {
  name?: string;
  custom_claude_api_key?: string;
}): Promise<User> => {
  const response = await apiClient.put<{ data: any; message: string }>('/api/v1/users/me', data);

  // ローカルストレージのユーザー情報も更新
  const currentUser = getCurrentUser();
  if (currentUser && response.data.data) {
    const updatedUser = { ...currentUser, ...response.data.data };
    localStorage.setItem('user', JSON.stringify(updatedUser));
    return updatedUser as User;
  }

  return response.data.data as User;
};

export default {
  login,
  register,
  logout,
  getCurrentUser,
  isAuthenticated,
  isApproved,
  isAdmin,
  loginWithGoogle,
  loginWithGitHub,
  handleOAuthCallback,
  updateProfile,
};
