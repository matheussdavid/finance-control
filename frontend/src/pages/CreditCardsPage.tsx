import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react'
import { CreditCard, Pencil, Plus, Power, ShoppingCart, TrendingDown, TrendingUp } from 'lucide-react'
import {
  createCreditCard,
  deactivateCreditCard,
  listCreditCards,
  updateCreditCard,
} from '../services/creditCardService'
import { listCategories } from '../services/categoryService'
import { createPurchase, listPurchases } from '../services/purchaseService'
import { formatApiError } from '../services/api'
import { Message } from '../components/Message'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { EmptyState } from '../components/ui/EmptyState'
import { FormField } from '../components/ui/FormField'
import { PageHeader } from '../components/ui/PageHeader'
import { MetricRing } from '../components/ui/MetricRing'
import { formatCurrency, today } from '../utils/format'
import { statusBadgeClass, statusLabels } from '../utils/labels'
import type { Category, CreditCard as CreditCardType, Page, Purchase } from '../types'
import { EmptyCard } from '../components/Illustrations'
import { cn } from '../utils/cn'
import { t } from '../i18n'

const emptyCard = { name: '', creditLimit: '', closingDay: '10', dueDay: '15' }
const emptyPurchase = {
  creditCardId: '',
  categoryId: '',
  description: '',
  totalAmount: '',
  installmentsCount: '1',
  purchaseDate: today(),
}

export function CreditCardsPage() {
  const [cards, setCards] = useState<CreditCardType[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [purchases, setPurchases] = useState<Page<Purchase> | null>(null)
  const [cardForm, setCardForm] = useState(emptyCard)
  const [purchaseForm, setPurchaseForm] = useState(emptyPurchase)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const loadCards = useCallback(() => {
    listCreditCards().then(setCards).catch((err) => setError(formatApiError(err)))
  }, [])

  const loadPurchases = useCallback(() => {
    listPurchases(0, 10).then(setPurchases).catch((err) => setError(formatApiError(err)))
  }, [])

  useEffect(() => {
    loadCards()
    loadPurchases()
    listCategories('EXPENSE').then(setCategories).catch((err) => setError(formatApiError(err)))
  }, [loadCards, loadPurchases])

  const activeCards = cards.filter((card) => card.status === 'ACTIVE')
  const expenseCategories = useMemo(
    () => categories.filter((category) => category.status === 'ACTIVE'),
    [categories],
  )

  const installmentPreview = useMemo(() => {
    const amount = Number(purchaseForm.totalAmount)
    const count = Number(purchaseForm.installmentsCount)
    if (!amount || !count || count < 1) return null
    return amount / count
  }, [purchaseForm.totalAmount, purchaseForm.installmentsCount])

  const totalLimit = activeCards.reduce((sum, c) => sum + c.creditLimit, 0)
  const totalUsed = activeCards.reduce((sum, c) => sum + c.usedLimit, 0)
  const totalAvailable = activeCards.reduce((sum, c) => sum + c.availableLimit, 0)

  async function handleCardSubmit(event: FormEvent) {
    event.preventDefault()
    setError(null)
    setSuccess(null)
    const payload = {
      name: cardForm.name,
      creditLimit: Number(cardForm.creditLimit),
      closingDay: Number(cardForm.closingDay),
      dueDay: Number(cardForm.dueDay),
    }
    try {
      if (editingId) {
        await updateCreditCard(editingId, payload)
        setSuccess(t('cards.cardUpdated'))
      } else {
        await createCreditCard(payload)
        setSuccess(t('cards.cardCreated'))
      }
      setCardForm(emptyCard)
      setEditingId(null)
      loadCards()
    } catch (err) {
      setError(formatApiError(err))
    }
  }

  async function handlePurchaseSubmit(event: FormEvent) {
    event.preventDefault()
    setError(null)
    setSuccess(null)
    try {
      const purchase = await createPurchase({
        creditCardId: purchaseForm.creditCardId,
        categoryId: purchaseForm.categoryId,
        description: purchaseForm.description || undefined,
        totalAmount: Number(purchaseForm.totalAmount),
        installmentsCount: Number(purchaseForm.installmentsCount),
        purchaseDate: purchaseForm.purchaseDate,
      })
      setSuccess(t('cards.purchaseRegistered', { n: purchase.installmentsCount }))
      setPurchaseForm({ ...emptyPurchase, creditCardId: purchaseForm.creditCardId })
      loadPurchases()
      loadCards()
    } catch (err) {
      setError(formatApiError(err))
    }
  }

  function startEdit(card: CreditCardType) {
    setEditingId(card.id)
    setCardForm({
      name: card.name,
      creditLimit: String(card.creditLimit),
      closingDay: String(card.closingDay),
      dueDay: String(card.dueDay),
    })
  }

  async function handleDeactivate(id: string) {
    setError(null)
    setSuccess(null)
    try {
      await deactivateCreditCard(id)
      setSuccess(t('cards.cardDeactivated'))
      loadCards()
    } catch (err) {
      setError(formatApiError(err))
    }
  }

  return (
    <div data-testid="credit-cards-page" className="credit-cards-page animate-fade-in">
      <PageHeader
        data-testid="credit-cards-page-header"
        title={t('cards.title')}
        subtitle="Limites, compras e parcelas"
      >
        <Button
          data-testid="credit-cards-page-new-btn"
          onClick={() => { setEditingId(null); setCardForm(emptyCard); }}
          icon={<Plus size={16} />}
        >
          {t('cards.newCard')}
        </Button>
      </PageHeader>

      <Message type="error" text={error} />
      <Message type="success" text={success} />

      {/* Summary Cards */}
      <section data-testid="credit-cards-summary" className="mb-6" aria-labelledby="cards-summary-title">
        <h2 id="cards-summary-title" className="sr-only">{t('cards.summaryAria')}</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <Card data-testid="credit-cards-summary-limit" className="metric-hero p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-credit-100">
                <CreditCard size={22} className="text-credit-600" />
              </div>
              <div>
                <p className="text-caption-uppercase text-muted">{t('cards.totalLimit')}</p>
                <p className="text-display-sm text-ink tabular-nums">{formatCurrency(totalLimit)}</p>
              </div>
            </div>
          </Card>
          <Card data-testid="credit-cards-summary-used" className="metric-hero p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-expense-100">
                <TrendingDown size={22} className="text-expense-600" />
              </div>
              <div>
                <p className="text-caption-uppercase text-muted">{t('cards.used')}</p>
                <p className="text-display-sm text-ink tabular-nums">{formatCurrency(totalUsed)}</p>
              </div>
            </div>
            <MetricRing
              data-testid="credit-cards-summary-used-ring"
              value={totalUsed}
              max={Math.max(1, totalLimit)}
              size={56}
              strokeWidth={4}
              color="credit"
              showLabel={false}
            >
              <span className="text-title-sm font-semibold text-ink">{totalLimit > 0 ? Math.round((totalUsed / totalLimit) * 100) : 0}%</span>
            </MetricRing>
          </Card>
          <Card data-testid="credit-cards-summary-available" className="metric-hero p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-income-100">
                <TrendingUp size={22} className="text-income-600" />
              </div>
              <div>
                <p className="text-caption-uppercase text-muted">Disponível</p>
                <p className="text-display-sm text-ink tabular-nums">{formatCurrency(totalAvailable)}</p>
              </div>
            </div>
          </Card>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-4">
        {/* Cards List */}
        <section data-testid="credit-cards-list-section" className="lg:col-span-2" aria-labelledby="cards-list-title">
          <Card data-testid="credit-cards-list-card" className="card-padded">
            <h3 id="cards-list-title" className="section-title mb-6">{t('cards.myCards')}</h3>
            {cards.length === 0 ? (
              <EmptyState
                data-testid="credit-cards-list-empty"
                icon={EmptyCard}
                title="Nenhum cartão cadastrado"
                description={t('cards.emptyDesc')}
              />
            ) : (
              <div data-testid="credit-cards-list" className="space-y-3">
                {cards.map((card, index) => {
                  const isActive = card.status === 'ACTIVE'
                  const usedPct = card.creditLimit > 0 ? (card.usedLimit / card.creditLimit) * 100 : 0
                  return (
                    <article
                      key={card.id}
                      data-testid={`credit-cards-list-item-${card.id}`}
                      id={`credit-cards-list-item-${card.id}`}
                      className={cn('credit-cards-list__item flex items-center gap-4 p-4 rounded-xl bg-surface border border-hairline transition-all animate-slide-up', isActive ? 'hover:border-hairlineStrong hover:shadow-card' : 'opacity-60')}
                      style={{ animationDelay: `${index * 40}ms` }}
                    >
                      <div className="credit-cards-list__item-icon flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-credit-100">
                        <CreditCard size={24} className="text-credit-600" />
                      </div>
                      <div className="credit-cards-list__item-info flex-1 min-w-0">
                        <p className={cn('text-body-md font-semibold truncate', isActive ? 'text-ink' : 'text-muted')}>
                          {card.name}
                        </p>
                        <div className="credit-cards-list__item-meta flex items-center gap-3 mt-1 text-body-sm text-muted">
                          <span>{t('cards.closing', { day: card.closingDay })}</span>
                          <span>{t('cards.due', { day: card.dueDay })}</span>
                          <span className={statusBadgeClass(card.status)}>{statusLabels[card.status]}</span>
                        </div>
                        <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-surfaceHover">
                          <div className={cn('credit-cards-list__item-usage h-full rounded-full transition-all duration-700 ease-out', usedPct > 80 ? 'bg-expense-500' : 'bg-credit-500')} style={{ width: `${usedPct}%` }} />
                        </div>
                      </div>
                      <div className="credit-cards-list__item-balance text-right">
                        <p className="text-body-sm font-semibold text-ink">{t('cards.avail', { currency: formatCurrency(card.availableLimit) })}</p>
                        <p className="text-body-sm text-muted">{formatCurrency(card.usedLimit)} / {formatCurrency(card.creditLimit)}</p>
                        {isActive && (
                          <div className="mt-2 flex justify-end gap-2">
                            <Button
                              data-testid={`credit-cards-list-item-${card.id}-edit-btn`}
                              variant="secondary"
                              size="sm"
                              icon={<Pencil size={14} />}
                              onClick={() => startEdit(card)}
                            >
                              {t('cards.edit')}
                            </Button>
                            <Button
                              data-testid={`credit-cards-list-item-${card.id}-deactivate-btn`}
                              variant="ghost"
                              size="sm"
                              icon={<Power size={14} />}
                              className="text-expense-600 hover:bg-expense-50 hover:text-expense-700"
                              onClick={() => handleDeactivate(card.id)}
                            >
                              {t('cards.deactivate')}
                            </Button>
                          </div>
                        )}
                      </div>
                    </article>
                  )
                })}
              </div>
            )}
          </Card>
        </section>

        {/* Form + New Purchase */}
        <section data-testid="credit-cards-form-section" className="lg:col-span-2 space-y-6" aria-labelledby="cards-form-title">
          <Card data-testid="credit-cards-form-card" className="card-padded sticky top-20">
            <h3 id="cards-form-title" className="section-title mb-6">{editingId ? t('cards.editCard') : t('cards.newCard')}</h3>
            <form data-testid="credit-cards-form" id="credit-cards-form" onSubmit={handleCardSubmit} className="space-y-4">
              <FormField
                data-testid="credit-cards-form-name-field"
                label={t('common.name')}
                htmlFor="card-name"
              >
                <input
                  id="card-name"
                  data-testid="credit-cards-form-name-input"
                  className="input"
                  value={cardForm.name}
                  onChange={(e) => setCardForm({ ...cardForm, name: e.target.value })}
                  required
                  maxLength={100}
                  placeholder={t('cards.namePlaceholder')}
                  autoFocus
                />
              </FormField>
              <FormField
                data-testid="credit-cards-form-limit-field"
                label={t('cards.limit')}
                htmlFor="card-limit"
              >
                <div className="relative"><span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted">R$</span>
                <input
                  id="card-limit"
                  data-testid="credit-cards-form-limit-input"
                  type="number"
                  step="0.01"
                  min="0.01"
                  className="input pl-8"
                  value={cardForm.creditLimit}
                  onChange={(e) => setCardForm({ ...cardForm, creditLimit: e.target.value })}
                  required
                  placeholder={t('common.amountPlaceholder')} /></div>
              </FormField>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  data-testid="credit-cards-form-closing-field"
                  label={t('common.closingDay')}
                  htmlFor="card-closing"
                >
                  <input
                    id="card-closing"
                    data-testid="credit-cards-form-closing-input"
                    type="number"
                    min="1"
                    max="31"
                    className="input"
                    value={cardForm.closingDay}
                    onChange={(e) => setCardForm({ ...cardForm, closingDay: e.target.value })}
                    required
                  />
                </FormField>
                <FormField
                  data-testid="credit-cards-form-due-field"
                  label={t('common.dueDay')}
                  htmlFor="card-due"
                >
                  <input
                    id="card-due"
                    data-testid="credit-cards-form-due-input"
                    type="number"
                    min="1"
                    max="31"
                    className="input"
                    value={cardForm.dueDay}
                    onChange={(e) => setCardForm({ ...cardForm, dueDay: e.target.value })}
                    required
                  />
                </FormField>
              </div>
              <div className="flex gap-3 pt-2">
                <Button
                  data-testid="credit-cards-form-submit-btn"
                  type="submit"
                  className="flex-1"
                >
                  {editingId ? t('cards.save') : t('cards.createCard')}
                </Button>
                {editingId && (
                  <Button
                    data-testid="credit-cards-form-cancel-btn"
                    type="button"
                    variant="secondary"
                    onClick={() => { setEditingId(null); setCardForm(emptyCard); }}
                    className="flex-1"
                  >
                    {t('cards.cancel')}
                  </Button>
                )}
              </div>
            </form>
          </Card>

          <Card data-testid="credit-cards-purchase-form-card" className="card-padded">
            <h3 className="section-title mb-6">{t('cards.newPurchase')}</h3>
            <form data-testid="credit-cards-purchase-form" id="credit-cards-purchase-form" onSubmit={handlePurchaseSubmit} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <FormField
                  data-testid="credit-cards-purchase-card-field"
                  label={t('common.card')}
                  htmlFor="purchase-card"
                >
                  <select
                    id="purchase-card"
                    data-testid="credit-cards-purchase-card-select"
                    className="select"
                    value={purchaseForm.creditCardId}
                    onChange={(e) => setPurchaseForm({ ...purchaseForm, creditCardId: e.target.value })}
                    required
                  >
                    <option value="">{t('cards.select')}</option>
                    {activeCards.map((card) => <option key={card.id} value={card.id}>{t('cards.optionAvail', { name: card.name, currency: formatCurrency(card.availableLimit) })}</option>)}
                  </select>
                </FormField>
                <FormField
                  data-testid="credit-cards-purchase-category-field"
                  label={t('common.category')}
                  htmlFor="purchase-category"
                >
                  <select
                    id="purchase-category"
                    data-testid="credit-cards-purchase-category-select"
                    className="select"
                    value={purchaseForm.categoryId}
                    onChange={(e) => setPurchaseForm({ ...purchaseForm, categoryId: e.target.value })}
                    required
                  >
                    <option value="">{t('cards.select')}</option>
                    {expenseCategories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
                  </select>
                </FormField>
                <FormField
                  data-testid="credit-cards-purchase-description-field"
                  label={t('common.description')}
                  htmlFor="purchase-description"
                >
                  <input
                    id="purchase-description"
                    data-testid="credit-cards-purchase-description-input"
                    className="input"
                    value={purchaseForm.description}
                    onChange={(e) => setPurchaseForm({ ...purchaseForm, description: e.target.value })}
                    maxLength={255}
                    placeholder={t('common.optional')}
                  />
                </FormField>
                <FormField
                  data-testid="credit-cards-purchase-amount-field"
                  label={t('common.totalValue')}
                  htmlFor="purchase-amount"
                >
                  <div className="relative"><span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted">R$</span>
                  <input
                    id="purchase-amount"
                    data-testid="credit-cards-purchase-amount-input"
                    type="number"
                    step="0.01"
                    min="0.01"
                    className="input pl-8"
                    value={purchaseForm.totalAmount}
                    onChange={(e) => setPurchaseForm({ ...purchaseForm, totalAmount: e.target.value })}
                    required
placeholder={t('common.amountPlaceholder')} /></div>
                </FormField>
                <FormField
                  data-testid="credit-cards-purchase-date-field"
                  label={t('common.date')}
                  htmlFor="purchase-date"
                >
                  <input
                    id="purchase-date"
                    data-testid="credit-cards-purchase-date-input"
                    type="date"
                    className="input"
                    value={purchaseForm.purchaseDate}
                    onChange={(e) => setPurchaseForm({ ...purchaseForm, purchaseDate: e.target.value })}
                    required
                  />
                </FormField>
                <FormField
                  data-testid="credit-cards-purchase-installments-field"
                  label={t('common.installments')}
                  htmlFor="purchase-installments"
                  hint={installmentPreview !== null ? t('cards.perInstallment', { currency: formatCurrency(installmentPreview) }) : undefined}
                >
                  <input
                    id="purchase-installments"
                    data-testid="credit-cards-purchase-installments-input"
                    type="number"
                    min="1"
                    max="48"
                    className="input"
                    value={purchaseForm.installmentsCount}
                    onChange={(e) => setPurchaseForm({ ...purchaseForm, installmentsCount: e.target.value })}
                    required
                  />
                </FormField>
              </div>
              <Button
                data-testid="credit-cards-purchase-submit-btn"
                type="submit"
                icon={<ShoppingCart size={16} />}
                className="w-full sm:w-auto"
              >
                {t('cards.registerPurchase')}
              </Button>
            </form>
          </Card>
        </section>
      </div>

      {/* Recent Purchases */}
      <Card data-testid="credit-cards-purchases-card" className="mt-6 card-padded">
        <h3 className="section-title mb-6">{t('cards.recentPurchases')}</h3>
        {!purchases || purchases.content.length === 0 ? (
          <EmptyState
            data-testid="credit-cards-purchases-empty"
            icon={EmptyCard}
            title={t('cards.noPurchases')}
            description={t('cards.noPurchasesDesc')}
          />
        ) : (
          <div data-testid="credit-cards-purchases-list" className="space-y-3">
            {purchases.content.map((purchase, index) => (
              <div
                key={purchase.id}
                data-testid={`credit-cards-purchase-${purchase.id}`}
                id={`credit-cards-purchase-${purchase.id}`}
                className="flex items-center gap-4 p-4 rounded-xl bg-surfaceHover border border-hairline animate-slide-up"
                style={{ animationDelay: `${index * 40}ms` }}
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-peach">
                  <ShoppingCart size={20} className="text-ink" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-body-md font-medium text-ink truncate">{purchase.description || '—'}</p>
                  <p className="text-body-sm text-muted">{purchase.creditCardName} · {purchase.categoryName} · {purchase.installmentsCount}x</p>
                </div>
                <span className="text-body-md font-semibold text-ink tabular-nums">{formatCurrency(purchase.totalAmount)}</span>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}