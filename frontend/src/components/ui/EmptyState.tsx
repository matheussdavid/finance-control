import type { ElementType, ReactNode } from 'react'

interface EmptyStateProps {
  icon: ElementType
  title: string
  description?: string
  action?: ReactNode
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-12 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-feature bg-surfaceHover">
        <Icon size={26} className="text-mutedSoft" />
      </div>
      <p className="text-title-sm text-ink">{title}</p>
      {description && <p className="mt-1 max-w-xs text-body-sm text-muted">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}
