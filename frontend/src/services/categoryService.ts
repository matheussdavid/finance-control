import { apiRequest } from './api'
import type { Category } from '../types'

export interface CategoryPayload {
  name: string
  type: string
}

export function listCategories(type?: string): Promise<Category[]> {
  const query = type ? `?type=${type}` : ''
  return apiRequest<Category[]>(`/categories${query}`)
}

export function createCategory(payload: CategoryPayload): Promise<Category> {
  return apiRequest<Category>('/categories', { method: 'POST', body: payload })
}

export function updateCategory(id: string, payload: CategoryPayload): Promise<Category> {
  return apiRequest<Category>(`/categories/${id}`, { method: 'PUT', body: payload })
}

export function deactivateCategory(id: string): Promise<void> {
  return apiRequest<void>(`/categories/${id}/deactivate`, { method: 'PATCH' })
}