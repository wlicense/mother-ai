// マザーAI - プロジェクトフック

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as projectService from '../services/projectService';
import { CreateProjectRequest } from '../types/api';

/**
 * プロジェクト一覧を取得するフック
 */
export const useProjects = () => {
  return useQuery({
    queryKey: ['projects'],
    queryFn: () => projectService.getProjects(),
    staleTime: 1000 * 60 * 2, // 2分間キャッシュ
  });
};

/**
 * プロジェクト詳細を取得するフック
 */
export const useProject = (projectId: string) => {
  return useQuery({
    queryKey: ['project', projectId],
    queryFn: () => projectService.getProject(projectId),
    enabled: !!projectId,
    staleTime: 1000 * 60 * 2, // 2分間キャッシュ
  });
};

/**
 * 新規プロジェクト作成フック
 */
export const useCreateProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateProjectRequest) => projectService.createProject(data),
    onSuccess: () => {
      // プロジェクト一覧のキャッシュを無効化
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
    onError: (error: any) => {
      console.error('プロジェクト作成エラー:', error);
    },
  });
};

/**
 * プロジェクト削除フック
 */
export const useDeleteProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (projectId: string) => projectService.deleteProject(projectId),
    onSuccess: () => {
      // プロジェクト一覧のキャッシュを無効化
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
    onError: (error: any) => {
      console.error('プロジェクト削除エラー:', error);
    },
  });
};

/**
 * メッセージ送信フック（SSEストリーミング）
 */
export const useSendMessage = () => {
  const queryClient = useQueryClient();

  return {
    sendMessage: async (
      projectId: string,
      content: string,
      phase: number,
      onToken: (token: string) => void,
      onEnd: (messageId: string) => void,
      onError: (error: string) => void
    ) => {
      try {
        await projectService.sendMessageStream(
          projectId,
          content,
          phase,
          onToken,
          (messageId) => {
            onEnd(messageId);
            // メッセージ送信完了後、プロジェクト詳細のキャッシュを無効化
            queryClient.invalidateQueries({ queryKey: ['project', projectId] });
          },
          onError
        );
      } catch (error) {
        console.error('メッセージ送信エラー:', error);
        onError('メッセージ送信に失敗しました');
      }
    },
  };
};
