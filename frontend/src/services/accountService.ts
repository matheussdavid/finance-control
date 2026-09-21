import { apiRequest } from './api'
import type { Account } from '../types'

export interface AccountPayload {
  name: string
  type: string
  initialBalance: number
}

export function listAccounts(): Promise<Account[]> {
  return apiRequest<Account[]>('/accounts')
}

export function createAccount(payload: AccountPayload): Promise<Account> {
  return apiRequest<Account>('/accounts', { method: 'POST', body: payload })
}

export function updateAccount(id: string, payload: { name: string; type: string }): Promise<Account> {
  return apiRequest<Account>(`/accounts/${id}`, { method: 'PUT', body: payload })
}

export function deactivateAccount(id: string): Promise<void> {
  return apiRequest<void>(`/accounts/${id}/deactivate`, { method: 'PATCH' })
}