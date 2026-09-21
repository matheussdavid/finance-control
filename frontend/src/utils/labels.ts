import type {
  AccountType,
  CategoryType,
  InstallmentStatus,
  InvoiceStatus,
  Status,
  TransactionType,
} from '../types'
import { t } from '../i18n'

export const accountTypeLabels: Record<AccountType, string> = {
  CHECKING: t('common.accountTypeChecking'),
  SAVINGS: t('common.accountTypeSavings'),
  CASH: t('common.accountTypeCash'),
}

export const statusLabels: Record<Status, string> = {
  ACTIVE: t('common.statusActive'),
  INACTIVE: t('common.statusInactive'),
}

export const categoryTypeLabels: Record<CategoryType, string> = {
  INCOME: t('common.income'),
  EXPENSE: t('common.expense'),
}

export const transactionTypeLabels: Record<TransactionType, string> = {
  INCOME: t('common.income'),
  EXPENSE: t('common.expense'),
}

export const invoiceStatusLabels: Record<InvoiceStatus, string> = {
  OPEN: t('common.invoiceOpen'),
  CLOSED: t('common.invoiceClosed'),
  PAID: t('common.invoicePaid'),
}

export const installmentStatusLabels: Record<InstallmentStatus, string> = {
  OPEN: t('common.installmentOpen'),
  PAID: t('common.installmentPaid'),
}

export function statusBadgeClass(status: Status): string {
  return status === 'ACTIVE' ? 'badge-success' : 'badge-neutral'
}

export function invoiceStatusBadgeClass(status: InvoiceStatus): string {
  switch (status) {
    case 'OPEN':
      return 'badge-info'
    case 'CLOSED':
      return 'badge-warning'
    case 'PAID':
      return 'badge-success'
    default:
      return 'badge-neutral'
  }
}

export function installmentStatusBadgeClass(status: InstallmentStatus): string {
  return status === 'PAID' ? 'badge-success' : 'badge-warning'
}