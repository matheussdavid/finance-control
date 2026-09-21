import { useEffect, useState } from 'react'
import { CreditCard, PiggyBank, TrendingDown, TrendingUp, Wallet } from 'lucide-react'
import { getDashboard } from '../services/dashboardService'
import { listBudgets } from '../services/budgetService'
import { listInvoices } from '../services/invoiceService'
import { formatApiError } from '../services/api'
import { Message } from '../components/Message'
import { Card } from '../components/ui/Card'
import { EmptyState } from '../components/ui/EmptyState'
import { PageHeader } from '../components/ui/PageHeader'
import { MetricRing } from '../components/ui/MetricRing'
import { formatCurrency, formatRelativeDate } from '../utils/format'
import { invoiceStatusLabels } from '../utils/labels'
import type { Dashboard, Budget, Invoice } from '../types'
import { EmptyCard, EmptyChart } from '../components/Illustrations'
import { cn } from '../utils/cn'
import { t } from '../i18n'

const now = new Date()

export function PlanningPage() {
  const [month, setMonth] = useState(now.getMonth() + 1)
  const [year, setYear] = useState(now.getFullYear())
  const [dashboard, setDashboard] = useState<Dashboard | null>(null)
  const [budgets, setBudgets] = useState<Budget[]>([])
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    setError(null)
    Promise.all([
      getDashboard(month, year).then(setDashboard),
      listBudgets().then(setBudgets),
      listInvoices(0, 10).then((res) => setInvoices(res.content)),
    ]).catch((err) => setError(formatApiError(err))).finally(() => setLoading(false))
  }, [month, year])

  const activeBudgets = budgets.filter((b) => b.amount > 0 && b.month === month && b.year === year)
  const totalBudgeted = activeBudgets.reduce((sum, b) => sum + b.amount, 0)
  const totalSpent = activeBudgets.reduce((sum, b) => sum + b.spent, 0)

  const openInvoices = invoices.filter((i) => i.status === 'OPEN')
  const totalOpenInvoices = openInvoices.reduce((sum, i) => sum + i.totalAmount, 0)

  if (loading) {
    return (
      <div data-testid="planning-page" className="animate-fade-in">
        <PageHeader data-testid="planning-page-header" title={t('planning.title')} subtitle="Visão completa do mês" />
        <div className="grid-hero">
          {[1, 2, 3].map((i) => (
            <Card key={i} data-testid={`planning-overview-skeleton-${i}`} className="metric-hero p-8 animate-pulse">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-surfaceHover" />
              <p className="metric-hero-label">{t('planning.loading')}</p>
              <p className="metric-hero-value">{t('format.skeletonMoney')}</p>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div data-testid="planning-page" className="animate-fade-in">
      <PageHeader
        data-testid="planning-page-header"
        title={t('planning.title')}
        subtitle="Visão completa do mês"
      >
        <div className="flex items-end gap-3">
          <div>
            <label className="label" htmlFor="plan-month">Mês</label>
            <select
              data-testid="planning-month-select"
              id="plan-month"
              className="select w-24"
              value={month}
              onChange={(e) => setMonth(Number(e.target.value))}
            >
              {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => <option key={m} value={m}>{m.toString().padStart(2, '0')}</option>)}
            </select>
          </div>
          <div>
            <label className="label" htmlFor="plan-year">Ano</label>
            <select
              data-testid="planning-year-select"
              id="plan-year"
              className="select w-28"
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
            >
              {Array.from({ length: 3 }, (_, i) => now.getFullYear() - i).map((y) => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
        </div>
      </PageHeader>

      <Message type="error" text={error} />

      {/* Overview Cards */}
      <section data-testid="planning-overview" className="mb-10" aria-labelledby="planning-overview-title">
        <h2 id="planning-overview-title" className="sr-only">{t('planning.overviewAria')}</h2>
        <div className="grid-hero">
          <Card
            data-testid="planning-overview-budgeted"
            className="metric-hero p-8"
            data-stagger="1"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="metric-hero-icon bg-savings-100">
                  <PiggyBank size={26} className="text-savings-600" />
                </div>
                <p className="metric-hero-label">{t('planning.budgetedThisMonth')}</p>
                <p className="metric-hero-value">{formatCurrency(totalBudgeted)}</p>
                <p className="metric-hero-trend">{activeBudgets.length === 1 ? t('planning.categoriesOne') : t('planning.categories', { n: activeBudgets.length })}</p>
              </div>
              <MetricRing
                data-testid="planning-overview-budgeted-ring"
                value={totalSpent}
                max={Math.max(1, totalBudgeted)}
                size={80}
                strokeWidth={6}
                color="savings"
              />
            </div>
          </Card>
          <Card
            data-testid="planning-overview-spent"
            className="metric-hero p-8"
            data-stagger="2"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="metric-hero-icon bg-expense-100">
                  <TrendingUp size={26} className="text-expense-600" />
                </div>
                <p className="metric-hero-label">{t('planning.actualSpent')}</p>
                <p className="metric-hero-value">{formatCurrency(totalSpent)}</p>
                <p className="metric-hero-trend metric-hero-trend-up">
                  <TrendingUp size={14} /> {t('planning.percentOfBudget', { n: totalBudgeted > 0 ? Math.round((totalSpent / totalBudgeted) * 100) : 0 })}
                </p>
              </div>
            </div>
          </Card>
          <Card
            data-testid="planning-overview-invoices"
            className="metric-hero p-8"
            data-stagger="3"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="metric-hero-icon bg-credit-100">
                  <CreditCard size={26} className="text-credit-600" />
                </div>
                <p className="metric-hero-label">{t('planning.openInvoices')}</p>
                <p className="metric-hero-value">{formatCurrency(totalOpenInvoices)}</p>
                <p className="metric-hero-trend">{openInvoices.length === 1 ? t('planning.invoicesOne') : t('planning.invoices', { n: openInvoices.length })}</p>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* Budgets Detail + Invoices */}
      <div className="grid gap-6 lg:grid-cols-2">
        <section data-testid="planning-budgets-section" aria-labelledby="budgets-detail-title">
          <div className="flex items-center justify-between mb-6">
            <h2 id="budgets-detail-title" className="section-title">{t('planning.budgetsThisPeriod')}</h2>
          </div>
          <Card data-testid="planning-budgets-card" className="card-padded">
            {activeBudgets.length === 0 ? (
              <EmptyState icon={EmptyChart} title={t('planning.noBudgets')} description={t('planning.noBudgetsDesc')} />
            ) : (
              <div className="space-y-5">
                {activeBudgets.map((budget, index) => {
                  const pct = budget.amount > 0 ? Math.min(100, (budget.spent / budget.amount) * 100) : 0
                  const over = budget.available < 0
                  return (
                    <div
                      key={budget.id}
                      data-testid={`planning-budget-${budget.categoryId}`}
                      className="animate-slide-up"
                      style={{ animationDelay: `${index * 60}ms` }}
                    >
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-body-md font-medium text-ink truncate">{budget.categoryName}</p>
                          <p className="text-body-sm text-muted">{formatCurrency(budget.spent)} / {formatCurrency(budget.amount)}</p>
                        </div>
                        <MetricRing
                          data-testid={`planning-budget-${budget.categoryId}-ring`}
                          value={budget.spent}
                          max={budget.amount}
                          size={56}
                          strokeWidth={4}
                          color={over ? 'expense' : 'savings'}
                          showLabel={false}
                        >
                          <span className={cn('text-title-sm font-semibold', over ? 'text-expense-600' : 'text-ink')}>{pct.toFixed(0)}%</span>
                        </MetricRing>
                      </div>
                      <div className="h-2 w-full overflow-hidden rounded-full bg-surfaceHover">
                        <div className={cn('h-full rounded-full transition-all duration-700 ease-out', over ? 'bg-expense-500' : 'bg-income-500')} style={{ width: `${pct}%` }} />
                      </div>
                      <p className={cn('mt-2 text-caption font-medium', over ? 'text-expense-600' : 'text-income-600')}>
                        {over
                          ? t('planning.exceeded', { amount: formatCurrency(Math.abs(budget.available)) })
                          : t('planning.remaining', { amount: formatCurrency(budget.available) })}
                      </p>
                    </div>
                  )
                })}
              </div>
            )}
          </Card>
        </section>

        <section data-testid="planning-invoices-section" aria-labelledby="invoices-planning-title">
          <div className="flex items-center justify-between mb-6">
            <h2 id="invoices-planning-title" className="section-title">{t('planning.thisMonthInvoices')}</h2>
          </div>
          <Card data-testid="planning-invoices-card" className="card-padded">
            {openInvoices.length === 0 ? (
              <EmptyState icon={EmptyCard} title="Nenhuma fatura em aberto" description={t('planning.noInvoicesDesc')} />
            ) : (
              <div className="space-y-4">
                {openInvoices.map((invoice, index) => (
                  <div
                    key={invoice.id}
                    data-testid={`planning-invoice-${invoice.id}`}
                    className="animate-slide-up p-4 rounded-xl bg-surfaceHover border border-hairline"
                    style={{ animationDelay: `${index * 60}ms` }}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <p className="text-caption-uppercase text-muted">{invoice.creditCardName}</p>
                        <p className="text-display-sm text-ink tabular-nums">{formatCurrency(invoice.totalAmount)}</p>
                      </div>
                      <span className={cn('badge', invoice.status === 'OPEN' ? 'bg-credit-100 text-credit-700' : 'bg-income-100 text-income-700')}>
                        {invoiceStatusLabels[invoice.status]}
                      </span>
                    </div>
                    <div className="grid gap-2 sm:grid-cols-3 text-body-sm">
                      <div className="flex items-center justify-between py-1 border-t border-hairline">
                        <span className="text-muted">{t('planning.due')}</span>
                        <span className="font-medium text-ink">{formatRelativeDate(invoice.dueDate)}</span>
                      </div>
                      <div className="flex items-center justify-between py-1 border-t border-hairline">
                        <span className="text-muted">{t('planning.closing')}</span>
                        <span className="font-medium text-ink">{formatRelativeDate(invoice.closingDate)}</span>
                      </div>
                      <div className="flex items-center justify-between py-1 border-t border-hairline">
                        <span className="text-muted">{t('planning.reference')}</span>
                        <span className="font-medium text-ink">{formatRelativeDate(invoice.referenceMonth)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </section>
      </div>

      {/* Spending Projection */}
      {dashboard && (
        <section data-testid="planning-projection" className="mt-10" aria-labelledby="projection-title">
          <h2 id="projection-title" className="section-title mb-6">{t('planning.projection')}</h2>
          <div className="grid gap-6 lg:grid-cols-3">
            <Card data-testid="planning-projection-income" className="card-padded">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-income-100">
                  <TrendingUp size={20} className="text-income-600" />
                </div>
                <h3 className="text-title-sm text-ink">{t('planning.expectedIncome')}</h3>
              </div>
              <p className="text-display-md text-ink tabular-nums">{formatCurrency(dashboard.income)}</p>
            </Card>
            <Card data-testid="planning-projection-expense" className="card-padded">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-expense-100">
                  <TrendingDown size={20} className="text-expense-600" />
                </div>
                <h3 className="text-title-sm text-ink">{t('planning.expectedExpense')}</h3>
              </div>
              <p className="text-display-md text-ink tabular-nums">{formatCurrency(dashboard.expenses)}</p>
            </Card>
            <Card data-testid="planning-projection-balance" className="card-padded">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-100">
                  <Wallet size={20} className="text-primary-600" />
                </div>
                <h3 className="text-title-sm text-ink">Projected balance</h3>
              </div>
              <p className={cn('text-display-md tabular-nums', dashboard.income - dashboard.expenses >= 0 ? 'text-income-600' : 'text-expense-600')}>
                {formatCurrency(dashboard.income - dashboard.expenses)}
              </p>
            </Card>
          </div>
        </section>
      )}
    </div>
  )
}