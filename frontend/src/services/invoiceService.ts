import { apiRequest } from './api'
import type { Invoice, InvoiceDetail, Page } from '../types'

export function listInvoices(page = 0, size = 20): Promise<Page<Invoice>> {
  return apiRequest<Page<Invoice>>(`/invoices?page=${page}&size=${size}`)
}

export function getInvoice(id: string): Promise<InvoiceDetail> {
  return apiRequest<InvoiceDetail>(`/invoices/${id}`)
}

export function closeInvoice(id: string): Promise<Invoice> {
  return apiRequest<Invoice>(`/invoices/${id}/close`, { method: 'POST' })
}

export function payInvoice(id: string, accountId: string): Promise<Invoice> {
  return apiRequest<Invoice>(`/invoices/${id}/pay`, { method: 'POST', body: { accountId } })
}