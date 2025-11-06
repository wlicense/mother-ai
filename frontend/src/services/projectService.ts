// マザーAI - プロジェクトAPI サービス

import apiClient from '../lib/axios';
import {
  CreateProjectRequest,
  ProjectResponse,
  ProjectDetailResponse,
  SendMessageRequest,
  SSEEvent,
} from '../types/api';

const BASE_PATH = '/api/v1/projects';

/**
 * プロジェクト一覧を取得
 */
export const getProjects = async (): Promise<ProjectResponse[]> => {
  const response = await apiClient.get<ProjectResponse[]>(BASE_PATH);
  return response.data;
};

/**
 * 新規プロジェクトを作成
 */
export const createProject = async (
  data: CreateProjectRequest
): Promise<ProjectResponse> => {
  const response = await apiClient.post<ProjectResponse>(BASE_PATH, data);
  return response.data;
};

/**
 * プロジェクト詳細を取得
 */
export const getProject = async (projectId: string): Promise<ProjectDetailResponse> => {
  const response = await apiClient.get<ProjectDetailResponse>(`${BASE_PATH}/${projectId}`);
  return response.data;
};

/**
 * プロジェクトを削除
 */
export const deleteProject = async (projectId: string): Promise<void> => {
  await apiClient.delete(`${BASE_PATH}/${projectId}`);
};

/**
 * メッセージを送信（SSEストリーミング）
 *
 * @param projectId プロジェクトID
 * @param content メッセージ内容
 * @param phase Phaseナンバー
 * @param onToken トークン受信時のコールバック
 * @param onEnd 完了時のコールバック
 * @param onError エラー時のコールバック
 */
export const sendMessageStream = async (
  projectId: string,
  content: string,
  phase: number,
  onToken: (token: string) => void,
  onEnd: (messageId: string) => void,
  onError: (error: string) => void
): Promise<void> => {
  const backendUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8572';
  const token = localStorage.getItem('auth_token');

  // fetchを使用してSSEストリーミング
  try {
    const response = await fetch(`${backendUrl}${BASE_PATH}/${projectId}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        content,
        phase,
      } as SendMessageRequest),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'メッセージ送信に失敗しました');
    }

    // SSEストリームを読み取り
    const reader = response.body?.getReader();
    const decoder = new TextDecoder();

    if (!reader) {
      throw new Error('ストリームが取得できませんでした');
    }

    while (true) {
      const { done, value } = await reader.read();

      if (done) {
        break;
      }

      // SSEデータをデコード
      const chunk = decoder.decode(value);
      const lines = chunk.split('\n');

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.substring(6);

          try {
            const event: SSEEvent = JSON.parse(data);

            switch (event.type) {
              case 'start':
                // ストリーム開始
                break;

              case 'token':
                // トークン受信
                if (event.content) {
                  onToken(event.content);
                }
                break;

              case 'end':
                // ストリーム完了
                if (event.messageId) {
                  onEnd(event.messageId);
                }
                break;

              case 'error':
                // エラー発生
                if (event.message) {
                  onError(event.message);
                }
                break;
            }
          } catch (parseError) {
            console.error('SSEイベントのパースエラー:', parseError);
          }
        }
      }
    }
  } catch (error) {
    if (error instanceof Error) {
      onError(error.message);
    } else {
      onError('メッセージ送信中にエラーが発生しました');
    }
  }
};

export default {
  getProjects,
  createProject,
  getProject,
  deleteProject,
  sendMessageStream,
};
