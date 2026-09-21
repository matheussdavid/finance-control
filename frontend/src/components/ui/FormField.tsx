import type { ReactNode } from 'react'

interface FormFieldProps {
  label: string
  htmlFor?: string
  hint?: ReactNode
  children: ReactNode
  testId?: string
  error?: ReactNode
}

export function FormField({ label, htmlFor, hint, children, testId, error }: FormFieldProps) {
  const fieldId = htmlFor || testId

  return (
    <div data-testid={testId ? `${testId}-field` : undefined} id={testId} className="formfield">
      <label htmlFor={fieldId} className="formfield__label">
        {label}
      </label>
      {children}
      {hint && <p className="formfield__hint">{hint}</p>}
      {error && <p className="formfield__error" role="alert">{error}</p>}
    </div>
  )
}