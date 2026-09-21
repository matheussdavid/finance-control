import type { ReactNode } from 'react'
import { cn } from '../../utils/cn'

interface CardProps {
  children: ReactNode
  className?: string
  elevated?: boolean
  padded?: boolean
  testId?: string
}

export function Card({ children, className, elevated = false, padded = false, testId }: CardProps) {
  return (
    <div
      data-testid={testId}
      id={testId}
      className={cn('card', elevated && 'card--elevated', padded && 'card--padded', className)}
    >
      {children}
    </div>
  )
}

interface CardHeaderProps {
  title: ReactNode
  icon?: ReactNode
  action?: ReactNode
  testId?: string
}

export function CardHeader({ title, icon, action, testId }: CardHeaderProps) {
  return (
    <div data-testid={testId ? `${testId}-header` : undefined} className="card__header">
      <div className="flex items-center gap-3">
        {icon}
        <h3 className="text-title-sm font-semibold text-ink">{title}</h3>
      </div>
      {action}
    </div>
  )
}