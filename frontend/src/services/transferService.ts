import { apiRequest } from './api'
import type { Page, Transfer } from '../types'

export interface TransferPayload {
  sourceAccountId: string
  destinationAccountId: string
  amount: number
  transferDate: string
  description?: string
}

export function listTransfers(page = 0, size = 20): Promise<Page<Transfer>> {
  return apiRequest<Page<Transfer>>(`/transfers?page=${page}&size=${size}`)
}

export function createTransfer(payload: TransferPayload): Promise<Transfer> {
  return apiRequest<Transfer>('/transfers', { method: 'POST', body: payload })
}