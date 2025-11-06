// マザーAI - 認証フック

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as authService from '../services/authService';
import { LoginRequest, RegisterRequest } from '../types/api';
import { useNavigate } from 'react-router-dom';

/**
 * ログインフック
 */
export const useLogin = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: ({ email, password }: LoginRequest) => authService.login(email, password),
    onSuccess: (data) => {
      // キャッシュを無効化
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });

      // ユーザーステータスに応じてリダイレクト
      if (data.user.status === 'pending') {
        navigate('/pending');
      } else if (data.user.status === 'approved') {
        navigate('/projects');
      } else {
        navigate('/login');
      }
    },
    onError: (error: any) => {
      console.error('ログインエラー:', error);
    },
  });
};

/**
 * 登録フック
 */
export const useRegister = () => {
  return useMutation({
    mutationFn: (data: RegisterRequest) => authService.register(data),
    onError: (error: any) => {
      console.error('登録エラー:', error);
    },
  });
};

/**
 * ログアウトフック
 */
export const useLogout = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return () => {
    authService.logout();
    queryClient.clear();
    navigate('/login');
  };
};

/**
 * 現在のユーザー情報を取得するフック
 */
export const useCurrentUser = () => {
  return useQuery({
    queryKey: ['currentUser'],
    queryFn: () => authService.getCurrentUser(),
    staleTime: 1000 * 60 * 5, // 5分間キャッシュ
  });
};

/**
 * ログイン状態を確認するフック
 */
export const useIsAuthenticated = () => {
  return authService.isAuthenticated();
};

/**
 * ユーザーが承認済みか確認するフック
 */
export const useIsApproved = () => {
  return authService.isApproved();
};

/**
 * ユーザーが管理者か確認するフック
 */
export const useIsAdmin = () => {
  return authService.isAdmin();
};

/**
 * プロフィール更新フック
 */
export const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { name?: string; custom_claude_api_key?: string }) =>
      authService.updateProfile(data),
    onSuccess: () => {
      // 現在のユーザー情報のキャッシュを無効化
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
    },
    onError: (error: any) => {
      console.error('プロフィール更新エラー:', error);
    },
  });
};
