import { apiRequest } from './api'
import type { Page, Purchase } from '../types'

export interface PurchasePayload {
  creditCardId: string
  categoryId: string
  description?: string
  totalAmount: number
  installmentsCount: number
  purchaseDate: string
}

export function listPurchases(page = 0, size = 20): Promise<Page<Purchase>> {
  return apiRequest<Page<Purchase>>(`/purchases?page=${page}&size=${size}`)
}

export function createPurchase(payload: PurchasePayload): Promise<Purchase> {
  return apiRequest<Purchase>('/purchases', { method: 'POST', body: payload })
}