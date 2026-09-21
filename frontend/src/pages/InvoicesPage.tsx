import { useCallback, useEffect, useState } from 'react'
import { CheckCircle2, Eye, FileText, Lock, X, CreditCard, ShoppingCart } from 'lucide-react'
import { listAccounts } from '../services/accountService'
import { closeInvoice, getInvoice, listInvoices, payInvoice } from '../services/invoiceService'
import { formatApiError } from '../services/api'
import { Message } from '../components/Message'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { EmptyState } from '../components/ui/EmptyState'
import { FormField } from '../components/ui/FormField'
import { PageHeader } from '../components/ui/PageHeader'
import { formatCurrency, formatDate } from '../utils/format'
import {
  installmentStatusBadgeClass,
  installmentStatusLabels,
  invoiceStatusBadgeClass,
  invoiceStatusLabels,
} from '../utils/labels'
import type { Account, Invoice, InvoiceDetail, Page } from '../types'
import { EmptyCard } from '../components/Illustrations'
import { cn } from '../utils/cn'
import { t } from '../i18n'

export function InvoicesPage() {
  const [invoices, setInvoices] = useState<Page<Invoice> | null>(null)
  const [detail, setDetail] = useState<InvoiceDetail | null>(null)
  const [accounts, setAccounts] = useState<Account[]>([])
  const [paymentAccountId, setPaymentAccountId] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const loadInvoices = useCallback(() => {
    listInvoices(0, 20).then(setInvoices).catch((err) => setError(formatApiError(err)))
  }, [])

  useEffect(() => {
    loadInvoices()
    listAccounts().then(setAccounts).catch((err) => setError(formatApiError(err)))
  }, [loadInvoices])

  async function openDetail(id: string) {
    setError(null)
    try {
      setDetail(await getInvoice(id))
      setPaymentAccountId('')
    } catch (err) {
      setError(formatApiError(err))
    }
  }

  async function handleClose(id: string) {
    setError(null)
    setSuccess(null)
    try {
      await closeInvoice(id)
      setSuccess(t('invoices.invoiceClosed'))
      loadInvoices()
      if (detail?.id === id) await openDetail(id)
    } catch (err) {
      setError(formatApiError(err))
    }
  }

  async function handlePay(id: string) {
    if (!paymentAccountId) {
      setError(t('invoices.selectAccount'))
      return
    }
    setError(null)
    setSuccess(null)
    try {
      await payInvoice(id, paymentAccountId)
      setSuccess(t('invoices.invoicePaid'))
      loadInvoices()
      listAccounts().then(setAccounts)
      await openDetail(id)
    } catch (err) {
      setError(formatApiError(err))
    }
  }

  const activeAccounts = accounts.filter((account) => account.status === 'ACTIVE')
  const openInvoices = invoices?.content.filter((i) => i.status === 'OPEN') ?? []
  const closedInvoices = invoices?.content.filter((i) => i.status === 'CLOSED') ?? []
  const paidInvoices = invoices?.content.filter((i) => i.status === 'PAID') ?? []
  const totalOpen = openInvoices.reduce((sum, i) => sum + i.totalAmount, 0)

  return (
    <div data-testid="invoices-page" className="invoices-page animate-fade-in">
      <PageHeader
        data-testid="invoices-page-header"
        title={t('invoices.title')}
        subtitle="Acompanhe fechamento, vencimentos e pagamentos"
      />

      <Message type="error" text={error} />
      <Message type="success" text={success} />

      {/* Summary */}
      <section data-testid="invoices-summary" className="mb-6" aria-labelledby="invoices-summary-title">
        <h2 id="invoices-summary-title" className="sr-only">{t('invoices.summaryAria')}</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <Card data-testid="invoices-summary-open" className="card-padded text-center">
            <div className="flex h-12 w-12 mx-auto mb-3 items-center justify-center rounded-xl bg-credit-100">
              <FileText size={24} className="text-credit-600" />
            </div>
            <p className="text-caption-uppercase text-muted">{t('invoices.open')}</p>
            <p className="text-display-sm text-ink">{openInvoices.length}</p>
            <p className="text-body-sm text-muted mt-1">{formatCurrency(totalOpen)}</p>
          </Card>
          <Card data-testid="invoices-summary-closed" className="card-padded text-center">
            <div className="flex h-12 w-12 mx-auto mb-3 items-center justify-center rounded-xl bg-savings-100">
              <Lock size={24} className="text-savings-600" />
            </div>
            <p className="text-caption-uppercase text-muted">{t('invoices.closed')}</p>
            <p className="text-display-sm text-ink">{closedInvoices.length}</p>
          </Card>
          <Card data-testid="invoices-summary-paid" className="card-padded text-center">
            <div className="flex h-12 w-12 mx-auto mb-3 items-center justify-center rounded-xl bg-income-100">
              <CheckCircle2 size={24} className="text-income-600" />
            </div>
            <p className="text-caption-uppercase text-muted">{t('invoices.paid')}</p>
            <p className="text-display-sm text-ink">{paidInvoices.length}</p>
          </Card>
        </div>
      </section>

      {/* Invoices List */}
      <Card data-testid="invoices-list-card" className="card-padded">
        <h3 className="section-title mb-6">{t('invoices.myInvoices')}</h3>
        {!invoices || invoices.content.length === 0 ? (
          <EmptyState
            data-testid="invoices-list-empty"
            icon={EmptyCard}
            title={t('invoices.emptyTitle')}
            description={t('invoices.emptyDesc')}
          />
        ) : (
          <div data-testid="invoices-list" className="space-y-3">
            {invoices.content.map((invoice, index) => (
              <article
                key={invoice.id}
                data-testid={`invoices-list-item-${invoice.id}`}
                id={`invoices-list-item-${invoice.id}`}
                className={cn('invoices-list__item flex items-center gap-4 p-4 rounded-xl bg-surface border border-hairline transition-all animate-slide-up', 'hover:border-hairlineStrong hover:shadow-card')}
                style={{ animationDelay: `${index * 40}ms` }}
              >
                <div className="invoices-list__item-icon flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-credit-100">
                  <CreditCard size={24} className="text-credit-600" />
                </div>
                <div className="invoices-list__item-info flex-1 min-w-0">
                  <p className="text-body-md font-semibold text-ink truncate">{invoice.creditCardName}</p>
                  <div className="invoices-list__item-meta flex flex-wrap gap-4 mt-1 text-body-sm text-muted">
                    <span>{formatDate(invoice.referenceMonth)}</span>
                    <span>{t('invoices.closing', { date: formatDate(invoice.closingDate) })}</span>
                    <span>{t('invoices.due', { date: formatDate(invoice.dueDate) })}</span>
                  </div>
                </div>
                <div className="invoices-list__item-amount text-right">
                  <p className="text-body-lg font-semibold text-ink tabular-nums">{formatCurrency(invoice.totalAmount)}</p>
                  <span className={cn('mt-1 inline-block', invoiceStatusBadgeClass(invoice.status))}>
                    {invoiceStatusLabels[invoice.status]}
                  </span>
                </div>
                <div className="invoices-list__item-actions flex gap-2">
                  <Button
                    data-testid={`invoices-list-item-${invoice.id}-detail-btn`}
                    variant="secondary"
                    size="sm"
                    icon={<Eye size={14} />}
                    onClick={() => openDetail(invoice.id)}
                  >
                    {t('invoices.details')}
                  </Button>
                  {invoice.status === 'OPEN' && (
                    <Button
                      data-testid={`invoices-list-item-${invoice.id}-close-btn`}
                      variant="ghost"
                      size="sm"
                      icon={<Lock size={14} />}
                      onClick={() => handleClose(invoice.id)}
                    >
                      {t('invoices.close')}
                    </Button>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </Card>

      {/* Invoice Detail Modal */}
      {detail && (
        <div
          data-testid="invoices-detail-modal"
          className="modal-overlay animate-fade-in"
          onClick={() => setDetail(null)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="invoice-detail-title"
        >
          <div
            data-testid="invoices-detail-modal-content"
            className="modal-content max-w-2xl animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-handle" />
            <div className="flex items-start justify-between gap-4 mb-6">
              <div>
                <h2 id="invoice-detail-title" data-testid="invoices-detail-title" className="text-title-lg text-ink">{detail.creditCardName} · {formatDate(detail.referenceMonth)}</h2>
                <p className="text-body-sm text-muted">{t('invoices.invoiceDetails')}</p>
              </div>
              <span className={cn('shrink-0', invoiceStatusBadgeClass(detail.status))}>{invoiceStatusLabels[detail.status]}</span>
            </div>

            <div className="grid gap-4 border-b border-hairline pb-6 sm:grid-cols-3">
              <div data-testid="invoices-detail-due" className="rounded-xl bg-surfaceHover p-4 text-center">
                <p className="text-caption-uppercase text-muted">{t('invoices.dueDate')}</p>
                <p className="mt-1 text-title-lg text-ink">{formatDate(detail.dueDate)}</p>
              </div>
              <div data-testid="invoices-detail-total" className="rounded-xl bg-surfaceHover p-4 text-center">
                <p className="text-caption-uppercase text-muted">{t('invoices.total')}</p>
                <p className="mt-1 text-title-lg text-ink">{formatCurrency(detail.totalAmount)}</p>
              </div>
              {detail.paidAt && (
                <div data-testid="invoices-detail-paid" className="rounded-xl bg-income-50 p-4 text-center">
                  <p className="text-caption-uppercase text-income-600">{t('invoices.paidOn')}</p>
                  <p className="mt-1 text-title-lg text-income-700">{formatDate(detail.paidAt)}</p>
                </div>
              )}
            </div>

            <div data-testid="invoices-detail-installments" className="mt-6">
              <h4 className="mb-4 text-caption-uppercase text-muted">Parcelas</h4>
              {detail.installments.length === 0 ? (
                <EmptyState
                  data-testid="invoices-detail-installments-empty"
                  icon={EmptyCard}
                  title={t('invoices.noInstallments')}
                  description={t('invoices.noInstallmentsDesc')}
                />
              ) : (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {detail.installments.map((installment, i) => (
                    <div
                      key={installment.installmentId}
                      data-testid={`invoices-detail-installment-${installment.installmentId}`}
                      id={`invoices-detail-installment-${installment.installmentId}`}
                      className="flex items-center gap-4 p-3 rounded-xl bg-surfaceHover border border-hairline animate-slide-up"
                      style={{ animationDelay: `${i * 30}ms` }}
                    >
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-peach">
                        <ShoppingCart size={18} className="text-ink" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-body-md font-medium text-ink truncate">{installment.purchaseDescription}</p>
                        <p className="text-body-sm text-muted">{t('invoices.installment', { category: installment.categoryName, n: installment.number })}</p>
                      </div>
                      <span className="text-body-md font-semibold text-ink tabular-nums">{formatCurrency(installment.amount)}</span>
                      <span className={installmentStatusBadgeClass(installment.status)}>{installmentStatusLabels[installment.status]}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {detail.status === 'CLOSED' && (
              <div data-testid="invoices-detail-pay-section" className="mt-6 flex flex-wrap items-end gap-4 p-4 rounded-xl bg-surfaceHover border border-hairline">
                <div className="min-w-[240px] flex-1">
                  <FormField
                    data-testid="invoices-detail-pay-account-field"
                    label={t('invoices.paymentAccount')}
                    htmlFor="invoice-payment-account"
                  >
                    <select
                      id="invoice-payment-account"
                      data-testid="invoices-detail-pay-account-select"
                      className="select"
                      value={paymentAccountId}
                      onChange={(e) => setPaymentAccountId(e.target.value)}
                    >
                      <option value="">{t('invoices.select')}</option>
                      {activeAccounts.map((account) => <option key={account.id} value={account.id}>{account.name} ({formatCurrency(account.balance)})</option>)}
                    </select>
                  </FormField>
                </div>
                <Button
                  data-testid="invoices-detail-pay-btn"
                  icon={<CheckCircle2 size={16} />}
                  onClick={() => handlePay(detail.id)}
                >
                  {t('invoices.payInvoice')}
                </Button>
              </div>
            )}

            <div className="mt-6 flex justify-end">
              <Button
                data-testid="invoices-detail-close-btn"
                variant="secondary"
                icon={<X size={16} />}
                onClick={() => setDetail(null)}
              >
                {t('invoices.close')}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}