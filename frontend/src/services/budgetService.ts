import { apiRequest } from './api'
import type { Budget } from '../types'

export interface BudgetPayload {
  categoryId: string
  month: number
  year: number
  amount: number
}

export function listBudgets(month?: number, year?: number): Promise<Budget[]> {
  const params = new URLSearchParams()
  if (month) params.set('month', String(month))
  if (year) params.set('year', String(year))
  const query = params.toString()
  return apiRequest<Budget[]>(`/budgets${query ? `?${query}` : ''}`)
}

export function createBudget(payload: BudgetPayload): Promise<Budget> {
  return apiRequest<Budget>('/budgets', { method: 'POST', body: payload })
}

export function updateBudget(id: string, amount: number): Promise<Budget> {
  return apiRequest<Budget>(`/budgets/${id}`, { method: 'PUT', body: { amount } })
}