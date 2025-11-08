import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

// バックエンドAPIのベースURL（CLAUDE.mdポート: 8572）
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8572';

// Axiosインスタンス作成
export const apiClient = axios.create({
  baseURL: `${API_BASE_URL}/api/v1`,
  timeout: 30000, // 30秒（SSEストリーミング考慮）
  headers: {
    'Content-Type': 'application/json',
  },
});

// リクエストインターセプター（JWT自動付与）
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // ローカルストレージからトークンを取得
    const token = localStorage.getItem('auth_token');

    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// レスポンスインターセプター（エラーハンドリング）
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error: AxiosError) => {
    // エラーレスポンスの統一処理
    if (error.response) {
      const status = error.response.status;
      const url = error.config?.url || '';

      // 401 Unauthorized: トークン無効/期限切れ
      // ただし、ログイン/登録エンドポイントは除外（認証エラーを表示するため）
      if (status === 401 && !url.includes('/auth/login') && !url.includes('/auth/register')) {
        // トークンを削除してログイン画面にリダイレクト
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }

      // 403 Forbidden: アクセス権限なし
      if (status === 403) {
        console.error('アクセス権限がありません');
      }

      // 404 Not Found
      if (status === 404) {
        console.error('リソースが見つかりません');
      }

      // 500 Internal Server Error
      if (status === 500) {
        console.error('サーバーエラーが発生しました');
      }
    } else if (error.request) {
      // リクエストは送信されたがレスポンスがない
      console.error('サーバーに接続できません', error.request);
    } else {
      // リクエスト設定時のエラー
      console.error('リクエストエラー', error.message);
    }

    return Promise.reject(error);
  }
);

// SSEストリーミング用のEventSource作成ヘルパー
export const createEventSource = (url: string): EventSource => {
  const token = localStorage.getItem('auth_token');
  const fullUrl = `${API_BASE_URL}/api/v1${url}`;

  // EventSourceはヘッダーを設定できないため、トークンをクエリパラメータで渡す
  // 注: セキュリティ上の理由から、本番環境ではより安全な方法を検討すること
  const urlWithToken = token ? `${fullUrl}?token=${token}` : fullUrl;

  return new EventSource(urlWithToken);
};

export default apiClient;
