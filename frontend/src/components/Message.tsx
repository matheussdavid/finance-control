import { AlertTriangle, CheckCircle2, Info } from 'lucide-react'
import { cn } from '../utils/cn'

type MessageType = 'error' | 'success' | 'info'

interface MessageProps {
  type: MessageType
  text: string | null
}

const styles: Record<MessageType, { wrapper: string; icon: typeof Info }> = {
  error: { wrapper: 'border-expense-200 bg-expense-50 text-expense-700', icon: AlertTriangle },
  success: { wrapper: 'border-income-200 bg-income-50 text-income-700', icon: CheckCircle2 },
  info: { wrapper: 'border-sky-200 bg-sky-50 text-sky-700', icon: Info },
}

export function Message({ type, text }: MessageProps) {
  if (!text) {
    return null
  }
  const { wrapper, icon: Icon } = styles[type]
  return (
    <div data-testid={`message-${type}`} className={cn('mb-4 flex items-start gap-2.5 rounded-control border px-4 py-3 text-body-sm font-medium', wrapper)}>
      <Icon size={18} className="mt-0.5 shrink-0" />
      <span>{text}</span>
    </div>
  )
}
