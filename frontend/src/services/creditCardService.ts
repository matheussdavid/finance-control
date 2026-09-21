import { apiRequest } from './api'
import type { CreditCard } from '../types'

export interface CreditCardPayload {
  name: string
  creditLimit: number
  closingDay: number
  dueDay: number
}

export function listCreditCards(): Promise<CreditCard[]> {
  return apiRequest<CreditCard[]>('/credit-cards')
}

export function createCreditCard(payload: CreditCardPayload): Promise<CreditCard> {
  return apiRequest<CreditCard>('/credit-cards', { method: 'POST', body: payload })
}

export function updateCreditCard(id: string, payload: CreditCardPayload): Promise<CreditCard> {
  return apiRequest<CreditCard>(`/credit-cards/${id}`, { method: 'PUT', body: payload })
}

export function deactivateCreditCard(id: string): Promise<void> {
  return apiRequest<void>(`/credit-cards/${id}/deactivate`, { method: 'PATCH' })
}