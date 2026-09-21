import { useCallback, useEffect, useState } from 'react'
import { ArrowLeftRight, Plus, ChevronLeft, ChevronRight } from 'lucide-react'
import { listAccounts } from '../services/accountService'
import { listTransfers, createTransfer } from '../services/transferService'
import { formatApiError } from '../services/api'
import { Message } from '../components/Message'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { EmptyState } from '../components/ui/EmptyState'
import { FormField } from '../components/ui/FormField'
import { PageHeader } from '../components/ui/PageHeader'
import { formatCurrency, formatDate, today } from '../utils/format'
import type { Account, Page, Transfer } from '../types'
import { EmptyTransfer } from '../components/Illustrations'
import { t } from '../i18n'

const emptyTransfer = {
  sourceAccountId: '',
  destinationAccountId: '',
  amount: '',
  transferDate: today(),
  description: '',
}

export function TransfersPage() {
  const [accounts, setAccounts] = useState<Account[]>([])
  const [transfers, setTransfers] = useState<Page<Transfer> | null>(null)
  const [filters, setFilters] = useState({ page: 0, size: 20 })
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState(emptyTransfer)

  const loadTransfers = useCallback(() => {
    setLoading(true)
    listTransfers(filters.page, filters.size)
      .then(setTransfers)
      .catch((err) => setError(formatApiError(err)))
      .finally(() => setLoading(false))
  }, [filters])

  useEffect(() => {
    listAccounts().then(setAccounts).catch((err) => setError(formatApiError(err)))
  }, [])

  useEffect(loadTransfers, [loadTransfers])

  const activeAccounts = accounts.filter((a) => a.status === 'ACTIVE')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSaving(true)
    try {
      await createTransfer({
        sourceAccountId: form.sourceAccountId,
        destinationAccountId: form.destinationAccountId,
        amount: Number(form.amount),
        transferDate: form.transferDate,
        description: form.description || undefined,
      })
      setModalOpen(false)
      setForm(emptyTransfer)
      loadTransfers()
      listAccounts().then(setAccounts)
    } catch (err) {
      setError(formatApiError(err))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div data-testid="transfers-page" className="transfers-page animate-fade-in">
      <PageHeader
        data-testid="transfers-page-header"
        title={t('transfers.title')}
        subtitle={t('transfers.subtitle')}
      >
        <div className="flex items-center gap-2">
          <Button
            data-testid="transfers-page-new-btn"
            onClick={() => setModalOpen(true)}
            icon={<Plus size={16} />}
          >
            {t('transfers.newTransfer')}
          </Button>
        </div>
      </PageHeader>

      <Message type="error" text={error} />

      {/* Quick Transfer Card */}
      <Card data-testid="transfers-quick-form-card" className="mb-6 card-padded">
        <h3 className="section-title mb-4">{t('transfers.quickTitle')}</h3>
        <form data-testid="transfers-quick-form" id="transfers-quick-form" onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              data-testid="transfers-quick-form-source-field"
              label={t('common.sourceAccount')}
              htmlFor="tf-source"
            >
              <select
                id="tf-source"
                data-testid="transfers-quick-form-source-select"
                className="select"
                value={form.sourceAccountId}
                onChange={(e) => setForm({ ...form, sourceAccountId: e.target.value })}
                required
              >
                <option value="">{t('common.select')}</option>
                {activeAccounts.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
              </select>
            </FormField>
            <FormField
              data-testid="transfers-quick-form-destination-field"
              label={t('common.destinationAccount')}
              htmlFor="tf-destination"
            >
              <select
                id="tf-destination"
                data-testid="transfers-quick-form-destination-select"
                className="select"
                value={form.destinationAccountId}
                onChange={(e) => setForm({ ...form, destinationAccountId: e.target.value })}
                required
              >
                <option value="">{t('common.select')}</option>
                {activeAccounts.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
              </select>
            </FormField>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <FormField
              data-testid="transfers-quick-form-amount-field"
              label={t('common.value')}
              htmlFor="tf-amount"
            >
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted">R$</span>
                <input
                  id="tf-amount"
                  data-testid="transfers-quick-form-amount-input"
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
            <FormField
              data-testid="transfers-quick-form-date-field"
              label={t('common.date')}
              htmlFor="tf-date"
            >
              <input
                id="tf-date"
                data-testid="transfers-quick-form-date-input"
                type="date"
                className="input"
                value={form.transferDate}
                onChange={(e) => setForm({ ...form, transferDate: e.target.value })}
                required
                max={today()}
              />
            </FormField>
          </div>
          <FormField
            data-testid="transfers-quick-form-description-field"
            label={t('common.description')}
            htmlFor="tf-description"
          >
            <input
              id="tf-description"
              data-testid="transfers-quick-form-description-input"
              type="text"
              className="input"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              maxLength={255}
              placeholder={t('common.optional')}
            />
          </FormField>
          <Button
            data-testid="transfers-quick-form-submit-btn"
            type="submit"
            loading={saving}
            className="w-full sm:w-auto"
          >
            {t('common.transfer')}
          </Button>
        </form>
      </Card>

      {/* Transfers List */}
      <Card data-testid="transfers-list-card" className="card-padded">
        <div className="flex items-center justify-between mb-6">
          <h2 className="section-title">{t('transfers.recent')}</h2>
        </div>

        {loading ? (
          <div data-testid="transfers-list-loading" className="space-y-3" role="status" aria-label={t('transfers.loading')}>
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
        ) : !transfers || transfers.content.length === 0 ? (
          <EmptyState
            data-testid="transfers-list-empty"
            icon={EmptyTransfer}
            title={t('transfers.emptyTitle')}
            description={t('transfers.emptyDesc')}
          />
        ) : (
          <>
            <div data-testid="transfers-list" className="space-y-3">
              {transfers.content.map((transfer) => (
                <div
                  key={transfer.id}
                  data-testid={`transfers-list-item-${transfer.id}`}
                  id={`transfers-list-item-${transfer.id}`}
                  className="transfers-list__item flex items-center gap-4 p-4 rounded-xl bg-surfaceHover border border-hairline hover:border-hairlineStrong hover:shadow-card transition-all animate-slide-up"
                >
                  <div className="transfers-list__item-icon flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-transfer-100">
                    <ArrowLeftRight size={24} className="text-transfer-600" />
                  </div>
                  <div className="transfers-list__item-info flex-1 min-w-0">
                    <p className="text-body-md font-medium text-ink truncate">{transfer.sourceAccountName} → {transfer.destinationAccountName}</p>
                    <p className="text-body-sm text-muted">{formatDate(transfer.transferDate)} · {transfer.description || t('transfers.noDescription')}</p>
                  </div>
                  <span className="text-body-lg font-semibold text-ink tabular-nums">{formatCurrency(transfer.amount)}</span>
                </div>
              ))}
            </div>
            {transfers.totalPages > 1 && (
              <div className="mt-6 flex items-center justify-between border-t border-hairline pt-4">
                <Button
                  data-testid="transfers-pagination-prev"
                  variant="secondary"
                  size="sm"
                  icon={<ChevronLeft size={14} />}
                  disabled={filters.page <= 0}
                  onClick={() => setFilters({ ...filters, page: filters.page - 1 })}
                >
                  {t('common.previous')}
                </Button>
                <span className="text-body-sm text-muted">{t('common.pageOf', { n: filters.page + 1, m: Math.max(transfers.totalPages, 1) })}</span>
                <Button
                  data-testid="transfers-pagination-next"
                  variant="secondary"
                  size="sm"
                  disabled={filters.page + 1 >= transfers.totalPages}
                  onClick={() => setFilters({ ...filters, page: filters.page + 1 })}
                >
                  {t('common.next')}
                  <ChevronRight size={14} />
                </Button>
              </div>
            )}
          </>
        )}
      </Card>

      {/* New Transfer Modal */}
      {modalOpen && (
        <div
          data-testid="transfers-modal"
          className="modal-overlay animate-fade-in"
          onClick={() => setModalOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="new-transfer-title"
        >
          <div
            data-testid="transfers-modal-content"
            className="modal-content animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-handle" />
            <h2 id="new-transfer-title" data-testid="transfers-modal-title" className="text-title-lg text-ink mb-6">{t('transfers.newTransfer')}</h2>
            <form data-testid="transfers-modal-form" id="transfers-modal-form" onSubmit={handleSubmit} className="space-y-4">
              {error && <div data-testid="transfers-modal-error" className="p-3 rounded-lg bg-expense-50 text-expense-700 text-body-sm" role="alert">{error}</div>}
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  data-testid="transfers-modal-source-field"
                  label={t('common.sourceAccount')}
                  htmlFor="mt-source"
                >
                  <select
                    id="mt-source"
                    data-testid="transfers-modal-source-select"
                    className="select"
                    value={form.sourceAccountId}
                    onChange={(e) => setForm({ ...form, sourceAccountId: e.target.value })}
                    required
                  >
                    <option value="">{t('common.select')}</option>
                    {activeAccounts.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
                  </select>
                </FormField>
                <FormField
                  data-testid="transfers-modal-destination-field"
                  label={t('common.destinationAccount')}
                  htmlFor="mt-destination"
                >
                  <select
                    id="mt-destination"
                    data-testid="transfers-modal-destination-select"
                    className="select"
                    value={form.destinationAccountId}
                    onChange={(e) => setForm({ ...form, destinationAccountId: e.target.value })}
                    required
                  >
                    <option value="">{t('common.select')}</option>
                    {activeAccounts.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
                  </select>
                </FormField>
              </div>
              <FormField
                data-testid="transfers-modal-amount-field"
                label={t('common.value')}
                htmlFor="mt-amount"
              >
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted">R$</span>
                  <input
                    id="mt-amount"
                    data-testid="transfers-modal-amount-input"
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
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  data-testid="transfers-modal-date-field"
                  label={t('common.date')}
                  htmlFor="mt-date"
                >
                  <input
                    id="mt-date"
                    data-testid="transfers-modal-date-input"
                    type="date"
                    className="input"
                    value={form.transferDate}
                    onChange={(e) => setForm({ ...form, transferDate: e.target.value })}
                    required
                    max={today()}
                  />
                </FormField>
              </div>
              <FormField
                data-testid="transfers-modal-description-field"
                label={t('common.description')}
                htmlFor="mt-description"
              >
                <input
                  id="mt-description"
                  data-testid="transfers-modal-description-input"
                  type="text"
                  className="input"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  maxLength={255}
                  placeholder={t('common.optional')}
                />
              </FormField>
              <div className="flex gap-3">
                <Button
                  data-testid="transfers-modal-cancel-btn"
                  type="button"
                  variant="secondary"
                  onClick={() => setModalOpen(false)}
                  className="flex-1"
                >
                  {t('transfers.cancel')}
                </Button>
                <Button
                  data-testid="transfers-modal-submit-btn"
                  type="submit"
                  loading={saving}
                  className="flex-1"
                >
            {t('common.transfer')}
          </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}