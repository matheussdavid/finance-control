import { useEffect, useMemo, useState } from 'react'
import { ArrowRight, ArrowRightLeft, CreditCard, PiggyBank, Plus, TrendingDown, TrendingUp, Wallet, type LucideIcon } from 'lucide-react'
import { getDashboard } from '../services/dashboardService'
import { formatApiError } from '../services/api'
import { Message } from '../components/Message'
import { Card } from '../components/ui/Card'
import { EmptyState } from '../components/ui/EmptyState'
import { PageHeader } from '../components/ui/PageHeader'
import { MetricRing } from '../components/ui/MetricRing'
import { formatCurrency, formatRelativeDate } from '../utils/format'
import { invoiceStatusLabels } from '../utils/labels'
import type { Dashboard } from '../types'
import { EmptyCard, EmptyChart, Celebration } from '../components/Illustrations'
import { cn } from '../utils/cn'
import { Button } from '../components/ui/Button'
import { t } from '../i18n'

const now = new Date()

interface HeroMetric {
  icon: LucideIcon
  iconBg: string
  iconColor: string
  label: string
  value: string
  trend?: { value: string; up: boolean }
  ringColor?: 'income' | 'expense' | 'credit' | 'savings' | 'primary'
  ringValue?: number
  ringMax?: number
}

export function DashboardPage() {
  const [month, setMonth] = useState(now.getMonth() + 1)
  const [year, setYear] = useState(now.getFullYear())
  const [dashboard, setDashboard] = useState<Dashboard | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    setError(null)
    getDashboard(month, year)
      .then(setDashboard)
      .catch((err) => setError(formatApiError(err)))
      .finally(() => setLoading(false))
  }, [month, year])

  const metrics = useMemo<HeroMetric[]>(() => {
    if (!dashboard) return []
    const balance = dashboard.totalBalance
    const freeToSpend = balance - dashboard.totalUsedLimit
    const nextInvoiceAmount = dashboard.nextInvoice?.totalAmount ?? 0

    return [
      {
        icon: Wallet,
        iconBg: 'bg-primary-100',
        iconColor: 'text-primary-600',
        label: t('dashboard.totalBalance'),
        value: formatCurrency(balance),
        trend: { value: t('dashboard.vsLastMonth'), up: true },
        ringColor: 'primary',
        ringValue: Math.max(0, balance),
        ringMax: Math.max(1, Math.abs(balance) * 2),
      },
      {
        icon: TrendingUp,
        iconBg: 'bg-income-100',
        iconColor: 'text-income-600',
        label: t('dashboard.freeToSpend'),
        value: formatCurrency(freeToSpend),
        trend: { value: t('dashboard.afterCards'), up: freeToSpend >= 0 },
        ringColor: 'income',
        ringValue: Math.max(0, freeToSpend),
        ringMax: Math.max(1, Math.abs(balance)),
      },
      {
        icon: CreditCard,
        iconBg: 'bg-credit-100',
        iconColor: 'text-credit-600',
        label: t('dashboard.nextInvoice'),
        value: formatCurrency(nextInvoiceAmount),
        trend: dashboard.nextInvoice ? { value: formatRelativeDate(dashboard.nextInvoice.dueDate), up: true } : undefined,
        ringColor: 'credit',
        ringValue: dashboard.totalUsedLimit,
        ringMax: Math.max(1, dashboard.totalCreditLimit),
      },
    ]
  }, [dashboard])

  const topCategories = useMemo(() => {
    if (!dashboard) return []
    return dashboard.expensesByCategory
      .sort((a, b) => b.total - a.total)
      .slice(0, 4)
  }, [dashboard])

  const totalExpenses = useMemo(() => {
    return dashboard?.expensesByCategory.reduce((sum, c) => sum + c.total, 0) ?? 0
  }, [dashboard])

  const budgets = dashboard?.budgets ?? []
  const activeBudgets = budgets.filter((b) => b.amount > 0)

  if (loading) {
    return (
      <div data-testid="dashboard-page" className="animate-fade-in">
        <PageHeader data-testid="dashboard-page-header" title={t('dashboard.title')} subtitle={t('dashboard.loadingSummary')} />
        <div className="grid-hero">
          {[1, 2, 3].map((i) => (
            <Card key={i} data-testid={`dashboard-hero-metric-skeleton-${i}`} className="metric-hero p-8 animate-pulse">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-surfaceHover" />
              <p className="metric-hero-label">{t('dashboard.loading')}</p>
              <p className="metric-hero-value">{t('format.skeletonMoney')}</p>
            </Card>
          ))}
        </div>
        <div className="mt-10 grid-cards">
          {[1, 2].map((i) => (
            <div key={i} data-testid={`dashboard-card-skeleton-${i}`} className="card-padded animate-pulse h-64" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div data-testid="dashboard-page" className="animate-fade-in">
      <PageHeader
        data-testid="dashboard-page-header"
        title={t('dashboard.title')}
        subtitle={t('dashboard.subtitle')}
      >
        <div className="flex items-end gap-3">
          <div>
            <label className="label" htmlFor="dash-month">Mês</label>
            <select
              data-testid="dashboard-month-select"
              id="dash-month"
              className="select w-24"
              value={month}
              onChange={(e) => setMonth(Number(e.target.value))}
            >
              {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                <option key={m} value={m}>{m.toString().padStart(2, '0')}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label" htmlFor="dash-year">Ano</label>
            <select
              data-testid="dashboard-year-select"
              id="dash-year"
              className="select w-28"
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
            >
              {Array.from({ length: 5 }, (_, i) => now.getFullYear() - i).map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
        </div>
      </PageHeader>

      <Message type="error" text={error} />

      {/* Hero Metrics */}
      <section data-testid="dashboard-hero-metrics" className="mb-10" aria-labelledby="hero-metrics-title">
        <h2 id="hero-metrics-title" className="sr-only">{t('dashboard.heroAria')}</h2>
        <div className="grid-hero">
          {metrics.map((metric, index) => (
            <Card
              key={index}
              data-testid={`dashboard-hero-metric-${metric.label.toLowerCase().replace(/\s+/g, '-')}`}
              className="metric-hero p-8 relative overflow-hidden"
              data-stagger={index + 1}
            >
              <div className="absolute top-0 right-0 h-full w-full bg-gradient-to-bl from-primary-50/50 to-transparent" aria-hidden="true" />
              <div className="relative flex flex-col">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className={cn('metric-hero-icon', metric.iconBg)}>
                      <metric.icon size={26} className={metric.iconColor} aria-hidden="true" />
                    </div>
                    <p className="metric-hero-label">{metric.label}</p>
                    <p className="metric-hero-value">{metric.value}</p>
                    {metric.trend && (
                      <p className={cn('metric-hero-trend', metric.trend.up ? 'metric-hero-trend-up' : 'metric-hero-trend-down')}>
                        <TrendingUp size={14} className="shrink-0" aria-hidden="true" />
                        {metric.trend.value}
                      </p>
                    )}
                  </div>
                  {metric.ringColor && metric.ringMax && metric.ringMax > 0 && (
                    <MetricRing
                      data-testid={`dashboard-hero-metric-${metric.label.toLowerCase().replace(/\s+/g, '-')}-ring`}
                      value={metric.ringValue ?? 0}
                      max={metric.ringMax}
                      size={80}
                      strokeWidth={6}
                      color={metric.ringColor}
                    />
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-4">
        {/* Spending by Category */}
        <section data-testid="dashboard-spending-section" className="lg:col-span-2" aria-labelledby="spending-title">
          <Card data-testid="dashboard-spending-card" className="card-padded h-full">
            <div className="flex items-center justify-between mb-6">
              <h3 id="spending-title" className="section-title">{t('dashboard.spendingByCategory')}</h3>
              {topCategories.length > 4 && (
                <Button
                  data-testid="dashboard-spending-view-all"
                  variant="ghost"
                  size="sm"
                  icon={<ArrowRight size={14} />}
                >
                  {t('dashboard.viewAll')}
                </Button>
              )}
            </div>

            {topCategories.length === 0 ? (
              <EmptyState
                icon={EmptyChart}
                title="Nenhum gasto neste período"
                description={t('dashboard.noSpendingDesc')}
              />
            ) : (
              <div className="space-y-5">
                {topCategories.map((item, index) => {
                  const pct = totalExpenses > 0 ? (item.total / totalExpenses) * 100 : 0
                  const colors = [
                    'bg-expense-500',
                    'bg-expense-400',
                    'bg-expense-300',
                    'bg-expense-200',
                  ]
                  return (
                    <div
                      key={item.categoryId}
                      data-testid={`dashboard-spending-category-${item.categoryId}`}
                      className="animate-slide-up"
                      style={{ animationDelay: `${index * 60}ms` }}
                    >
                      <div className="mb-2 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`h-3 w-3 rounded-full ${colors[index % colors.length]}`} aria-hidden="true" />
                          <span className="text-body-md font-medium text-ink">{item.categoryName}</span>
                        </div>
                        <span className="text-body-md font-semibold text-ink tabular-nums">{formatCurrency(item.total)}</span>
                      </div>
                      <div className="h-3 w-full overflow-hidden rounded-full bg-surfaceHover">
                        <div
                          className={cn('h-full rounded-full transition-all duration-700 ease-out', colors[index % colors.length])}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
                {(dashboard?.expensesByCategory.length ?? 0) > 4 && (
                  <p className="text-body-sm text-muted text-center mt-2">
                    {t('dashboard.otherCategories', { n: (dashboard?.expensesByCategory.length ?? 0) - 4 })}
                  </p>
                )}
              </div>
            )}
          </Card>
        </section>

        {/* Next Invoice + Quick Actions */}
        <section data-testid="dashboard-actions-section" className="lg:col-span-2 space-y-6" aria-labelledby="actions-title">
          <Card data-testid="dashboard-next-invoice-card" className="card-padded">
            <h3 id="next-invoice-title" className="section-title mb-4">{t('dashboard.nextInvoice')}</h3>
            {dashboard?.nextInvoice ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-xl bg-credit-50 border border-credit-100">
                  <div>
                    <p className="text-caption-uppercase text-muted">{dashboard.nextInvoice.creditCardName}</p>
                    <p className="text-display-sm text-ink tabular-nums">{formatCurrency(dashboard.nextInvoice.totalAmount)}</p>
                  </div>
                  <span className={cn('badge', dashboard.nextInvoice.status === 'OPEN' ? 'bg-credit-100 text-credit-700' : 'bg-income-100 text-income-700')}>
                    {invoiceStatusLabels[dashboard.nextInvoice.status]}
                  </span>
                </div>
                <div className="grid gap-3 sm:grid-cols-2 text-body-sm">
                  <div className="flex items-center justify-between py-2 border-t border-hairline">
                    <span className="text-muted">{t('dashboard.due')}</span>
                    <span className="font-medium text-ink">{formatRelativeDate(dashboard.nextInvoice.dueDate)}</span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-t border-hairline">
                    <span className="text-muted">{t('dashboard.closing')}</span>
                    <span className="font-medium text-ink">{formatRelativeDate(dashboard.nextInvoice.closingDate)}</span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-t border-hairline">
                    <span className="text-muted">{t('dashboard.reference')}</span>
                    <span className="font-medium text-ink">{formatRelativeDate(dashboard.nextInvoice.referenceMonth)}</span>
                  </div>
                </div>
              </div>
            ) : (
              <EmptyState
                icon={EmptyCard}
                title={t('dashboard.noOpenInvoice')}
                description={t('dashboard.noOpenInvoiceDesc')}
              />
            )}
          </Card>

          <Card data-testid="dashboard-quick-actions-card" className="card-padded">
            <h3 id="actions-title" className="section-title mb-4">{t('dashboard.quickActions')}</h3>
            <div className="grid gap-3 sm:grid-cols-2">
              <button
                data-testid="dashboard-quickaction-expense"
                type="button"
                className="btn-secondary justify-start gap-3 p-4 hover:bg-primary-50 hover:border-primary-200 transition-all"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-expense-100">
                  <TrendingDown size={20} className="text-expense-600" />
                </div>
                <div>
                  <p className="font-medium text-ink">{t('dashboard.addExpense')}</p>
                  <p className="text-caption text-muted">{t('dashboard.quickEntry')}</p>
                </div>
              </button>
              <button
                data-testid="dashboard-quickaction-income"
                type="button"
                className="btn-secondary justify-start gap-3 p-4 hover:bg-primary-50 hover:border-primary-200 transition-all"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-income-100">
                  <TrendingUp size={20} className="text-income-600" />
                </div>
                <div>
                  <p className="font-medium text-ink">{t('dashboard.addIncome')}</p>
                  <p className="text-caption text-muted">{t('dashboard.quickEntry')}</p>
                </div>
              </button>
              <button
                data-testid="dashboard-quickaction-transfer"
                type="button"
                className="btn-secondary justify-start gap-3 p-4 hover:bg-primary-50 hover:border-primary-200 transition-all"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-transfer-100">
                  <ArrowRightLeft size={20} className="text-transfer-600" />
                </div>
                <div>
                  <p className="font-medium text-ink">Transferência</p>
                  <p className="text-caption text-muted">{t('dashboard.betweenAccounts')}</p>
                </div>
              </button>
              <button
                data-testid="dashboard-quickaction-savings"
                type="button"
                className="btn-secondary justify-start gap-3 p-4 hover:bg-primary-50 hover:border-primary-200 transition-all"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-savings-100">
                  <PiggyBank size={20} className="text-savings-600" />
                </div>
                <div>
                  <p className="font-medium text-ink">{t('dashboard.savingsGoal')}</p>
                  <p className="text-caption text-muted">{t('dashboard.savingsTarget')}</p>
                </div>
              </button>
            </div>
          </Card>
        </section>
      </div>

      {/* Budgets Overview */}
      {activeBudgets.length > 0 && (
        <section data-testid="dashboard-budgets-section" className="mt-10" aria-labelledby="budgets-title">
          <div className="flex items-center justify-between mb-6">
            <h2 id="budgets-title" className="section-title">{t('dashboard.budgetsThisMonth')}</h2>
            <Button
              data-testid="dashboard-budgets-view-planning"
              variant="ghost"
              size="sm"
              icon={<ArrowRight size={14} />}
            >
              {t('dashboard.viewPlanning')}
            </Button>
          </div>
          <div className="grid-cards">
            {activeBudgets.slice(0, 3).map((budget) => {
              const pct = budget.amount > 0 ? Math.min(100, (budget.spent / budget.amount) * 100) : 0
              const over = budget.available < 0
              return (
                <Card
                  key={budget.id}
                  data-testid={`dashboard-budget-${budget.categoryId}`}
                  className="card-padded animate-slide-up"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <p className="text-title-sm font-semibold text-ink truncate">{budget.categoryName}</p>
                      <p className="mt-1 text-body-sm text-muted">
                        {t('dashboard.spentOf', { spent: formatCurrency(budget.spent), amount: formatCurrency(budget.amount) })}
                      </p>
                    </div>
                    <MetricRing
                      data-testid={`dashboard-budget-${budget.categoryId}-ring`}
                      value={budget.spent}
                      max={budget.amount}
                      size={64}
                      strokeWidth={5}
                      color={over ? 'expense' : 'savings'}
                      showLabel={false}
                    >
                      <span className={cn('text-title-md font-semibold', over ? 'text-expense-600' : 'text-ink')}>
                        {pct.toFixed(0)}%
                      </span>
                    </MetricRing>
                  </div>
                  <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-surfaceHover">
                    <div
                      className={cn('h-full rounded-full transition-all duration-700 ease-out', over ? 'bg-expense-500' : 'bg-income-500')}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <p className={cn('mt-2 text-caption font-medium', over ? 'text-expense-600' : 'text-income-600')}>
                    {over
                      ? t('dashboard.exceededBy', { amount: formatCurrency(Math.abs(budget.available)) })
                      : t('dashboard.available', { amount: formatCurrency(budget.available) })}
                  </p>
                </Card>
              )
            })}
            {activeBudgets.length > 3 && (
              <Card data-testid="dashboard-budgets-view-more" className="card-padded flex items-center justify-center">
                <Button
                  data-testid="dashboard-budgets-view-more-btn"
                  variant="ghost"
                  icon={<ArrowRight size={16} />}
                  className="w-full justify-center"
                >
                  {activeBudgets.length - 3 === 1
                    ? t('dashboard.viewMoreBudgetsOne')
                    : t('dashboard.viewMoreBudgets', { n: activeBudgets.length - 3 })}
                </Button>
              </Card>
            )}
          </div>
        </section>
      )}

      {/* Empty State Celebration */}
      {!dashboard?.expensesByCategory.length && activeBudgets.length === 0 && !dashboard?.nextInvoice && (
        <section data-testid="dashboard-empty-state" className="mt-16" aria-label={t('dashboard.emptyAria')}>
          <div className="text-center py-12">
            <Celebration className="mx-auto text-primary-600" size={100} />
            <h3 className="mt-6 text-title-lg text-ink">{t('dashboard.allCaughtUp')}</h3>
            <p className="mt-2 text-body-md text-muted max-w-md mx-auto">
              {t('dashboard.allCaughtUpDesc')}
            </p>
            <div className="mt-6 flex items-center justify-center gap-3">
              <Button
                data-testid="dashboard-empty-first-transaction"
                icon={<Plus size={16} />}
              >
                {t('dashboard.firstTransaction')}
              </Button>
              <Button
                data-testid="dashboard-empty-create-savings"
                variant="secondary"
                icon={<PiggyBank size={16} />}
              >
                {t('dashboard.createSavingsGoal')}
              </Button>
            </div>
          </div>
        </section>
      )}
    </div>
  )
}