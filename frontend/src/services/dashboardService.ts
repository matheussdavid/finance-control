import { apiRequest } from './api'
import type { Dashboard } from '../types'

export function getDashboard(month: number, year: number): Promise<Dashboard> {
  return apiRequest<Dashboard>(`/dashboard?month=${month}&year=${year}`)
}