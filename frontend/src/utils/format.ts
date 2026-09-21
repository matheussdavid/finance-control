import { t } from '../i18n'

export function formatCurrency(value: number | null | undefined): string {
  if (value === null || value === undefined) {
    return '-'
  }
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
}

export function formatDate(value: string | null | undefined): string {
  if (!value) {
    return '-'
  }
  const date = new Date(`${value}T00:00:00`)
  return new Intl.DateTimeFormat('pt-BR').format(date)
}

export function formatMonth(value: string | null | undefined): string {
  if (!value) {
    return '-'
  }
  const date = new Date(`${value}T00:00:00`)
  return new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' }).format(date)
}

export function today(): string {
  return new Date().toISOString().slice(0, 10)
}

export function formatRelativeDate(value: string | null | undefined): string {
  if (!value) return '-'
  const date = new Date(`${value}T00:00:00`)
  const now = new Date()
  const diff = Math.floor((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  if (diff === 0) return t('format.today')
  if (diff === 1) return t('format.tomorrow')
  if (diff === -1) return t('format.yesterday')
  if (diff > 1 && diff <= 7) return t('format.inDays', { n: diff })
  if (diff < -1 && diff >= -7) return t('format.daysAgo', { n: Math.abs(diff) })
  return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(date)
}