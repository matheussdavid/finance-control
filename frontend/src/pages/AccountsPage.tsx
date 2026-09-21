import { useCallback, useEffect, useState, type FormEvent } from 'react'
import { Pencil, Plus, Power, TrendingUp, Wallet, type LucideIcon } from 'lucide-react'
import { createAccount, deactivateAccount, listAccounts, updateAccount } from '../services/accountService'
import { formatApiError } from '../services/api'
import { Message } from '../components/Message'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { EmptyState } from '../components/ui/EmptyState'
import { FormField } from '../components/ui/FormField'
import { PageHeader } from '../components/ui/PageHeader'
import { formatCurrency } from '../utils/format'
import { accountTypeLabels, statusBadgeClass, statusLabels } from '../utils/labels'
import type { Account, AccountType } from '../types'
import { EmptyWallet } from '../components/Illustrations'
import { cn } from '../utils/cn'
import { PiggyBank } from 'lucide-react'
import { t } from '../i18n'

const emptyForm = { name: '', type: 'CHECKING' as AccountType, initialBalance: '' }

const typeIconMap: Record<AccountType, LucideIcon> = {
  CHECKING: Wallet,
  SAVINGS: PiggyBank,
  CASH: Wallet,
}

const typeColorMap = {
  CHECKING: 'bg-primary-100 text-primary-600',
  SAVINGS: 'bg-savings-100 text-savings-600',
  CASH: 'bg-transfer-100 text-transfer-600',
}

const typeBadgeMap = {
  CHECKING: 'badge-credit',
  SAVINGS: 'badge-savings',
  CASH: 'badge-transfer',
}

export function AccountsPage() {
  const [accounts, setAccounts] = useState<Account[]>([])
  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const load = useCallback(() => {
    setLoading(true)
    listAccounts()
      .then(setAccounts)
      .catch((err) => setError(formatApiError(err)))
      .finally(() => setLoading(false))
  }, [])

  useEffect(load, [load])

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setError(null)
    setSuccess(null)
    setSaving(true)
    try {
      if (editingId) {
        await updateAccount(editingId, { name: form.name, type: form.type })
        setSuccess(t('accounts.updated'))
      } else {
        await createAccount({
          name: form.name,
          type: form.type,
          initialBalance: Number(form.initialBalance),
        })
        setSuccess(t('accounts.created'))
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

  function startEdit(account: Account) {
    setEditingId(account.id)
    setForm({ name: account.name, type: account.type, initialBalance: String(account.initialBalance) })
  }

  async function handleDeactivate(id: string) {
    setError(null)
    setSuccess(null)
    try {
      await deactivateAccount(id)
      setSuccess(t('accounts.deactivated'))
      load()
    } catch (err) {
      setError(formatApiError(err))
    }
  }

  const activeAccounts = accounts.filter((a) => a.status === 'ACTIVE')
  const totalBalance = activeAccounts.reduce((sum, a) => sum + a.balance, 0)

  return (
    <div data-testid="accounts-page" className="accounts-page animate-fade-in">
      <PageHeader
        data-testid="accounts-page-header"
        title={t('accounts.title')}
        subtitle={t('accounts.subtitle')}
      >
        <Button
          data-testid="accounts-page-new-btn"
          onClick={() => { setEditingId(null); setForm(emptyForm); }}
          icon={<Plus size={16} />}
        >
          {t('accounts.newAccount')}
        </Button>
      </PageHeader>

      <Message type="error" text={error} />
      <Message type="success" text={success} />

      {/* Summary Card */}
      <section data-testid="accounts-summary" className="mb-6" aria-labelledby="accounts-summary-title">
        <h2 id="accounts-summary-title" className="sr-only">{t('accounts.summaryAria')}</h2>
        <Card data-testid="accounts-summary-card" className="metric-hero p-8">
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1">
              <div className="metric-hero-icon bg-primary-100">
                <Wallet size={28} className="text-primary-600" />
              </div>
              <p className="metric-hero-label">{t('accounts.totalActiveBalance')}</p>
              <p className="metric-hero-value">{formatCurrency(totalBalance)}</p>
              <p className="metric-hero-trend metric-hero-trend-up">
                <TrendingUp size={14} /> {activeAccounts.length === 1 ? t('accounts.activeAccountsOne') : t('accounts.activeAccounts', { n: activeAccounts.length })}
              </p>
            </div>
          </div>
        </Card>
      </section>

      <div className="grid gap-6 lg:grid-cols-4">
        {/* Form Panel */}
        <section data-testid="accounts-form-section" className="lg:col-span-1" aria-labelledby="accounts-form-title">
          <Card data-testid="accounts-form-card" className="card-padded h-full sticky top-20">
            <h3 id="accounts-form-title" className="section-title mb-6">{editingId ? t('accounts.editAccount') : t('accounts.newAccount')}</h3>
            <form data-testid="accounts-form" id="accounts-form" onSubmit={handleSubmit} className="space-y-4">
              <FormField
                data-testid="accounts-form-name-field"
                label={t('common.name')}
                htmlFor="account-name"
              >
                <input
                  id="account-name"
                  data-testid="accounts-form-name-input"
                  className="input"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                  maxLength={100}
                  placeholder={t('accounts.namePlaceholder')}
                  autoFocus
                />
              </FormField>
              <FormField
                data-testid="accounts-form-type-field"
                label={t('common.type')}
                htmlFor="account-type"
              >
                <select
                  id="account-type"
                  data-testid="accounts-form-type-select"
                  className="select"
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value as AccountType })}
                >
                  <option value="CHECKING">{t('common.accountTypeChecking')}</option>
                  <option value="SAVINGS">{t('common.accountTypeSavings')}</option>
                  <option value="CASH">{t('common.accountTypeCash')}</option>
                </select>
              </FormField>
              {!editingId && (
                <FormField
                  data-testid="accounts-form-balance-field"
                  label={t('common.initialBalance')}
                  htmlFor="account-balance"
                >
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted">R$</span>
                    <input
                      id="account-balance"
                      data-testid="accounts-form-balance-input"
                      type="number"
                      step="0.01"
                      min="0"
                      className="input pl-8"
                      value={form.initialBalance}
                      onChange={(e) => setForm({ ...form, initialBalance: e.target.value })}
                      required
                      placeholder={t('common.amountPlaceholder')}
                    />
                  </div>
                </FormField>
              )}
              <div className="flex gap-3 pt-2">
                <Button
                  data-testid="accounts-form-submit-btn"
                  type="submit"
                  loading={saving}
                  className="flex-1"
                >
                  {editingId ? t('accounts.save') : t('accounts.createAccount')}
                </Button>
                {editingId && (
                  <Button
                    data-testid="accounts-form-cancel-btn"
                    type="button"
                    variant="secondary"
                    onClick={() => { setEditingId(null); setForm(emptyForm); }}
                    className="flex-1"
                  >
                    {t('accounts.cancel')}
                  </Button>
                )}
              </div>
            </form>
          </Card>
        </section>

        {/* Accounts List */}
        <section data-testid="accounts-list-section" className="lg:col-span-3" aria-labelledby="accounts-list-title">
          <Card data-testid="accounts-list-card" className="card-padded">
            <h3 id="accounts-list-title" className="section-title mb-6">{t('accounts.myAccounts')}</h3>
            {loading ? (
              <div data-testid="accounts-list-loading" className="space-y-3" role="status" aria-label={t('accounts.loading')}>
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="animate-pulse flex items-center gap-4 p-4 rounded-xl bg-surfaceHover border border-hairline">
                    <div className="h-10 w-10 rounded-lg bg-surfacePressed" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 w-3/4 bg-surfacePressed rounded" />
                      <div className="h-3 w-1/2 bg-surfacePressed rounded" />
                    </div>
                    <div className="h-6 w-24 bg-surfacePressed rounded" />
                  </div>
                ))}
              </div>
            ) : accounts.length === 0 ? (
              <EmptyState
                data-testid="accounts-list-empty"
                icon={EmptyWallet}
                title={t('accounts.emptyTitle')}
                description={t('accounts.emptyDesc')}
              />
            ) : (
              <div data-testid="accounts-list" className="space-y-3">
                {accounts.map((account, index) => {
                  const TypeIcon = typeIconMap[account.type] || Wallet
                  const isActive = account.status === 'ACTIVE'
                  return (
                    <article
                      key={account.id}
                      data-testid={`accounts-list-item-${account.id}`}
                      id={`accounts-list-item-${account.id}`}
                      className={cn('accounts-list__item flex items-center gap-4 p-4 rounded-xl bg-surface border border-hairline transition-all animate-slide-up', isActive ? 'hover:border-hairlineStrong hover:shadow-card' : 'opacity-60')}
                      style={{ animationDelay: `${index * 40}ms` }}
                    >
                      <div className={cn('accounts-list__item-icon flex h-12 w-12 shrink-0 items-center justify-center rounded-lg', typeColorMap[account.type] || typeColorMap.CHECKING)}>
                        <TypeIcon size={24} />
                      </div>
                      <div className="accounts-list__item-info flex-1 min-w-0">
                        <p className={cn('text-body-md font-semibold truncate', isActive ? 'text-ink' : 'text-muted')}>
                          {account.name}
                        </p>
                        <div className="accounts-list__item-meta flex items-center gap-3 mt-1">
                          <span className={cn('badge', typeBadgeMap[account.type])}>
                            {accountTypeLabels[account.type]}
                          </span>
                          <span className={statusBadgeClass(account.status)}>{statusLabels[account.status]}</span>
                        </div>
                      </div>
                      <div className="accounts-list__item-balance text-right">
                        <p className={cn('text-body-lg font-semibold tabular-nums', account.balance < 0 ? 'text-expense-600' : 'text-ink')}>
                          {formatCurrency(account.balance)}
                        </p>
                        {isActive && (
                          <div className="mt-2 flex justify-end gap-2">
                            <Button
                              data-testid={`accounts-list-item-${account.id}-edit-btn`}
                              variant="secondary"
                              size="sm"
                              icon={<Pencil size={14} />}
                              onClick={() => startEdit(account)}
                            >
                              {t('accounts.edit')}
                            </Button>
                            <Button
                              data-testid={`accounts-list-item-${account.id}-deactivate-btn`}
                              variant="ghost"
                              size="sm"
                              icon={<Power size={14} />}
                              className="text-expense-600 hover:bg-expense-50 hover:text-expense-700"
                              onClick={() => handleDeactivate(account.id)}
                            >
                              {t('accounts.deactivate')}
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
      </div>
    </div>
  )
}