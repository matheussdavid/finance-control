import { useEffect, useState } from 'react'
import { Plus, Target, TrendingUp, Wallet, ArrowRight } from 'lucide-react'
import { listBudgets, createBudget } from '../services/budgetService'
import { listCategories } from '../services/categoryService'
import { formatApiError } from '../services/api'
import { Message } from '../components/Message'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { FormField } from '../components/ui/FormField'
import { PageHeader } from '../components/ui/PageHeader'
import { MetricRing } from '../components/ui/MetricRing'
import { formatCurrency } from '../utils/format'
import type { Budget, Category } from '../types'
import { EmptyPiggy } from '../components/Illustrations'
import { cn } from '../utils/cn'
import { t } from '../i18n'

export function SavingsPage() {
  const [budgets, setBudgets] = useState<Budget[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ categoryId: '', amount: '', month: new Date().getMonth() + 1, year: new Date().getFullYear() })

  useEffect(() => {
    setLoading(true)
    Promise.all([listBudgets().then(setBudgets), listCategories().then(setCategories)])
      .catch((err) => setError(formatApiError(err)))
      .finally(() => setLoading(false))
  }, [])

  const expenseCategories = categories.filter((c) => c.type === 'EXPENSE' && c.status === 'ACTIVE')
  const activeBudgets = budgets.filter((b) => b.amount > 0)
  const totalBudgeted = activeBudgets.reduce((sum, b) => sum + b.amount, 0)
  const totalSpent = activeBudgets.reduce((sum, b) => sum + b.spent, 0)
  const totalAvailable = activeBudgets.reduce((sum, b) => sum + b.available, 0)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSaving(true)
    try {
      await createBudget({
        categoryId: form.categoryId,
        amount: Number(form.amount),
        month: form.month,
        year: form.year,
      })
      setModalOpen(false)
      setForm({ categoryId: '', amount: '', month: new Date().getMonth() + 1, year: new Date().getFullYear() })
      listBudgets().then(setBudgets)
    } catch (err) {
      setError(formatApiError(err))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div data-testid="savings-page" className="savings-page animate-fade-in">
      <PageHeader
        data-testid="savings-page-header"
        title="Reservas"
        subtitle={t('savings.subtitle')}
      >
        <Button
          data-testid="savings-page-new-btn"
          onClick={() => setModalOpen(true)}
          icon={<Plus size={16} />}
        >
          {t('savings.newGoal')}
        </Button>
      </PageHeader>

      <Message type="error" text={error} />

      {/* Summary Cards */}
      <section data-testid="savings-summary" className="mb-10" aria-labelledby="savings-summary-title">
        <h2 id="savings-summary-title" className="sr-only">{t('savings.summaryAria')}</h2>
        <div className="grid-hero">
          <Card data-testid="savings-summary-budgeted" className="metric-hero p-8" data-stagger="1">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="metric-hero-icon bg-savings-100">
                  <Target size={26} className="text-savings-600" />
                </div>
                <p className="metric-hero-label">{t('savings.totalBudgeted')}</p>
                <p className="metric-hero-value">{formatCurrency(totalBudgeted)}</p>
                <p className="metric-hero-trend metric-hero-trend-up">
                  <TrendingUp size={14} /> {activeBudgets.length === 1 ? t('savings.activeGoalsOne') : t('savings.activeGoals', { n: activeBudgets.length })}
                </p>
              </div>
              <MetricRing
                data-testid="savings-summary-budgeted-ring"
                value={totalSpent}
                max={Math.max(1, totalBudgeted)}
                size={80}
                strokeWidth={6}
                color="savings"
              />
            </div>
          </Card>
          <Card data-testid="savings-summary-spent" className="metric-hero p-8" data-stagger="2">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="metric-hero-icon bg-income-100">
                  <TrendingUp size={26} className="text-income-600" />
                </div>
                <p className="metric-hero-label">{t('savings.alreadySaved')}</p>
                <p className="metric-hero-value">{formatCurrency(totalSpent)}</p>
                <p className="metric-hero-trend metric-hero-trend-up">
                  <TrendingUp size={14} /> {t('savings.percentOfGoal', { n: totalBudgeted > 0 ? Math.round((totalSpent / totalBudgeted) * 100) : 0 })}
                </p>
              </div>
            </div>
          </Card>
          <Card data-testid="savings-summary-available" className="metric-hero p-8" data-stagger="3">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="metric-hero-icon bg-primary-100">
                  <Wallet size={26} className="text-primary-600" />
                </div>
                <p className="metric-hero-label">Disponível</p>
                <p className="metric-hero-value">{formatCurrency(totalAvailable)}</p>
                <p className="metric-hero-trend">{totalAvailable >= 0 ? t('savings.onTrack') : t('savings.attentionNeeded')}</p>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* Budgets List */}
      <section data-testid="savings-list-section" aria-labelledby="savings-list-title">
        <div className="flex items-center justify-between mb-6">
          <h2 id="savings-list-title" className="section-title">{t('savings.yourGoals')}</h2>
          <Button
            data-testid="savings-list-view-planning"
            variant="ghost"
            size="sm"
            icon={<ArrowRight size={14} />}
          >
            {t('savings.viewFullPlanning')}
          </Button>
        </div>

        {loading ? (
          <div data-testid="savings-list-loading" className="grid-cards">
            {[1, 2, 3].map((i) => (
              <div key={i} data-testid={`savings-list-skeleton-${i}`} className="card-padded animate-pulse h-48" />
            ))}
          </div>
        ) : activeBudgets.length === 0 ? (
          <Card data-testid="savings-list-empty-card" className="card-padded text-center py-16">
            <EmptyPiggy data-testid="savings-list-empty-illustration" className="mx-auto text-muted" size={80} />
            <h3 className="mt-6 text-title-lg text-ink">Nenhuma reserva criada</h3>
            <p className="mt-2 text-body-md text-muted max-w-md mx-auto">
              {t('savings.emptyDesc')}
            </p>
            <Button
              data-testid="savings-list-create-first-btn"
              className="mt-6"
              icon={<Plus size={16} />}
              onClick={() => setModalOpen(true)}
            >
              {t('savings.createFirstGoal')}
            </Button>
          </Card>
        ) : (
          <div data-testid="savings-list" className="grid-cards">
            {activeBudgets.map((budget, index) => {
              const pct = budget.amount > 0 ? Math.min(100, (budget.spent / budget.amount) * 100) : 0
              const over = budget.available < 0
              const remaining = budget.amount - budget.spent
              return (
                <div
                  key={budget.id}
                  data-testid={`savings-list-item-${budget.id}`}
                  id={`savings-list-item-${budget.id}`}
                  className="savings-list__item animate-slide-up"
                  style={{ animationDelay: `${index * 60}ms` }}
                >
                  <Card data-testid={`savings-list-item-${budget.id}-card`} className="card-padded">
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <div className="flex-1 min-w-0">
                        <p className="text-title-sm font-semibold text-ink truncate">{budget.categoryName}</p>
                        <p className="mt-1 text-body-sm text-muted">
                          {t('dashboard.spentOf', { spent: formatCurrency(budget.spent), amount: formatCurrency(budget.amount) })}
                        </p>
                      </div>
                      <MetricRing
                        data-testid={`savings-list-item-${budget.id}-ring`}
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
                    <div className="h-2 w-full overflow-hidden rounded-full bg-surfaceHover">
                      <div
                        className={cn('savings-list__item-progress h-full rounded-full transition-all duration-700 ease-out', over ? 'bg-expense-500' : 'bg-income-500')}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <div className="mt-4 flex items-center justify-between">
                      <p className={cn('text-caption font-medium', over ? 'text-expense-600' : 'text-income-600')}>
                        {over
                          ? t('savings.exceededBy', { amount: formatCurrency(Math.abs(budget.available)) })
                          : t('savings.toGoal', { amount: formatCurrency(remaining) })}
                      </p>
                      {over && <span className="badge-expense">{t('savings.attention')}</span>}
                    </div>
                  </Card>
                </div>
              )
            })}
          </div>
        )}
      </section>

      {/* New Budget Modal */}
      {modalOpen && (
        <div
          data-testid="savings-modal"
          className="modal-overlay animate-fade-in"
          onClick={() => setModalOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="new-budget-title"
        >
          <div
            data-testid="savings-modal-content"
            className="modal-content animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-handle" />
            <h2 id="new-budget-title" data-testid="savings-modal-title" className="text-title-lg text-ink mb-6">Nova reserva</h2>
            <form data-testid="savings-modal-form" id="savings-modal-form" onSubmit={handleSubmit}>
              {error && <div data-testid="savings-modal-error" className="mb-4 p-3 rounded-lg bg-expense-50 text-expense-700 text-body-sm" role="alert">{error}</div>}
              <FormField
                data-testid="savings-modal-category-field"
                label={t('common.category')}
                htmlFor="budget-category"
              >
                <select
                  id="budget-category"
                  data-testid="savings-modal-category-select"
                  className="select"
                  value={form.categoryId}
                  onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
                  required
                >
                  <option value="">{t('savings.select')}</option>
                  {expenseCategories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </FormField>
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  data-testid="savings-modal-amount-field"
                  label={t('common.goalValue')}
                  htmlFor="budget-amount"
                >
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted">R$</span>
                    <input
                      id="budget-amount"
                      data-testid="savings-modal-amount-input"
                      type="number"
                      step="0.01"
                      min="0.01"
                      className="input pl-8"
                      value={form.amount}
                      onChange={(e) => setForm({ ...form, amount: e.target.value })}
                      required
                      placeholder={t('common.amountPlaceholder')}
                      inputMode="decimal"
                    />
                  </div>
                </FormField>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  data-testid="savings-modal-month-field"
                  label={t('common.month')}
                  htmlFor="budget-month"
                >
                  <select
                    id="budget-month"
                    data-testid="savings-modal-month-select"
                    className="select"
                    value={form.month}
                    onChange={(e) => setForm({ ...form, month: Number(e.target.value) })}
                  >
                    {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => <option key={m} value={m}>{m.toString().padStart(2, '0')}</option>)}
                  </select>
                </FormField>
                <FormField
                  data-testid="savings-modal-year-field"
                  label={t('common.year')}
                  htmlFor="budget-year"
                >
                  <select
                    id="budget-year"
                    data-testid="savings-modal-year-select"
                    className="select"
                    value={form.year}
                    onChange={(e) => setForm({ ...form, year: Number(e.target.value) })}
                  >
                    {Array.from({ length: 3 }, (_, i) => new Date().getFullYear() + i).map((y) => <option key={y} value={y}>{y}</option>)}
                  </select>
                </FormField>
              </div>
              <div className="mt-6 flex gap-3">
                <Button
                  data-testid="savings-modal-cancel-btn"
                  type="button"
                  variant="secondary"
                  onClick={() => setModalOpen(false)}
                  className="flex-1"
                >
                  {t('savings.cancel')}
                </Button>
                <Button
                  data-testid="savings-modal-submit-btn"
                  type="submit"
                  loading={saving}
                  className="flex-1"
                >
                  {t('savings.createGoal')}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}