import type { ElementType, ReactNode } from 'react'
import { TrendingDown, TrendingUp } from 'lucide-react'

interface StatCardProps {
  label: string
  value: ReactNode
  icon: ElementType
  iconBg?: string
  iconColor?: string
  sub?: ReactNode
  trend?: { value: string; up: boolean }
}

export function StatCard({
  label,
  value,
  icon: Icon,
  iconBg = 'bg-surfaceHover',
  iconColor = 'text-ink',
  sub,
  trend,
}: StatCardProps) {
  return (
    <div className="stat-card">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className={`flex h-12 w-12 items-center justify-center rounded-control ${iconBg}`}>
            <Icon size={22} className={iconColor} />
          </div>
          <span className="text-caption font-medium text-muted">{label}</span>
        </div>
        {trend && (
          <span className={trend.up ? 'badge-success' : 'badge-danger'}>
            {trend.up ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
            {trend.value}
          </span>
        )}
      </div>
      <p className="text-display-sm text-ink">{value}</p>
      {sub && <p className="mt-1 text-caption text-mutedSoft">{sub}</p>}
    </div>
  )
}

export type FeatureTone = 'pink' | 'teal' | 'lavender' | 'peach' | 'ochre' | 'cream'

const toneClass: Record<FeatureTone, string> = {
  pink: 'feature-card-pink',
  teal: 'feature-card-teal',
  lavender: 'feature-card-lavender',
  peach: 'feature-card-peach',
  ochre: 'feature-card-ochre',
  cream: 'feature-card-cream',
}

const toneDark = new Set<FeatureTone>(['pink', 'teal'])

interface FeatureStatCardProps {
  tone: FeatureTone
  label: string
  value: ReactNode
  icon: ElementType
  sub?: ReactNode
}

export function FeatureStatCard({ tone, label, value, icon: Icon, sub }: FeatureStatCardProps) {
  const dark = toneDark.has(tone)
  return (
    <div className={toneClass[tone]}>
      <div className="flex items-center gap-3">
        <div
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-control ${
            dark ? 'bg-white/20' : 'bg-ink/10'
          }`}
        >
          <Icon size={24} className={dark ? 'text-white' : 'text-ink'} />
        </div>
        <p
          className={`text-caption-uppercase uppercase ${
            dark ? 'text-white/80' : 'text-ink/70'
          }`}
        >
          {label}
        </p>
      </div>
      <p className={`mt-6 text-display-sm ${dark ? 'text-white' : 'text-ink'}`}>{value}</p>
      {sub && <p className={`mt-1 text-caption ${dark ? 'text-white/70' : 'text-ink/60'}`}>{sub}</p>}
    </div>
  )
}
