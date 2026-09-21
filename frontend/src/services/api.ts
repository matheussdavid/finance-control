import type { ApiErrorBody } from '../types'
import { t } from '../i18n'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080'

const TOKEN_KEY = 'finance_control_token'
const USER_KEY = 'finance_control_user'

export class ApiError extends Error {
  status: number
  body: ApiErrorBody | null

  constructor(status: number, body: ApiErrorBody | null) {
    super(body?.message ?? t('api.requestFailed', { status }))
    this.status = status
    this.body = body
  }
}

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token)
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
}

export function setStoredUser(user: unknown): void {
  localStorage.setItem(USER_KEY, JSON.stringify(user))
}

export function getStoredUser<T>(): T | null {
  const raw = localStorage.getItem(USER_KEY)
  return raw ? (JSON.parse(raw) as T) : null
}

interface RequestOptions {
  method?: string
  body?: unknown
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const headers: Record<string, string> = {}
  const token = getToken()
  if (token) {
    headers.Authorization = `Bearer ${token}`
  }
  if (options.body !== undefined) {
    headers['Content-Type'] = 'application/json'
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: options.method ?? 'GET',
    headers,
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
  })

  if (response.status === 401 && !path.startsWith('/auth')) {
    clearToken()
    window.location.href = '/login'
    throw new ApiError(401, null)
  }

  if (!response.ok) {
    let body: ApiErrorBody | null = null
    try {
      body = (await response.json()) as ApiErrorBody
    } catch {
      body = null
    }
    throw new ApiError(response.status, body)
  }

  if (response.status === 204) {
    return undefined as T
  }

  return (await response.json()) as T
}

export function formatApiError(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.body?.fields) {
      const fieldMessages = Object.entries(error.body.fields)
        .map(([field, message]) => `${field}: ${message}`)
        .join('; ')
      return `${error.body.message} (${fieldMessages})`
    }
    return error.body?.message ?? error.message
  }
  return error instanceof Error ? error.message : t('api.unexpectedError')
}
