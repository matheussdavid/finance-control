import type { ReactNode } from 'react'
import { cn } from '../../utils/cn'

interface MetricRingProps {
  value: number
  max: number
  size?: number
  strokeWidth?: number
  className?: string
  children?: ReactNode
  showLabel?: boolean
  label?: string
  color?: 'income' | 'expense' | 'credit' | 'savings' | 'primary'
}

const colorMap = {
  income: 'stroke-income-600',
  expense: 'stroke-expense-600',
  credit: 'stroke-credit-600',
  savings: 'stroke-savings-600',
  primary: 'stroke-primary-600',
} as const

const bgColorMap = {
  income: 'stroke-income-200',
  expense: 'stroke-expense-200',
  credit: 'stroke-credit-200',
  savings: 'stroke-savings-200',
  primary: 'stroke-primary-200',
} as const

export function MetricRing({
  value,
  max,
  size = 120,
  strokeWidth = 8,
  className,
  children,
  showLabel = true,
  label,
  color = 'primary',
}: MetricRingProps) {
  const percentage = max > 0 ? Math.min(100, (value / max) * 100) : 0
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (percentage / 100) * circumference

  const svgSize = size

  return (
    <div className={cn('relative flex flex-col items-center', className)}>
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={svgSize} height={svgSize} className="transform -rotate-90">
          <circle
            className={cn('fill-none', bgColorMap[color])}
            strokeWidth={strokeWidth}
            r={radius}
            cx={size / 2}
            cy={size / 2}
          />
          <circle
            className={cn('fill-none transition-all duration-700 ease-out', colorMap[color])}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            r={radius}
            cx={size / 2}
            cy={size / 2}
            style={{ transitionDelay: '100ms' }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          {children || (
            <>
              {showLabel && label && (
                <span className="text-caption text-muted">{label}</span>
              )}
              {!showLabel && label && (
                <span className="text-title-md font-semibold text-ink">{label}</span>
              )}
            </>
          )}
        </div>
      </div>
      {showLabel && label && !children && (
        <div className="mt-3 text-center">
          <p className="text-caption-uppercase text-muted">{label}</p>
          <p className="text-title-md font-semibold text-ink tabular-nums">
            {percentage.toFixed(0)}%
          </p>
        </div>
      )}
    </div>
  )
}