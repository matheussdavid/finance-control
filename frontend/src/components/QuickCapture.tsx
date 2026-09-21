import { useEffect, useRef, useState } from 'react'
import { ArrowRightLeft, TrendingUp, TrendingDown, type LucideIcon } from 'lucide-react'
import { cn } from '../utils/cn'
import { t } from '../i18n'
import { Button } from './ui/Button'
import { FormField } from './ui/FormField'
import { Input } from './ui/Input'
import { Select } from './ui/Select'
import { listAccounts } from '../services/accountService'
import { listCategories } from '../services/categoryService'
import { createTransaction } from '../services/transactionService'
import { createTransfer } from '../services/transferService'
import { formatApiError } from '../services/api'
import type { Account, Category, TransactionType } from '../types'
import { today } from '../utils/format'

interface QuickCaptureProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

const emptyExpense = {
  type: 'EXPENSE' as TransactionType,
  description: '',
  amount: '',
  accountId: '',
  categoryId: '',
  transactionDate: today(),
}

const emptyIncome = {
  type: 'INCOME' as TransactionType,
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

type Mode = 'expense' | 'income' | 'transfer'

const modeConfig: Record<Mode, { label: string; icon: LucideIcon; color: string; bgColor: string }> = {
  expense: { label: t('quickCapture.expense'), icon: TrendingDown, color: 'text-expense-600', bgColor: 'bg-expense-100' },
  income: { label: t('quickCapture.income'), icon: TrendingUp, color: 'text-income-600', bgColor: 'bg-income-100' },
  transfer: { label: t('quickCapture.transfer'), icon: ArrowRightLeft, color: 'text-transfer-600', bgColor: 'bg-transfer-100' },
}

export function QuickCapture({ isOpen, onClose, onSuccess }: QuickCaptureProps) {
  const [mode, setMode] = useState<Mode>('expense')
  const [accounts, setAccounts] = useState<Account[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [expenseForm, setExpenseForm] = useState(emptyExpense)
  const [incomeForm, setIncomeForm] = useState(emptyIncome)
  const [transferForm, setTransferForm] = useState(emptyTransfer)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const modalRef = useRef<HTMLDivElement>(null)
  const focusRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isOpen) {
      listAccounts().then(setAccounts).catch((err: unknown) => setError(formatApiError(err)))
      listCategories().then(setCategories).catch((err: unknown) => setError(formatApiError(err)))
      setError(null)
      setTimeout(() => focusRef.current?.focus(), 100)
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  const activeAccounts = accounts.filter((a) => a.status === 'ACTIVE')
  const expenseCategories = categories.filter((c) => c.type === 'EXPENSE' && c.status === 'ACTIVE')
  const incomeCategories = categories.filter((c) => c.type === 'INCOME' && c.status === 'ACTIVE')

  const accountOptions = activeAccounts.map((a) => ({ value: a.id, label: a.name }))
  const expenseCategoryOptions = expenseCategories.map((c) => ({ value: c.id, label: c.name }))
  const incomeCategoryOptions = incomeCategories.map((c) => ({ value: c.id, label: c.name }))

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSaving(true)
    try {
      if (mode === 'transfer') {
        await createTransfer({
          sourceAccountId: transferForm.sourceAccountId,
          destinationAccountId: transferForm.destinationAccountId,
          amount: Number(transferForm.amount),
          transferDate: transferForm.transferDate,
          description: transferForm.description || undefined,
        })
      } else {
        const form = mode === 'expense' ? expenseForm : incomeForm
        await createTransaction({
          type: mode,
          description: form.description || undefined,
          amount: Number(form.amount),
          accountId: form.accountId,
          categoryId: form.categoryId,
          transactionDate: form.transactionDate,
        })
      }
      onSuccess?.()
      onClose()
      if (mode === 'expense') setExpenseForm({ ...emptyExpense, type: 'EXPENSE' })
      if (mode === 'income') setIncomeForm({ ...emptyIncome, type: 'INCOME' })
      setTransferForm(emptyTransfer)
    } catch (err) {
      setError(formatApiError(err))
    } finally {
      setSaving(false)
    }
  }

  if (!isOpen) return null

  const config = modeConfig[mode]

  return (
    <div
      data-testid="quickcapture-modal"
      className="modal-overlay animate-fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="quickcapture-title"
    >
      <div
        data-testid="quickcapture-modal-content"
        className="modal-content animate-scale-in"
        onClick={(e) => e.stopPropagation()}
        ref={modalRef}
      >
        <div className="modal-handle" aria-hidden="true" />
        <div className="flex items-center gap-3 mb-6">
          <div className={cn('quickcapture__icon flex h-12 w-12 items-center justify-center rounded-xl', config.bgColor)}>
            <config.icon size={24} className={config.color} />
          </div>
          <div>
            <h2 id="quickcapture-title" data-testid="quickcapture-title" className="text-title-lg text-ink">{t('quickCapture.title')}</h2>
            <p className="text-body-sm text-muted">{config.label}</p>
          </div>
        </div>

        <div
          data-testid="quickcapture-tabs"
          className="flex gap-2 mb-6"
          role="tablist"
          aria-label={t('quickCapture.transactionType')}
        >
          {(['expense', 'income', 'transfer'] as Mode[]).map((m) => {
            const c = modeConfig[m]
            const isActive = mode === m
            return (
              <button
                key={m}
                type="button"
                role="tab"
                data-testid={`quickcapture-tab-${m}`}
                aria-selected={isActive}
                onClick={() => setMode(m)}
                className={cn(
                  'quickcapture__tab flex-1 flex items-center justify-center gap-2 rounded-lg px-4 py-3 text-body-sm font-medium transition-all duration-fast',
                  isActive
                    ? 'bg-primary-600 text-inverse shadow-soft'
                    : 'text-muted hover:text-ink hover:bg-surfaceHover'
                )}
              >
                <c.icon size={16} />
                <span>{c.label}</span>
              </button>
            )
          })}
        </div>

        <form data-testid="quickcapture-form" id="quickcapture-form" onSubmit={handleSubmit}>
          {error && (
            <div data-testid="quickcapture-error" className="mb-4 p-3 rounded-lg bg-expense-50 text-expense-700 text-body-sm" role="alert">
              {error}
            </div>
          )}

          {mode !== 'transfer' && (
            <>
              <FormField
                data-testid="quickcapture-amount-field"
                label={t('common.value')}
                htmlFor="quickcapture-amount"
              >
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted">R$</span>
                  <Input
                    ref={focusRef}
                    id="quickcapture-amount"
                    data-testid="quickcapture-amount-input"
                    type="number"
                    step="0.01"
                    min="0.01"
                    className="input pl-8"
                    value={mode === 'expense' ? expenseForm.amount : incomeForm.amount}
                    onChange={(e) => {
                      if (mode === 'expense') setExpenseForm({ ...expenseForm, amount: e.target.value })
                      else setIncomeForm({ ...incomeForm, amount: e.target.value })
                    }}
                    required
                    placeholder={t('common.amountPlaceholder')}
                    inputMode="decimal"
                  />
                </div>
              </FormField>

              <FormField
                data-testid="quickcapture-description-field"
                label={t('common.description')}
                htmlFor="quickcapture-description"
              >
                <Input
                  id="quickcapture-description"
                  data-testid="quickcapture-description-input"
                  type="text"
                  value={mode === 'expense' ? expenseForm.description : incomeForm.description}
                  onChange={(e) => {
                    if (mode === 'expense') setExpenseForm({ ...expenseForm, description: e.target.value })
                    else setIncomeForm({ ...incomeForm, description: e.target.value })
                  }}
                  maxLength={255}
                  placeholder={t('common.optional')}
                />
              </FormField>

              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  data-testid="quickcapture-account-field"
                  label={t('common.account')}
                  htmlFor="quickcapture-account"
                >
                  <Select
                    id="quickcapture-account"
                    data-testid="quickcapture-account-select"
                    options={accountOptions}
                    placeholder={t('common.select')}
                    value={mode === 'expense' ? expenseForm.accountId : incomeForm.accountId}
                    onChange={(e) => {
                      if (mode === 'expense') setExpenseForm({ ...expenseForm, accountId: e.target.value })
                      else setIncomeForm({ ...incomeForm, accountId: e.target.value })
                    }}
                    required
                  />
                </FormField>

                <FormField
                  data-testid="quickcapture-category-field"
                  label={t('common.category')}
                  htmlFor="quickcapture-category"
                >
                  <Select
                    id="quickcapture-category"
                    data-testid="quickcapture-category-select"
                    options={mode === 'expense' ? expenseCategoryOptions : incomeCategoryOptions}
                    placeholder={t('common.select')}
                    value={mode === 'expense' ? expenseForm.categoryId : incomeForm.categoryId}
                    onChange={(e) => {
                      if (mode === 'expense') setExpenseForm({ ...expenseForm, categoryId: e.target.value })
                      else setIncomeForm({ ...incomeForm, categoryId: e.target.value })
                    }}
                    required
                  />
                </FormField>
              </div>

              <FormField
                data-testid="quickcapture-date-field"
                label={t('common.date')}
                htmlFor="quickcapture-date"
              >
                <Input
                  id="quickcapture-date"
                  data-testid="quickcapture-date-input"
                  type="date"
                  value={mode === 'expense' ? expenseForm.transactionDate : incomeForm.transactionDate}
                  onChange={(e) => {
                    if (mode === 'expense') setExpenseForm({ ...expenseForm, transactionDate: e.target.value })
                    else setIncomeForm({ ...incomeForm, transactionDate: e.target.value })
                  }}
                  required
                  max={today()}
                />
              </FormField>
            </>
          )}

          {mode === 'transfer' && (
            <>
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  data-testid="quickcapture-source-account-field"
                  label={t('common.sourceAccount')}
                  htmlFor="quickcapture-source-account"
                >
                  <Select
                    id="quickcapture-source-account"
                    data-testid="quickcapture-source-account-select"
                    options={accountOptions}
                    placeholder={t('common.select')}
                    value={transferForm.sourceAccountId}
                    onChange={(e) => setTransferForm({ ...transferForm, sourceAccountId: e.target.value })}
                    required
                  />
                </FormField>
                <FormField
                  data-testid="quickcapture-destination-account-field"
                  label={t('common.destinationAccount')}
                  htmlFor="quickcapture-destination-account"
                >
                  <Select
                    id="quickcapture-destination-account"
                    data-testid="quickcapture-destination-account-select"
                    options={accountOptions}
                    placeholder={t('common.select')}
                    value={transferForm.destinationAccountId}
                    onChange={(e) => setTransferForm({ ...transferForm, destinationAccountId: e.target.value })}
                    required
                  />
                </FormField>
              </div>

              <FormField
                data-testid="quickcapture-transfer-amount-field"
                label={t('common.value')}
                htmlFor="quickcapture-transfer-amount"
              >
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted">R$</span>
                  <Input
                    ref={focusRef}
                    id="quickcapture-transfer-amount"
                    data-testid="quickcapture-transfer-amount-input"
                    type="number"
                    step="0.01"
                    min="0.01"
                    className="input pl-8"
                    value={transferForm.amount}
                    onChange={(e) => setTransferForm({ ...transferForm, amount: e.target.value })}
                    required
                    placeholder={t('common.amountPlaceholder')}
                    inputMode="decimal"
                  />
                </div>
              </FormField>

              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  data-testid="quickcapture-transfer-date-field"
                  label={t('common.date')}
                  htmlFor="quickcapture-transfer-date"
                >
                  <Input
                    id="quickcapture-transfer-date"
                    data-testid="quickcapture-transfer-date-input"
                    type="date"
                    value={transferForm.transferDate}
                    onChange={(e) => setTransferForm({ ...transferForm, transferDate: e.target.value })}
                    required
                    max={today()}
                  />
                </FormField>
              </div>

              <FormField
                data-testid="quickcapture-transfer-description-field"
                label={t('common.description')}
                htmlFor="quickcapture-transfer-description"
              >
                <Input
                  id="quickcapture-transfer-description"
                  data-testid="quickcapture-transfer-description-input"
                  type="text"
                  value={transferForm.description}
                  onChange={(e) => setTransferForm({ ...transferForm, description: e.target.value })}
                  maxLength={255}
                  placeholder={t('common.optional')}
                />
              </FormField>
            </>
          )}

          <div className="mt-6 flex gap-3">
            <Button
              data-testid="quickcapture-cancel-btn"
              type="button"
              variant="secondary"
              onClick={onClose}
              className="flex-1"
            >
              {t('common.cancel')}
            </Button>
            <Button
              data-testid="quickcapture-submit-btn"
              type="submit"
              loading={saving}
              className="flex-1"
            >
              {mode === 'transfer' ? t('quickCapture.transferSubmit') : t('quickCapture.save')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}