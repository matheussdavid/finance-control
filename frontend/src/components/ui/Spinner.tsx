import { Loader2 } from 'lucide-react'
import { cn } from '../../utils/cn'

interface SpinnerProps {
  className?: string
  label?: string
}

export function Spinner({ className, label }: SpinnerProps) {
  return (
    <div className="flex items-center justify-center gap-3 py-12 text-muted">
      <Loader2 className={cn('animate-spin text-ink', className ?? 'h-6 w-6')} />
      {label && <span className="text-body-sm">{label}</span>}
    </div>
  )
}
