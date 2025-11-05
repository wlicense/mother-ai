// トークン管理サービス

const TOKEN_KEY = 'auth_token'
const REFRESH_TOKEN_KEY = 'refresh_token'
const USER_KEY = 'user_data'

export class TokenService {
  // トークンの保存
  static setToken(token: string): void {
    localStorage.setItem(TOKEN_KEY, token)
  }

  // トークンの取得
  static getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY)
  }

  // トークンの削除
  static removeToken(): void {
    localStorage.removeItem(TOKEN_KEY)
  }

  // リフレッシュトークンの保存
  static setRefreshToken(refreshToken: string): void {
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken)
  }

  // リフレッシュトークンの取得
  static getRefreshToken(): string | null {
    return localStorage.getItem(REFRESH_TOKEN_KEY)
  }

  // リフレッシュトークンの削除
  static removeRefreshToken(): void {
    localStorage.removeItem(REFRESH_TOKEN_KEY)
  }

  // ユーザー情報の保存
  static setUser(user: any): void {
    localStorage.setItem(USER_KEY, JSON.stringify(user))
  }

  // ユーザー情報の取得
  static getUser(): any | null {
    const userData = localStorage.getItem(USER_KEY)
    if (!userData) return null
    try {
      return JSON.parse(userData)
    } catch (error) {
      console.error('Failed to parse user data:', error)
      return null
    }
  }

  // ユーザー情報の削除
  static removeUser(): void {
    localStorage.removeItem(USER_KEY)
  }

  // 全ての認証情報をクリア
  static clearAll(): void {
    this.removeToken()
    this.removeRefreshToken()
    this.removeUser()
  }

  // トークンのデコード（モック用）
  static decodeToken(token: string): any {
    try {
      const payload = JSON.parse(atob(token))
      return payload
    } catch (error) {
      console.error('Failed to decode token:', error)
      return null
    }
  }

  // トークンの有効期限チェック
  static isTokenExpired(token: string): boolean {
    const decoded = this.decodeToken(token)
    if (!decoded || !decoded.exp) return true

    const currentTime = Date.now()
    return decoded.exp < currentTime
  }

  // トークンが存在するかチェック
  static hasToken(): boolean {
    return !!this.getToken()
  }

  // 認証状態のチェック
  static isAuthenticated(): boolean {
    const token = this.getToken()
    if (!token) return false

    return !this.isTokenExpired(token)
  }
}
