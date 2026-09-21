import type { FC } from 'react'

interface IllustrationProps {
  className?: string
  size?: number
}

export const EmptyWallet: FC<IllustrationProps> = ({ className, size = 64 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 64 64"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-hidden="true"
  >
    <rect width="64" height="64" rx="16" fill="currentColor" opacity="0.1" />
    <path
      d="M16 22h32c2.2 0 4 1.8 4 4v16c0 2.2-1.8 4-4 4H16c-2.2 0-4-1.8-4-4V26c0-2.2 1.8-4 4-4z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M24 14v-4c0-2.2 1.8-4 4-4h8c2.2 0 4 1.8 4 4v4"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <circle cx="32" cy="38" r="6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M32 44v6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
)

export const EmptyCard: FC<IllustrationProps> = ({ className, size = 64 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 64 64"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-hidden="true"
  >
    <rect width="64" height="64" rx="16" fill="currentColor" opacity="0.1" />
    <path
      d="M14 22h36c2.2 0 4 1.8 4 4v16c0 2.2-1.8 4-4 4H14c-2.2 0-4-1.8-4-4V26c0-2.2 1.8-4 4-4z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M14 30h36"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <circle cx="22" cy="42" r="3" fill="currentColor" opacity="0.5" />
    <circle cx="42" cy="42" r="3" fill="currentColor" opacity="0.5" />
  </svg>
)

export const EmptyPiggy: FC<IllustrationProps> = ({ className, size = 64 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 64 64"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-hidden="true"
  >
    <rect width="64" height="64" rx="16" fill="currentColor" opacity="0.1" />
    <path
      d="M46 30c0-8.8-7.2-16-16-16H34c-4.4 0-8 3.6-8 8s3.6 8 8 8h8c4.4 0 8-3.6 8-8z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M18 30c0 8.8 7.2 16 16 16h8c4.4 0 8-3.6 8-8s-3.6-8-8-8H34c-4.4 0-8 3.6-8 8"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <ellipse cx="32" cy="46" rx="14" ry="10" stroke="currentColor" strokeWidth="2" />
    <path d="M26 42h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <circle cx="48" cy="22" r="4" fill="currentColor" opacity="0.3" />
  </svg>
)

export const EmptyChart: FC<IllustrationProps> = ({ className, size = 64 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 64 64"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-hidden="true"
  >
    <rect width="64" height="64" rx="16" fill="currentColor" opacity="0.1" />
    <path
      d="M18 46v-20c0-2.2 1.8-4 4-4h20c2.2 0 4 1.8 4 4v20"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M22 42l8-12 8 8 8-12 8 12"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <circle cx="30" cy="30" r="3" fill="currentColor" opacity="0.5" />
    <circle cx="46" cy="30" r="3" fill="currentColor" opacity="0.5" />
  </svg>
)

export const EmptyCalendar: FC<IllustrationProps> = ({ className, size = 64 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 64 64"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-hidden="true"
  >
    <rect width="64" height="64" rx="16" fill="currentColor" opacity="0.1" />
    <path
      d="M18 18v28c0 2.2 1.8 4 4 4h20c2.2 0 4-1.8 4-4V18"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M18 26h28"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <path
      d="M26 14v-4M38 14v-4"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <circle cx="32" cy="34" r="6" stroke="currentColor" strokeWidth="2" />
    <path d="M32 30v4M32 34v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
)

export const EmptyCategory: FC<IllustrationProps> = ({ className, size = 64 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 64 64"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-hidden="true"
  >
    <rect width="64" height="64" rx="16" fill="currentColor" opacity="0.1" />
    <path
      d="M20 18h24c2.2 0 4 1.8 4 4v20c0 2.2-1.8 4-4 4H20c-2.2 0-4-1.8-4-4V22c0-2.2 1.8-4 4-4z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M20 30h24M20 38h16M20 46h8"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
)

export const EmptyTransfer: FC<IllustrationProps> = ({ className, size = 64 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 64 64"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-hidden="true"
  >
    <rect width="64" height="64" rx="16" fill="currentColor" opacity="0.1" />
    <path
      d="M18 32h12c2.2 0 4-1.8 4-4V18c0-2.2-1.8-4-4-4H18c-2.2 0-4 1.8-4 4v10c0 2.2 1.8 4 4 4z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M46 32h-12c-2.2 0-4 1.8-4 4v10c0 2.2 1.8 4 4 4h12c2.2 0 4-1.8 4-4V36c0-2.2-1.8-4-4-4z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M32 22v20M26 32h12"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
    />
  </svg>
)

export const Celebration: FC<IllustrationProps> = ({ className, size = 80 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 80 80"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-hidden="true"
  >
    <circle cx="40" cy="40" r="36" fill="currentColor" opacity="0.1" />
    <path
      d="M40 14v12M40 54v12M14 40h12M54 40h12M22 22l8.5 8.5M49.5 49.5l8.5 8.5M22 58l8.5-8.5M49.5 22.5l8.5-8.5"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
    />
    <circle cx="40" cy="40" r="16" stroke="currentColor" strokeWidth="3" strokeDasharray="8 8" opacity="0.5" />
    <circle cx="40" cy="40" r="8" fill="currentColor" opacity="0.2" />
  </svg>
)

export const SuccessCheck: FC<IllustrationProps> = ({ className, size = 64 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 64 64"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-hidden="true"
  >
    <circle cx="32" cy="32" r="30" fill="currentColor" opacity="0.1" />
    <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="3" />
    <path
      d="M20 32l8 8 16-16"
      stroke="currentColor"
      strokeWidth="4"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)

export const EmptyList: FC<IllustrationProps> = ({ className, size = 64 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 64 64"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-hidden="true"
  >
    <rect width="64" height="64" rx="16" fill="currentColor" opacity="0.1" />
    <path
      d="M14 22h36c2.2 0 4 1.8 4 4v16c0 2.2-1.8 4-4 4H14c-2.2 0-4-1.8-4-4V26c0-2.2 1.8-4 4-4z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M14 30h36M14 38h24M14 46h16"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
)