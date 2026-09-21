import { apiRequest } from './api'
import type { AuthResponse } from '../types'

export interface RegisterPayload {
  name: string
  username: string
  email: string
  password: string
  confirmPassword: string
}

export interface LoginPayload {
  identifier: string
  password: string
}

export function register(payload: RegisterPayload): Promise<AuthResponse> {
  return apiRequest<AuthResponse>('/auth/register', { method: 'POST', body: payload })
}

export function login(payload: LoginPayload): Promise<AuthResponse> {
  return apiRequest<AuthResponse>('/auth/login', { method: 'POST', body: payload })
}