import api from '@/lib/api'
import type { User, LoginCredentials, RegisterData, AuthTokens } from '@/types'

export const authService = {
  async login(credentials: LoginCredentials): Promise<{ user: User; tokens: AuthTokens }> {
    const response = await api.post('/auth/login/', credentials)
    const { access, refresh, username, role, user_id } = response.data

    // Backend returns flat user fields, construct user object
    const user: User = {
      id: user_id,
      username,
      email: '', // Backend doesn't return email on login
      role,
    }

    localStorage.setItem('access_token', access)
    localStorage.setItem('refresh_token', refresh)
    localStorage.setItem('user', JSON.stringify(user))

    return { user, tokens: { access, refresh } }
  },

  async register(data: RegisterData): Promise<{ user: User; tokens: AuthTokens }> {
    // Register the user first
    await api.post('/auth/register/', data)

    // Backend register doesn't return tokens, so login after registering
    return this.login({ username: data.username, password: data.password })
  },

  logout(): void {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    localStorage.removeItem('user')
  },

  getCurrentUser(): User | null {
    const userStr = localStorage.getItem('user')
    if (!userStr) return null
    try {
      return JSON.parse(userStr)
    } catch {
      return null
    }
  },

  isAuthenticated(): boolean {
    return !!localStorage.getItem('access_token')
  },
}
