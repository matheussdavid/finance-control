import { useCallback, useEffect, useState, type FormEvent } from 'react'
import { Pencil, Plus, Power, Tags, TrendingUp, TrendingDown, type LucideIcon } from 'lucide-react'
import { createCategory, deactivateCategory, listCategories, updateCategory } from '../services/categoryService'
import { formatApiError } from '../services/api'
import { Message } from '../components/Message'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { EmptyState } from '../components/ui/EmptyState'
import { FormField } from '../components/ui/FormField'
import { PageHeader } from '../components/ui/PageHeader'
import { categoryTypeLabels, statusBadgeClass, statusLabels } from '../utils/labels'
import type { Category, CategoryType } from '../types'
import { EmptyCategory } from '../components/Illustrations'
import { cn } from '../utils/cn'
import { t } from '../i18n'

const emptyForm = { name: '', type: 'EXPENSE' as CategoryType }

const typeIconMap: Record<CategoryType, LucideIcon> = {
  EXPENSE: TrendingDown,
  INCOME: TrendingUp,
}

const typeColorMap = {
  EXPENSE: 'bg-expense-100 text-expense-600',
  INCOME: 'bg-income-100 text-income-600',
}

const typeBadgeMap = {
  EXPENSE: 'badge-expense',
  INCOME: 'badge-income',
}

export function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [filterType, setFilterType] = useState<'INCOME' | 'EXPENSE' | ''>('')
  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const load = useCallback(() => {
    setLoading(true)
    listCategories(filterType || undefined)
      .then(setCategories)
      .catch((err) => setError(formatApiError(err)))
      .finally(() => setLoading(false))
  }, [filterType])

  useEffect(load, [load])

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setError(null)
    setSuccess(null)
    setSaving(true)
    try {
      if (editingId) {
        await updateCategory(editingId, form)
        setSuccess(t('categories.updated'))
      } else {
        await createCategory(form)
        setSuccess(t('categories.created'))
      }
      setForm(emptyForm)
      setEditingId(null)
      load()
    } catch (err) {
      setError(formatApiError(err))
    } finally {
      setSaving(false)
    }
  }

  function startEdit(category: Category) {
    setEditingId(category.id)
    setForm({ name: category.name, type: category.type })
  }

  async function handleDeactivate(id: string) {
    setError(null)
    setSuccess(null)
    try {
      await deactivateCategory(id)
      setSuccess(t('categories.deactivated'))
      load()
    } catch (err) {
      setError(formatApiError(err))
    }
  }

  const activeCategories = categories.filter((c) => c.status === 'ACTIVE')
  const expenseCategories = activeCategories.filter((c) => c.type === 'EXPENSE').length
  const incomeCategories = activeCategories.filter((c) => c.type === 'INCOME').length

  return (
    <div data-testid="categories-page" className="categories-page animate-fade-in">
      <PageHeader
        data-testid="categories-page-header"
        title={t('categories.title')}
        subtitle={t('categories.subtitle')}
      >
        <Button
          data-testid="categories-page-new-btn"
          onClick={() => { setEditingId(null); setForm(emptyForm); }}
          icon={<Plus size={16} />}
        >
          {t('categories.newCategory')}
        </Button>
      </PageHeader>

      <Message type="error" text={error} />
      <Message type="success" text={success} />

      {/* Summary */}
      <section data-testid="categories-summary" className="mb-6" aria-labelledby="categories-summary-title">
        <h2 id="categories-summary-title" className="sr-only">{t('categories.summaryAria')}</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <Card data-testid="categories-summary-total" className="card-padded text-center">
            <div className="flex h-12 w-12 mx-auto mb-3 items-center justify-center rounded-xl bg-primary-100">
              <Tags size={24} className="text-primary-600" />
            </div>
            <p className="text-caption-uppercase text-muted">{t('categories.totalActive')}</p>
            <p className="text-display-sm text-ink">{activeCategories.length}</p>
          </Card>
          <Card data-testid="categories-summary-expense" className="card-padded text-center">
            <div className="flex h-12 w-12 mx-auto mb-3 items-center justify-center rounded-xl bg-expense-100">
              <TrendingDown size={24} className="text-expense-600" />
            </div>
            <p className="text-caption-uppercase text-muted">{t('common.expenses')}</p>
            <p className="text-display-sm text-ink">{expenseCategories}</p>
          </Card>
          <Card data-testid="categories-summary-income" className="card-padded text-center">
            <div className="flex h-12 w-12 mx-auto mb-3 items-center justify-center rounded-xl bg-income-100">
              <TrendingUp size={24} className="text-income-600" />
            </div>
            <p className="text-caption-uppercase text-muted">{t('common.income')}</p>
            <p className="text-display-sm text-ink">{incomeCategories}</p>
          </Card>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-4">
        {/* Form Panel */}
        <section data-testid="categories-form-section" className="lg:col-span-1" aria-labelledby="categories-form-title">
          <Card data-testid="categories-form-card" className="card-padded h-full sticky top-20">
            <h3 id="categories-form-title" className="section-title mb-6">{editingId ? t('categories.editCategory') : t('categories.newCategory')}</h3>
            <form data-testid="categories-form" id="categories-form" onSubmit={handleSubmit} className="space-y-4">
              <FormField
                data-testid="categories-form-name-field"
                label={t('common.name')}
                htmlFor="category-name"
              >
                <input
                  id="category-name"
                  data-testid="categories-form-name-input"
                  className="input"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                  maxLength={100}
                  placeholder={t('categories.namePlaceholder')}
                  autoFocus
                />
              </FormField>
              <FormField
                data-testid="categories-form-type-field"
                label={t('common.type')}
                htmlFor="category-type"
              >
                <select
                  id="category-type"
                  data-testid="categories-form-type-select"
                  className="select"
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value as CategoryType })}
                >
                  <option value="EXPENSE">{t('common.expense')}</option>
                  <option value="INCOME">{t('common.income')}</option>
                </select>
              </FormField>
              <div className="flex gap-3 pt-2">
                <Button
                  data-testid="categories-form-submit-btn"
                  type="submit"
                  loading={saving}
                  className="flex-1"
                >
                  {editingId ? t('categories.save') : t('categories.createCategory')}
                </Button>
                {editingId && (
                  <Button
                    data-testid="categories-form-cancel-btn"
                    type="button"
                    variant="secondary"
                    onClick={() => { setEditingId(null); setForm(emptyForm); }}
                    className="flex-1"
                  >
                    {t('categories.cancel')}
                  </Button>
                )}
              </div>
            </form>
          </Card>
        </section>

        {/* Categories List */}
        <section data-testid="categories-list-section" className="lg:col-span-3" aria-labelledby="categories-list-title">
          <Card data-testid="categories-list-card" className="card-padded">
            <div className="flex items-center justify-between mb-6">
              <h3 id="categories-list-title" className="section-title">{t('categories.myCategories')}</h3>
              <select
                data-testid="categories-list-filter"
                className="select w-40"
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as 'INCOME' | 'EXPENSE' | '')}
                aria-label={t('categories.filterByType')}
              >
                <option value="">{t('categories.allTypes')}</option>
                <option value="INCOME">{t('common.income')}</option>
                <option value="EXPENSE">{t('common.expense')}</option>
              </select>
            </div>

            {loading ? (
              <div data-testid="categories-list-loading" className="space-y-3" role="status" aria-label={t('categories.loading')}>
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="animate-pulse flex items-center gap-4 p-4 rounded-xl bg-surfaceHover border border-hairline">
                    <div className="h-10 w-10 rounded-lg bg-surfacePressed" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 w-3/4 bg-surfacePressed rounded" />
                      <div className="h-3 w-1/2 bg-surfacePressed rounded" />
                    </div>
                    <div className="h-6 w-20 bg-surfacePressed rounded" />
                  </div>
                ))}
              </div>
            ) : categories.length === 0 ? (
              <EmptyState
                data-testid="categories-list-empty"
                icon={EmptyCategory}
                title={t('categories.emptyTitle')}
                description={t('categories.emptyDesc')}
              />
            ) : (
              <div data-testid="categories-list" className="space-y-3">
                {categories.map((category, index) => {
                  const TypeIcon = typeIconMap[category.type]
                  const isActive = category.status === 'ACTIVE'
                  return (
                    <article
                      key={category.id}
                      data-testid={`categories-list-item-${category.id}`}
                      id={`categories-list-item-${category.id}`}
                      className={cn('categories-list__item flex items-center gap-4 p-4 rounded-xl bg-surface border border-hairline transition-all animate-slide-up', isActive ? 'hover:border-hairlineStrong hover:shadow-card' : 'opacity-60')}
                      style={{ animationDelay: `${index * 40}ms` }}
                    >
                      <div className={cn('categories-list__item-icon flex h-12 w-12 shrink-0 items-center justify-center rounded-lg', typeColorMap[category.type])}>
                        <TypeIcon size={24} />
                      </div>
                      <div className="categories-list__item-info flex-1 min-w-0">
                        <p className={cn('text-body-md font-semibold truncate', isActive ? 'text-ink' : 'text-muted')}>
                          {category.name}
                        </p>
                        <div className="categories-list__item-meta flex items-center gap-3 mt-1">
                          <span className={cn('badge', typeBadgeMap[category.type])}>
                            {categoryTypeLabels[category.type]}
                          </span>
                          <span className={statusBadgeClass(category.status)}>{statusLabels[category.status]}</span>
                        </div>
                      </div>
                      {isActive && (
                        <div className="flex justify-end gap-2">
                          <Button
                            data-testid={`categories-list-item-${category.id}-edit-btn`}
                            variant="secondary"
                            size="sm"
                            icon={<Pencil size={14} />}
                            onClick={() => startEdit(category)}
                          >
                            {t('categories.edit')}
                          </Button>
                          <Button
                            data-testid={`categories-list-item-${category.id}-deactivate-btn`}
                            variant="ghost"
                            size="sm"
                            icon={<Power size={14} />}
                            className="text-expense-600 hover:bg-expense-50 hover:text-expense-700"
                            onClick={() => handleDeactivate(category.id)}
                          >
                            {t('categories.deactivate')}
                          </Button>
                        </div>
                      )}
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