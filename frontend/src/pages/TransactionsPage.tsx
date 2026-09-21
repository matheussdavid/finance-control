import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react'
import { ArrowLeftRight, ArrowRightLeft, ChevronLeft, ChevronRight, Filter, List, Plus } from 'lucide-react'
import { listAccounts } from '../services/accountService'
import { listCategories } from '../services/categoryService'
import { createTransaction, listTransactions, type TransactionFilters } from '../services/transactionService'
import { createTransfer, listTransfers } from '../services/transferService'
import { formatApiError } from '../services/api'
import { Message } from '../components/Message'
import { Button } from '../components/ui/Button'
import { Card, CardHeader } from '../components/ui/Card'
import { EmptyState } from '../components/ui/EmptyState'
import { FormField } from '../components/ui/FormField'
import { PageHeader } from '../components/ui/PageHeader'
import { Spinner } from '../components/ui/Spinner'
import { Table } from '../components/ui/Table'
import { formatCurrency, formatDate, today } from '../utils/format'
import { transactionTypeLabels } from '../utils/labels'
import type { Account, Category, Page, Transaction, TransactionType, Transfer } from '../types'
import { t } from '../i18n'

const emptyTransaction = {
  type: 'EXPENSE' as TransactionType,
  description: '',
  amount: '',
  accountId: '',
  categoryId: '',
  transactionDate: today(),
}

const emptyTransfer = {
  sourceAccountId: '',
  destinationAccountId: '',
  amount: '',
  transferDate: today(),
  description: '',
}

export function TransactionsPage() {
  const [accounts, setAccounts] = useState<Account[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [transactions, setTransactions] = useState<Page<Transaction> | null>(null)
  const [transfers, setTransfers] = useState<Page<Transfer> | null>(null)
  const [filters, setFilters] = useState<TransactionFilters>({ page: 0, size: 10 })
  const [transactionForm, setTransactionForm] = useState(emptyTransaction)
  const [transferForm, setTransferForm] = useState(emptyTransfer)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const loadTransactions = useCallback(() => {
    setLoading(true)
    listTransactions(filters)
      .then(setTransactions)
      .catch((err) => setError(formatApiError(err)))
      .finally(() => setLoading(false))
  }, [filters])

  const loadTransfers = useCallback(() => {
    listTransfers(0, 10)
      .then(setTransfers)
      .catch((err) => setError(formatApiError(err)))
  }, [])

  useEffect(() => {
    listAccounts().then(setAccounts).catch((err) => setError(formatApiError(err)))
    listCategories().then(setCategories).catch((err) => setError(formatApiError(err)))
  }, [])

  useEffect(loadTransactions, [loadTransactions])
  useEffect(loadTransfers, [loadTransfers])

  const activeAccounts = accounts.filter((account) => account.status === 'ACTIVE')
  const transactionCategories = useMemo(
    () => categories.filter((category) => category.type === transactionForm.type && category.status === 'ACTIVE'),
    [categories, transactionForm.type],
  )

  async function handleTransactionSubmit(event: FormEvent) {
    event.preventDefault()
    setError(null)
    setSuccess(null)
    setSaving(true)
    try {
      await createTransaction({
        type: transactionForm.type,
        description: transactionForm.description || undefined,
        amount: Number(transactionForm.amount),
        accountId: transactionForm.accountId,
        categoryId: transactionForm.categoryId,
        transactionDate: transactionForm.transactionDate,
      })
      setSuccess(t('transactions.created'))
      setTransactionForm({ ...emptyTransaction, type: transactionForm.type })
      loadTransactions()
      listAccounts().then(setAccounts)
    } catch (err) {
      setError(formatApiError(err))
    } finally {
      setSaving(false)
    }
  }

  async function handleTransferSubmit(event: FormEvent) {
    event.preventDefault()
    setError(null)
    setSuccess(null)
    setSaving(true)
    try {
      await createTransfer({
        sourceAccountId: transferForm.sourceAccountId,
        destinationAccountId: transferForm.destinationAccountId,
        amount: Number(transferForm.amount),
        transferDate: transferForm.transferDate,
        description: transferForm.description || undefined,
      })
      setSuccess(t('transfers.success'))
      setTransferForm(emptyTransfer)
      loadTransfers()
      listAccounts().then(setAccounts)
    } catch (err) {
      setError(formatApiError(err))
    } finally {
      setSaving(false)
    }
  }

  function changeFilter(key: keyof TransactionFilters, value: string) {
    setFilters({ ...filters, [key]: value, page: 0 })
  }

  return (
    <div>
      <PageHeader title={t('transactions.title')} subtitle={t('transactions.subtitle')} />

      <Message type="error" text={error} />
      <Message type="success" text={success} />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader
            title={t('transactions.newTransaction')}
            icon={
              <div className="flex h-10 w-10 items-center justify-center rounded-control bg-surfaceHover">
                <Plus size={20} className="text-ink" />
              </div>
            }
          />
          <form onSubmit={handleTransactionSubmit} className="p-6">
            <div className="grid gap-x-4 sm:grid-cols-2">
              <FormField label={t('common.type')} htmlFor="tx-type">
                <select
                  id="tx-type"
                  className="input"
                  value={transactionForm.type}
                  onChange={(e) =>
                    setTransactionForm({
                      ...transactionForm,
                      type: e.target.value as TransactionType,
                      categoryId: '',
                    })
                  }
                >
                  <option value="EXPENSE">{t('common.expense')}</option>
                  <option value="INCOME">{t('common.income')}</option>
                </select>
              </FormField>
              <FormField label={t('common.value')} htmlFor="tx-amount">
                <input
                  id="tx-amount"
                  className="input"
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={transactionForm.amount}
                  onChange={(e) => setTransactionForm({ ...transactionForm, amount: e.target.value })}
                  required
                  placeholder={t('common.amountPlaceholder')}
                />
              </FormField>
            </div>
            <FormField label={t('common.description')} htmlFor="tx-description">
              <input
                id="tx-description"
                className="input"
                value={transactionForm.description}
                onChange={(e) => setTransactionForm({ ...transactionForm, description: e.target.value })}
                maxLength={255}
                placeholder={t('common.optional')}
              />
            </FormField>
            <div className="grid gap-x-4 sm:grid-cols-2">
              <FormField label={t('common.account')} htmlFor="tx-account">
                <select
                  id="tx-account"
                  className="input"
                  value={transactionForm.accountId}
                  onChange={(e) => setTransactionForm({ ...transactionForm, accountId: e.target.value })}
                  required
                >
                  <option value="">{t('common.select')}</option>
                  {activeAccounts.map((account) => (
                    <option key={account.id} value={account.id}>
                      {account.name}
                    </option>
                  ))}
                </select>
              </FormField>
              <FormField label={t('common.category')} htmlFor="tx-category">
                <select
                  id="tx-category"
                  className="input"
                  value={transactionForm.categoryId}
                  onChange={(e) => setTransactionForm({ ...transactionForm, categoryId: e.target.value })}
                  required
                >
                  <option value="">{t('common.select')}</option>
                  {transactionCategories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </FormField>
            </div>
            <FormField label={t('common.date')} htmlFor="tx-date">
              <input
                id="tx-date"
                className="input"
                type="date"
                value={transactionForm.transactionDate}
                onChange={(e) => setTransactionForm({ ...transactionForm, transactionDate: e.target.value })}
                required
              />
            </FormField>
            <Button type="submit" loading={saving} icon={<Plus size={16} />}>
              {t('transactions.submit')}
            </Button>
          </form>
        </Card>

        <Card>
          <CardHeader
            title={t('transactions.transferTitle')}
            icon={
              <div className="flex h-10 w-10 items-center justify-center rounded-control bg-brand-mint">
                <ArrowRightLeft size={20} className="text-ink" />
              </div>
            }
          />
          <form onSubmit={handleTransferSubmit} className="p-6">
            <div className="grid gap-x-4 sm:grid-cols-2">
              <FormField label={t('common.sourceAccount')} htmlFor="tr-source">
                <select
                  id="tr-source"
                  className="input"
                  value={transferForm.sourceAccountId}
                  onChange={(e) => setTransferForm({ ...transferForm, sourceAccountId: e.target.value })}
                  required
                >
                  <option value="">{t('common.select')}</option>
                  {activeAccounts.map((account) => (
                    <option key={account.id} value={account.id}>
                      {account.name}
                    </option>
                  ))}
                </select>
              </FormField>
              <FormField label={t('common.destinationAccount')} htmlFor="tr-destination">
                <select
                  id="tr-destination"
                  className="input"
                  value={transferForm.destinationAccountId}
                  onChange={(e) => setTransferForm({ ...transferForm, destinationAccountId: e.target.value })}
                  required
                >
                  <option value="">{t('common.select')}</option>
                  {activeAccounts.map((account) => (
                    <option key={account.id} value={account.id}>
                      {account.name}
                    </option>
                  ))}
                </select>
              </FormField>
            </div>
            <div className="grid gap-x-4 sm:grid-cols-2">
              <FormField label={t('common.value')} htmlFor="tr-amount">
                <input
                  id="tr-amount"
                  className="input"
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={transferForm.amount}
                  onChange={(e) => setTransferForm({ ...transferForm, amount: e.target.value })}
                  required
                  placeholder={t('common.amountPlaceholder')}
                />
              </FormField>
              <FormField label={t('common.date')} htmlFor="tr-date">
                <input
                  id="tr-date"
                  className="input"
                  type="date"
                  value={transferForm.transferDate}
                  onChange={(e) => setTransferForm({ ...transferForm, transferDate: e.target.value })}
                  required
                />
              </FormField>
            </div>
            <FormField label={t('common.description')} htmlFor="tr-description">
              <input
                id="tr-description"
                className="input"
                value={transferForm.description}
                onChange={(e) => setTransferForm({ ...transferForm, description: e.target.value })}
                maxLength={255}
                placeholder={t('common.optional')}
              />
            </FormField>
            <Button type="submit" variant="secondary" loading={saving} icon={<ArrowRightLeft size={16} />}>
              {t('common.transfer')}
            </Button>
          </form>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader
          title={t('transactions.title')}
          icon={
            <div className="flex h-10 w-10 items-center justify-center rounded-control bg-brand-lavender">
              <List size={20} className="text-ink" />
            </div>
          }
        />
        <div className="border-b border-hairline p-6">
          <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-muted">
            <Filter size={16} />
            {t('common.filters')}
          </div>
          <div className="grid gap-x-4 gap-y-3 sm:grid-cols-2 lg:grid-cols-5">
            <div>
              <label className="label" htmlFor="filter-type">
                {t('common.type')}
              </label>
              <select id="filter-type" className="input" value={filters.type ?? ''} onChange={(e) => changeFilter('type', e.target.value)}>
                <option value="">{t('common.allMale')}</option>
                <option value="INCOME">{t('common.income')}</option>
                <option value="EXPENSE">{t('common.expense')}</option>
              </select>
            </div>
            <div>
              <label className="label" htmlFor="filter-account">
                {t('common.account')}
              </label>
              <select
                id="filter-account"
                className="input"
                value={filters.accountId ?? ''}
                onChange={(e) => changeFilter('accountId', e.target.value)}
              >
                <option value="">{t('common.allFemale')}</option>
                {accounts.map((account) => (
                  <option key={account.id} value={account.id}>
                    {account.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label" htmlFor="filter-category">
                {t('common.category')}
              </label>
              <select
                id="filter-category"
                className="input"
                value={filters.categoryId ?? ''}
                onChange={(e) => changeFilter('categoryId', e.target.value)}
              >
                <option value="">{t('common.allFemale')}</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label" htmlFor="filter-start">
                {t('common.startDate')}
              </label>
              <input
                id="filter-start"
                className="input"
                type="date"
                value={filters.startDate ?? ''}
                onChange={(e) => changeFilter('startDate', e.target.value)}
              />
            </div>
            <div>
              <label className="label" htmlFor="filter-end">
                {t('common.endDate')}
              </label>
              <input
                id="filter-end"
                className="input"
                type="date"
                value={filters.endDate ?? ''}
                onChange={(e) => changeFilter('endDate', e.target.value)}
              />
            </div>
          </div>
        </div>

        {loading ? (
          <Spinner />
        ) : !transactions || transactions.content.length === 0 ? (
          <EmptyState
            icon={List}
            title={t('transactions.emptyTitle')}
            description={t('transactions.emptyDesc')}
          />
        ) : (
          <>
            <Table
              head={
                <>
                  <th className="th">{t('common.date')}</th>
                  <th className="th">{t('common.type')}</th>
                  <th className="th">{t('common.description')}</th>
                  <th className="th">{t('common.category')}</th>
                  <th className="th">{t('common.account')}</th>
                  <th className="th text-right">{t('common.value')}</th>
                </>
              }
            >
              {transactions.content.map((transaction) => (
                <tr key={transaction.id} className="transition-colors hover:bg-surfaceHover/50">
                  <td className="td">{formatDate(transaction.transactionDate)}</td>
                  <td className="td">
                    <span className={transaction.type === 'INCOME' ? 'badge-success' : 'badge-danger'}>
                      {transactionTypeLabels[transaction.type]}
                    </span>
                  </td>
                  <td className="td text-ink">{transaction.description || '—'}</td>
                  <td className="td">{transaction.categoryName}</td>
                  <td className="td">{transaction.accountName}</td>
                  <td
                    className={`td text-right font-semibold ${
                      transaction.type === 'INCOME' ? 'text-income-600' : 'text-expense-600'
                    }`}
                  >
                    {transaction.type === 'INCOME' ? '+' : '-'}
                    {formatCurrency(transaction.amount)}
                  </td>
                </tr>
              ))}
            </Table>
            <div className="flex items-center justify-between border-t border-hairline px-5 py-4">
              <Button
                variant="secondary"
                size="sm"
                icon={<ChevronLeft size={14} />}
                disabled={(filters.page ?? 0) <= 0}
                onClick={() => setFilters({ ...filters, page: (filters.page ?? 0) - 1 })}
              >
                {t('common.previous')}
              </Button>
              <span className="text-sm text-muted">
                {t('common.pageOf', { n: (transactions.number ?? 0) + 1, m: Math.max(transactions.totalPages, 1) })}
              </span>
              <Button
                variant="secondary"
                size="sm"
                disabled={(transactions.number ?? 0) + 1 >= transactions.totalPages}
                onClick={() => setFilters({ ...filters, page: (filters.page ?? 0) + 1 })}
              >
                {t('common.next')}
                <ChevronRight size={14} />
              </Button>
            </div>
          </>
        )}
      </Card>

      <Card className="mt-6">
        <CardHeader
          title={t('transfers.recent')}
          icon={
            <div className="flex h-10 w-10 items-center justify-center rounded-control bg-brand-mint">
              <ArrowLeftRight size={20} className="text-ink" />
            </div>
          }
        />
        {!transfers || transfers.content.length === 0 ? (
          <EmptyState
            icon={ArrowLeftRight}
            title={t('transfers.emptyRecords')}
            description={t('transfers.emptyRecordsDesc')}
          />
        ) : (
          <Table
            head={
              <>
                <th className="th">{t('common.date')}</th>
                <th className="th">{t('common.origin')}</th>
                <th className="th">{t('common.destination')}</th>
                <th className="th text-right">{t('common.value')}</th>
                <th className="th">{t('common.description')}</th>
              </>
            }
          >
            {transfers.content.map((transfer) => (
              <tr key={transfer.id} className="transition-colors hover:bg-surfaceHover/50">
                <td className="td">{formatDate(transfer.transferDate)}</td>
                <td className="td">{transfer.sourceAccountName}</td>
                <td className="td">{transfer.destinationAccountName}</td>
                <td className="td text-right font-semibold text-ink">{formatCurrency(transfer.amount)}</td>
                <td className="td">{transfer.description || '—'}</td>
              </tr>
            ))}
          </Table>
        )}
      </Card>
    </div>
  )
}
