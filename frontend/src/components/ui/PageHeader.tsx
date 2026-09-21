import type { ReactNode } from 'react'

interface PageHeaderProps {
  title: string
  subtitle?: string
  action?: ReactNode
  children?: ReactNode
  testId?: string
}

export function PageHeader({ title, subtitle, action, children, testId }: PageHeaderProps) {
  return (
    <div data-testid={testId} id={testId} className="pageheader mb-6 flex flex-wrap items-end justify-between gap-4">
      <div className="pageheader__title-wrapper">
        <h1 data-testid={`${testId}-title`} className="pageheader__title text-display-sm text-ink">{title}</h1>
        {subtitle && <p data-testid={`${testId}-subtitle`} className="pageheader__subtitle mt-1 text-body-sm text-muted">{subtitle}</p>}
      </div>
      <div data-testid={`${testId}-actions`} id={`${testId}-actions`} className="pageheader__actions flex flex-wrap items-end gap-3">
        {children}
        {action}
      </div>
    </div>
  )
}