import { apiRequest } from './api'
import type { Page, Transaction } from '../types'

export interface TransactionPayload {
  type: string
  description?: string
  amount: number
  accountId: string
  categoryId: string
  transactionDate: string
}

export interface TransactionFilters {
  type?: string
  accountId?: string
  categoryId?: string
  startDate?: string
  endDate?: string
  page?: number
  size?: number
}

export function listTransactions(filters: TransactionFilters = {}): Promise<Page<Transaction>> {
  const params = new URLSearchParams()
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== '') {
      params.set(key, String(value))
    }
  })
  const query = params.toString()
  return apiRequest<Page<Transaction>>(`/transactions${query ? `?${query}` : ''}`)
}

export function createTransaction(payload: TransactionPayload): Promise<Transaction> {
  return apiRequest<Transaction>('/transactions', { method: 'POST', body: payload })
}