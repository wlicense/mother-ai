// マザーAI - 管理者フック

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as adminService from '../services/adminService';

/**
 * 審査待ちの申請一覧を取得するフック
 */
export const usePendingApplications = () => {
  return useQuery({
    queryKey: ['pendingApplications'],
    queryFn: () => adminService.getPendingApplications(),
    staleTime: 1000 * 60 * 1, // 1分間キャッシュ
  });
};

/**
 * 申請承認フック
 */
export const useApproveApplication = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => adminService.approveApplication(id),
    onSuccess: () => {
      // 申請一覧のキャッシュを無効化
      queryClient.invalidateQueries({ queryKey: ['pendingApplications'] });
      queryClient.invalidateQueries({ queryKey: ['allUsers'] });
    },
    onError: (error: any) => {
      console.error('申請承認エラー:', error);
    },
  });
};

/**
 * 申請却下フック
 */
export const useRejectApplication = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      adminService.rejectApplication(id, reason),
    onSuccess: () => {
      // 申請一覧のキャッシュを無効化
      queryClient.invalidateQueries({ queryKey: ['pendingApplications'] });
      queryClient.invalidateQueries({ queryKey: ['allUsers'] });
    },
    onError: (error: any) => {
      console.error('申請却下エラー:', error);
    },
  });
};

/**
 * 全ユーザー一覧を取得するフック
 */
export const useAllUsers = () => {
  return useQuery({
    queryKey: ['allUsers'],
    queryFn: () => adminService.getAllUsers(),
    staleTime: 1000 * 60 * 2, // 2分間キャッシュ
  });
};

/**
 * ユーザー停止フック
 */
export const useSuspendUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) => adminService.suspendUser(userId),
    onSuccess: () => {
      // ユーザー一覧のキャッシュを無効化
      queryClient.invalidateQueries({ queryKey: ['allUsers'] });
    },
    onError: (error: any) => {
      console.error('ユーザー停止エラー:', error);
    },
  });
};

/**
 * ユーザー有効化フック
 */
export const useActivateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) => adminService.activateUser(userId),
    onSuccess: () => {
      // ユーザー一覧のキャッシュを無効化
      queryClient.invalidateQueries({ queryKey: ['allUsers'] });
    },
    onError: (error: any) => {
      console.error('ユーザー有効化エラー:', error);
    },
  });
};

/**
 * API使用統計を取得するフック
 */
export const useAPIStats = () => {
  return useQuery({
    queryKey: ['apiStats'],
    queryFn: () => adminService.getAPIStats(),
    staleTime: 1000 * 60 * 1, // 1分間キャッシュ
    refetchInterval: 1000 * 60 * 5, // 5分ごとに自動更新
  });
};
