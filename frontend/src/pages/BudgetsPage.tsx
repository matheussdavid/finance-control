import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react'
import { Pencil, PiggyBank, Target, TrendingUp } from 'lucide-react'
import { createBudget, listBudgets, updateBudget } from '../services/budgetService'
import { listCategories } from '../services/categoryService'
import { formatApiError } from '../services/api'
import { Message } from '../components/Message'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { EmptyState } from '../components/ui/EmptyState'
import { FormField } from '../components/ui/FormField'
import { PageHeader } from '../components/ui/PageHeader'
import { MetricRing } from '../components/ui/MetricRing'
import { formatCurrency } from '../utils/format'
import type { Budget, Category } from '../types'
import { EmptyPiggy } from '../components/Illustrations'
import { cn } from '../utils/cn'
import { t } from '../i18n'

const now = new Date()

export function BudgetsPage() {
  const [budgets, setBudgets] = useState<Budget[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [month, setMonth] = useState(now.getMonth() + 1)
  const [year, setYear] = useState(now.getFullYear())
  const [editingId, setEditingId] = useState<string | null>(null)
  const [amount, setAmount] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const load = useCallback(() => {
    listBudgets(month, year).then(setBudgets).catch((err) => setError(formatApiError(err)))
  }, [month, year])

  useEffect(() => {
    listCategories('EXPENSE').then(setCategories).catch((err) => setError(formatApiError(err)))
  }, [])

  useEffect(load, [load])

  const expenseCategories = useMemo(
    () => categories.filter((category) => category.status === 'ACTIVE'),
    [categories],
  )

  function resetForm() {
    setEditingId(null)
    setAmount('')
    setCategoryId('')
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setError(null)
    setSuccess(null)
    try {
      if (editingId) {
        await updateBudget(editingId, Number(amount))
        setSuccess(t('budgets.updated'))
      } else {
        await createBudget({ categoryId, month, year, amount: Number(amount) })
        setSuccess(t('budgets.created'))
      }
      resetForm()
      load()
    } catch (err) {
      setError(formatApiError(err))
    }
  }

  function startEdit(budget: Budget) {
    setEditingId(budget.id)
    setCategoryId(budget.categoryId)
    setAmount(String(budget.amount))
  }

  const activeBudgets = budgets.filter((b) => b.amount > 0)
  const totalBudgeted = activeBudgets.reduce((sum, b) => sum + b.amount, 0)
  const totalSpent = activeBudgets.reduce((sum, b) => sum + b.spent, 0)
  const totalAvailable = activeBudgets.reduce((sum, b) => sum + b.available, 0)

  return (
    <div data-testid="budgets-page" className="budgets-page animate-fade-in">
      <PageHeader
        data-testid="budgets-page-header"
        title={t('budgets.title')}
        subtitle={t('budgets.subtitle')}
      >
        <div className="flex items-end gap-3">
          <div>
            <label className="label" htmlFor="budget-month">{t('common.month')}</label>
            <select
              data-testid="budgets-page-month-select"
              id="budget-month"
              className="select w-24"
              value={month}
              onChange={(e) => { setMonth(Number(e.target.value)); resetForm(); }}
            >
              {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => <option key={m} value={m}>{m.toString().padStart(2, '0')}</option>)}
            </select>
          </div>
          <div>
            <label className="label" htmlFor="budget-year">{t('common.year')}</label>
            <select
              data-testid="budgets-page-year-select"
              id="budget-year"
              className="select w-28"
              value={year}
              onChange={(e) => { setYear(Number(e.target.value)); resetForm(); }}
            >
              {Array.from({ length: 3 }, (_, i) => now.getFullYear() - i).map((y) => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
        </div>
      </PageHeader>

      <Message type="error" text={error} />
      <Message type="success" text={success} />

      {/* Summary Cards */}
      <section data-testid="budgets-summary" className="mb-6" aria-labelledby="budgets-summary-title">
        <h2 id="budgets-summary-title" className="sr-only">{t('budgets.summaryAria')}</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <Card data-testid="budgets-summary-total" className="metric-hero p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-savings-100">
                <Target size={22} className="text-savings-600" />
              </div>
              <div>
                <p className="text-caption-uppercase text-muted">{t('budgets.totalBudgeted')}</p>
                <p className="text-display-sm text-ink tabular-nums">{formatCurrency(totalBudgeted)}</p>
              </div>
            </div>
            <MetricRing
              data-testid="budgets-summary-total-ring"
              value={totalSpent}
              max={Math.max(1, totalBudgeted)}
              size={56}
              strokeWidth={4}
              color="savings"
              showLabel={false}
            >
              <span className="text-title-sm font-semibold text-ink">{totalBudgeted > 0 ? Math.round((totalSpent / totalBudgeted) * 100) : 0}%</span>
            </MetricRing>
          </Card>
          <Card data-testid="budgets-summary-spent" className="metric-hero p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-income-100">
                <TrendingUp size={22} className="text-income-600" />
              </div>
              <div>
                <p className="text-caption-uppercase text-muted">{t('budgets.actualSpent')}</p>
                <p className="text-display-sm text-ink tabular-nums">{formatCurrency(totalSpent)}</p>
              </div>
            </div>
          </Card>
          <Card data-testid="budgets-summary-available" className="metric-hero p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-100">
                <PiggyBank size={22} className="text-primary-600" />
              </div>
              <div>
                <p className="text-caption-uppercase text-muted">{t('common.available')}</p>
                <p className={cn('text-display-sm tabular-nums', totalAvailable >= 0 ? 'text-income-600' : 'text-expense-600')}>
                  {formatCurrency(totalAvailable)}
                </p>
              </div>
            </div>
          </Card>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-4">
        {/* Form Panel */}
        <section data-testid="budgets-form-section" className="lg:col-span-1" aria-labelledby="budgets-form-title">
          <Card data-testid="budgets-form-card" className="card-padded h-full sticky top-20">
            <h3 id="budgets-form-title" className="section-title mb-6">{editingId ? t('budgets.editBudget') : t('budgets.newBudget')}</h3>
            <form data-testid="budgets-form" id="budgets-form" onSubmit={handleSubmit} className="space-y-4">
              <FormField
                data-testid="budgets-form-category-field"
                label={t('common.category')}
                htmlFor="budget-category"
              >
                <select
                  id="budget-category"
                  data-testid="budgets-form-category-select"
                  className="select"
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  required
                  disabled={Boolean(editingId)}
                >
                  <option value="">{t('budgets.select')}</option>
                  {expenseCategories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
                </select>
              </FormField>
              <FormField
                data-testid="budgets-form-amount-field"
                label={t('common.value')}
                htmlFor="budget-amount"
              >
                <div className="relative"><span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted">R$</span>
                <input
                  id="budget-amount"
                  data-testid="budgets-form-amount-input"
                  type="number"
                  step="0.01"
                  min="0.01"
                  className="input pl-8"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                  placeholder={t('common.amountPlaceholder')} /></div>
              </FormField>
              <div className="flex gap-3 pt-2">
                <Button
                  data-testid="budgets-form-submit-btn"
                  type="submit"
                  className="flex-1"
                >
                  {editingId ? t('budgets.save') : t('budgets.createBudget')}
                </Button>
                {editingId && (
                  <Button
                    data-testid="budgets-form-cancel-btn"
                    type="button"
                    variant="secondary"
                    onClick={resetForm}
                    className="flex-1"
                  >
                    {t('budgets.cancel')}
                  </Button>
                )}
              </div>
            </form>
          </Card>
        </section>

        {/* Budgets List */}
        <section data-testid="budgets-list-section" className="lg:col-span-3" aria-labelledby="budgets-list-title">
          <Card data-testid="budgets-list-card" className="card-padded">
            <h3 id="budgets-list-title" className="section-title mb-6">{t('budgets.budgetsFor', { mm: String(month).padStart(2, '0'), yyyy: year })}</h3>
            {activeBudgets.length === 0 ? (
              <EmptyState
                data-testid="budgets-list-empty"
                icon={EmptyPiggy}
                title={t('budgets.emptyTitle')}
                description={t('budgets.emptyDesc')}
              />
            ) : (
              <div data-testid="budgets-list" className="space-y-3">
                {activeBudgets.map((budget, index) => {
                  const over = budget.available < 0
                  const pct = budget.amount > 0 ? Math.min(100, (budget.spent / budget.amount) * 100) : 0
                  return (
                    <article
                      key={budget.id}
                      data-testid={`budgets-list-item-${budget.id}`}
                      id={`budgets-list-item-${budget.id}`}
                      className={cn('budgets-list__item flex items-center gap-4 p-4 rounded-xl bg-surface border border-hairline transition-all animate-slide-up', 'hover:border-hairlineStrong hover:shadow-card')}
                      style={{ animationDelay: `${index * 40}ms` }}
                    >
                      <div className={cn('budgets-list__item-icon flex h-12 w-12 shrink-0 items-center justify-center rounded-lg', over ? 'bg-expense-100' : 'bg-savings-100')}>
                        <PiggyBank size={24} className={over ? 'text-expense-600' : 'text-savings-600'} />
                      </div>
                      <div className="budgets-list__item-info flex-1 min-w-0">
                        <p className="text-body-md font-semibold text-ink truncate">{budget.categoryName}</p>
                        <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-surfaceHover">
                          <div className={cn('budgets-list__item-progress h-full rounded-full transition-all duration-700 ease-out', over ? 'bg-expense-500' : 'bg-income-500')} style={{ width: `${pct}%` }} />
                        </div>
                        <p className="mt-2 text-body-sm text-muted">{t('budgets.spentOf', { spent: formatCurrency(budget.spent), amount: formatCurrency(budget.amount) })}</p>
                      </div>
                      <div className="budgets-list__item-available text-right">
                        <p className={cn('text-body-md font-semibold tabular-nums', over ? 'text-expense-600' : 'text-income-600')}>
                          {formatCurrency(budget.available)}
                        </p>
                        {over && <span className="badge-expense mt-1 inline-block">{t('budgets.exceeded')}</span>}
                      </div>
                      <Button
                        data-testid={`budgets-list-item-${budget.id}-edit-btn`}
                        variant="secondary"
                        size="sm"
                        icon={<Pencil size={14} />}
                        onClick={() => startEdit(budget)}
                      >
                        {t('budgets.edit')}
                      </Button>
                    </article>
                  )
                })}
              </div>
            )}
          </Card>
        </section>
      </div>
    </div>
  )
}