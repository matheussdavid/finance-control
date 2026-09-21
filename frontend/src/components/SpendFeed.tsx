import { useMemo } from 'react'
import { MoreHorizontal, TrendingUp, TrendingDown } from 'lucide-react'
import { cn } from '../utils/cn'
import { formatCurrency, formatRelativeDate } from '../utils/format'
import { transactionTypeLabels } from '../utils/labels'
import type { Transaction } from '../types'
import { EmptyState } from './ui/EmptyState'
import { EmptyList } from '../components/Illustrations'
import { t } from '../i18n'

interface SpendFeedProps {
  transactions: Transaction[]
  onEdit?: (transaction: Transaction) => void
  onDelete?: (transaction: Transaction) => void
  loading?: boolean
  emptyTitle?: string
  emptyDescription?: string
}

const typeColorMap: Record<'INCOME' | 'EXPENSE', string> = {
  INCOME: 'text-income-600 bg-income-100',
  EXPENSE: 'text-expense-600 bg-expense-100',
}

const typeAmountColor: Record<'INCOME' | 'EXPENSE', string> = {
  INCOME: 'text-income-600',
  EXPENSE: 'text-expense-600',
}

const typeBadgeClass: Record<'INCOME' | 'EXPENSE', string> = {
  INCOME: 'badge-income',
  EXPENSE: 'badge-expense',
}

export function SpendFeed({
  transactions,
  onEdit,
  onDelete,
  loading,
  emptyTitle = t('spendFeed.noTransactions'),
  emptyDescription = t('spendFeed.emptyDesc'),
}: SpendFeedProps) {
  const grouped = useMemo(() => {
    const groups: Record<string, Transaction[]> = {}
    transactions.forEach((tx) => {
      const dateKey = tx.transactionDate
      if (!groups[dateKey]) groups[dateKey] = []
      groups[dateKey].push(tx)
    })
    return Object.entries(groups)
      .sort(([a], [b]) => b.localeCompare(a))
      .map(([date, items]) => ({
        date,
        items: items.sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
      }))
  }, [transactions])

  if (loading) {
    return (
      <div data-testid="spend-feed-loading" className="spend-feed" role="status" aria-label={t('spendFeed.loading')}>
        {[...Array(5)].map((_, i) => (
          <div key={i} className="spend-feed-item animate-pulse">
            <div className="spend-feed-item-category h-10 w-10 rounded-lg bg-surfaceHover" />
            <div className="spend-feed-item-info flex-1">
              <div className="h-4 w-3/4 bg-surfaceHover rounded" />
              <div className="mt-1 h-3 w-1/2 bg-surfaceHover rounded" />
            </div>
            <div className="h-6 w-24 bg-surfaceHover rounded" />
          </div>
        ))}
      </div>
    )
  }

  if (transactions.length === 0) {
    return (
      <EmptyState
        icon={EmptyList}
        title={emptyTitle}
        description={emptyDescription}
      />
    )
  }

  return (
    <div data-testid="spend-feed" id="spend-feed" className="spend-feed" role="list" aria-label={t('spendFeed.transactionsAria')}>
      {grouped.map(({ date, items }) => (
        <div
          key={date}
          data-testid={`spend-feed-day-${date}`}
          id={`spend-feed-day-${date}`}
          className="spend-feed-day animate-fade-in"
        >
          <div className="spend-feed-day-header">
            <span className="spend-feed-day-divider flex-1" aria-hidden="true" />
            <time data-testid={`spend-feed-day-header-${date}`} dateTime={date}>{formatRelativeDate(date)}</time>
            <span className="spend-feed-day-divider flex-1" aria-hidden="true" />
          </div>
          {items.map((transaction) => (
            <article
              key={transaction.id}
              data-testid={`spend-feed-item-${transaction.id}`}
              id={`spend-feed-item-${transaction.id}`}
              className={cn('spend-feed-item', 'animate-slide-up')}
              role="listitem"
            >
              <div
                data-testid={`spend-feed-item-${transaction.id}-category`}
                className={cn(
                  'spend-feed-item-category flex h-10 w-10 shrink-0 items-center justify-center rounded-lg',
                  typeColorMap[transaction.type] || typeColorMap.EXPENSE
                )}
                aria-hidden="true"
              >
                {(() => {
                  switch (transaction.type) {
                    case 'INCOME': return <TrendingUp size={18} />
                    default: return <TrendingDown size={18} />
                  }
                })()}
              </div>
              <div className="spend-feed-item-info flex-1 min-w-0">
                <h4 data-testid={`spend-feed-item-${transaction.id}-name`} className="spend-feed-item-name">{transaction.description || transaction.categoryName || t('spendFeed.noDescription')}</h4>
                <div className="spend-feed-item-meta">
                  <span data-testid={`spend-feed-item-${transaction.id}-category-name`}>{transaction.categoryName}</span>
                  {transaction.accountName && (
                    <>
                      <span aria-hidden="true">·</span>
                      <span data-testid={`spend-feed-item-${transaction.id}-account-name`}>{transaction.accountName}</span>
                    </>
                  )}
                  <span
                    data-testid={`spend-feed-item-${transaction.id}-type-badge`}
                    className={cn('badge', typeBadgeClass[transaction.type] || 'badge-neutral')}
                  >
                    {transactionTypeLabels[transaction.type]}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span
                  data-testid={`spend-feed-item-${transaction.id}-amount`}
                  className={cn(
                    'spend-feed-item-amount font-semibold tabular-nums',
                    typeAmountColor[transaction.type] || typeAmountColor.EXPENSE
                  )}
                >
                  {transaction.type === 'INCOME' ? '+' : ''}
                  {formatCurrency(transaction.amount)}
                </span>
                {(onEdit || onDelete) && (
                  <div className="relative">
                    <button
                      data-testid={`spend-feed-item-${transaction.id}-menu-btn`}
                      type="button"
                      className="btn-ghost btn-icon p-1.5 rounded-lg text-muted hover:text-ink hover:bg-surfaceHover"
                      aria-label={t('spendFeed.moreOptions')}
                    >
                      <MoreHorizontal size={18} />
                    </button>
                  </div>
                )}
              </div>
            </article>
          ))}
        </div>
      ))}
    </div>
  )
}