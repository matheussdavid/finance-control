import { useCallback, useEffect, useState } from 'react'
import { Plus, ChevronDown, ChevronUp, ChevronLeft, ChevronRight, X, ArrowRightLeft, TrendingUp, TrendingDown } from 'lucide-react'
import { listAccounts } from '../services/accountService'
import { listCategories } from '../services/categoryService'
import { listTransactions, type TransactionFilters } from '../services/transactionService'
import { formatApiError } from '../services/api'
import { Message } from '../components/Message'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { EmptyState } from '../components/ui/EmptyState'
import { PageHeader } from '../components/ui/PageHeader'
import { SpendFeed } from '../components/SpendFeed'
import { QuickCapture } from '../components/QuickCapture'
import type { Account, Category, Page, Transaction } from '../types'
import { EmptyList } from '../components/Illustrations'
import { t } from '../i18n'

export function SpendPage() {
  const [accounts, setAccounts] = useState<Account[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [transactions, setTransactions] = useState<Page<Transaction> | null>(null)
  const [filters, setFilters] = useState<TransactionFilters>({ page: 0, size: 50 })
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [quickCaptureOpen, setQuickCaptureOpen] = useState(false)

  const loadTransactions = useCallback(() => {
    setLoading(true)
    listTransactions(filters)
      .then(setTransactions)
      .catch((err) => setError(formatApiError(err)))
      .finally(() => setLoading(false))
  }, [filters])

  useEffect(() => {
    listAccounts().then(setAccounts).catch((err) => setError(formatApiError(err)))
    listCategories().then(setCategories).catch((err) => setError(formatApiError(err)))
  }, [])

  useEffect(loadTransactions, [loadTransactions])

  const activeAccounts = accounts.filter((account) => account.status === 'ACTIVE')

  function changeFilter(key: keyof TransactionFilters, value: string) {
    setFilters({ ...filters, [key]: value || undefined, page: 0 })
  }

  function clearFilters() {
    setFilters({ page: 0, size: 50 })
  }

  const hasActiveFilters = Boolean(
    filters.type || filters.accountId || filters.categoryId || filters.startDate || filters.endDate
  )

  const handleQuickCaptureSuccess = () => {
    loadTransactions()
    listAccounts().then(setAccounts)
  }

  return (
    <div data-testid="spend-page" className="spend-page animate-fade-in">
      <PageHeader
        data-testid="spend-page-header"
        title={t('spend.title')}
        subtitle={t('spend.subtitle')}
      >
        <div className="flex items-center gap-2">
          <Button
            data-testid="spend-page-filters-toggle"
            variant="secondary"
            size="sm"
            onClick={() => setFiltersOpen(!filtersOpen)}
            icon={filtersOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          >
            {t('spend.filters')} {hasActiveFilters && <span className="badge bg-primary-100 text-primary-700">{Object.values(filters).filter(Boolean).length}</span>}
          </Button>
          <Button
            data-testid="spend-page-new-btn"
            onClick={() => setQuickCaptureOpen(true)}
            icon={<Plus size={16} />}
          >
            {t('spend.new')}
          </Button>
        </div>
      </PageHeader>

      <Message type="error" text={error} />

      {/* Quick Add Bar */}
      <div data-testid="spend-page-quickadd" className="quick-add animate-slide-up">
        <div className="flex flex-wrap gap-3">
          <button
            data-testid="spend-page-quickadd-expense"
            type="button"
            className="quick-add-btn flex-1 min-w-[140px]"
            onClick={() => setQuickCaptureOpen(true)}
          >
            <Plus size={18} className="text-primary-600" />
            <span>{t('quickCapture.title')}</span>
          </button>
          <button
            data-testid="spend-page-quickadd-expense-type"
            type="button"
            className="quick-add-btn flex-1 min-w-[140px]"
            onClick={() => setQuickCaptureOpen(true)}
          >
            <TrendingDown size={18} className="text-expense-600" />
            <span className="text-expense-600">{t('common.expense')}</span>
          </button>
          <button
            data-testid="spend-page-quickadd-income-type"
            type="button"
            className="quick-add-btn flex-1 min-w-[140px]"
            onClick={() => setQuickCaptureOpen(true)}
          >
            <TrendingUp size={18} className="text-income-600" />
            <span className="text-income-600">{t('common.income')}</span>
          </button>
          <button
            data-testid="spend-page-quickadd-transfer-type"
            type="button"
            className="quick-add-btn flex-1 min-w-[140px]"
            onClick={() => setQuickCaptureOpen(true)}
          >
            <ArrowRightLeft size={18} className="text-transfer-600" />
            <span className="text-transfer-600">{t('common.transferNoun')}</span>
          </button>
        </div>
      </div>

      {/* Filters Panel */}
      {filtersOpen && (
        <Card
          data-testid="spend-page-filters-panel"
          className="mb-6 card-padded animate-slide-up"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-title-sm font-semibold text-ink">{t('spend.filters')}</h3>
            {hasActiveFilters && (
              <Button
                data-testid="spend-page-filters-clear"
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                icon={<X size={14} />}
              >
                {t('spend.clear')}
              </Button>
            )}
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <div>
              <label className="label" htmlFor="filter-type">{t('common.type')}</label>
              <select
                data-testid="spend-page-filter-type"
                id="filter-type"
                className="select"
                value={filters.type ?? ''}
                onChange={(e) => changeFilter('type', e.target.value)}
              >
                <option value="">{t('common.allFemale')}</option>
                <option value="INCOME">{t('common.income')}</option>
                <option value="EXPENSE">{t('common.expense')}</option>
                <option value="TRANSFER">{t('common.transferNoun')}</option>
              </select>
            </div>
            <div>
              <label className="label" htmlFor="filter-account">{t('common.account')}</label>
              <select
                data-testid="spend-page-filter-account"
                id="filter-account"
                className="select"
                value={filters.accountId ?? ''}
                onChange={(e) => changeFilter('accountId', e.target.value)}
              >
                <option value="">{t('common.allFemale')}</option>
                {activeAccounts.map((account) => (
                  <option key={account.id} value={account.id}>{account.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label" htmlFor="filter-category">{t('common.category')}</label>
              <select
                data-testid="spend-page-filter-category"
                id="filter-category"
                className="select"
                value={filters.categoryId ?? ''}
                onChange={(e) => changeFilter('categoryId', e.target.value)}
              >
                <option value="">{t('common.allFemale')}</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>{category.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label" htmlFor="filter-start">{t('spend.startDate')}</label>
              <input
                data-testid="spend-page-filter-start"
                id="filter-start"
                type="date"
                className="input"
                value={filters.startDate ?? ''}
                onChange={(e) => changeFilter('startDate', e.target.value)}
              />
            </div>
            <div>
              <label className="label" htmlFor="filter-end">{t('spend.endDate')}</label>
              <input
                data-testid="spend-page-filter-end"
                id="filter-end"
                type="date"
                className="input"
                value={filters.endDate ?? ''}
                onChange={(e) => changeFilter('endDate', e.target.value)}
              />
            </div>
          </div>
        </Card>
      )}

      {/* Transactions Feed */}
      <Card data-testid="spend-page-feed-card" className="card-padded">
        {loading ? (
          <SpendFeed transactions={[]} loading />
        ) : !transactions || transactions.content.length === 0 ? (
          <EmptyState
            icon={EmptyList}
            title={t('spend.emptyTitle')}
            description={t('spend.emptyDesc')}
          />
        ) : (
          <SpendFeed
            transactions={transactions.content}
            loading={false}
          />
        )}

        {transactions && transactions.totalPages > 1 && (
          <div className="mt-6 flex items-center justify-between border-t border-hairline pt-4">
            <Button
              data-testid="spend-page-pagination-prev"
              variant="secondary"
              size="sm"
              icon={<ChevronLeft size={14} />}
              disabled={(filters.page ?? 0) <= 0}
              onClick={() => setFilters({ ...filters, page: (filters.page ?? 0) - 1 })}
            >
              {t('common.previous')}
            </Button>
            <span className="text-body-sm text-muted">
              {t('common.pageOf', { n: (transactions.number ?? 0) + 1, m: Math.max(transactions.totalPages, 1) })}
            </span>
            <Button
              data-testid="spend-page-pagination-next"
              variant="secondary"
              size="sm"
              disabled={(transactions.number ?? 0) + 1 >= transactions.totalPages}
              onClick={() => setFilters({ ...filters, page: (filters.page ?? 0) + 1 })}
            >
              {t('common.next')}
              <ChevronRight size={14} />
            </Button>
          </div>
        )}
      </Card>

      <QuickCapture
        isOpen={quickCaptureOpen}
        onClose={() => setQuickCaptureOpen(false)}
        onSuccess={handleQuickCaptureSuccess}
      />
    </div>
  )
}