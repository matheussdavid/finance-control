import { forwardRef, type SelectHTMLAttributes } from 'react'
import { cn } from '../../utils/cn'

interface SelectOption {
  value: string
  label: string
  disabled?: boolean
}

interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'children'> {
  testId?: string
  label?: string
  error?: string
  hint?: string
  options: SelectOption[]
  placeholder?: string
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ testId, label, error, hint, options, placeholder, id, className, ...props }, ref) => {
    const selectId = id || testId
    const describedBy = [error && `${selectId}-error`, hint && `${selectId}-hint`].filter(Boolean).join(' ') || undefined

    return (
      <div data-testid={testId ? `${testId}-wrapper` : undefined} className="formfield">
        {label && <label htmlFor={selectId} className="formfield__label">{label}</label>}
        <select
          ref={ref}
          id={selectId}
          data-testid={testId}
          className={cn('formfield__input input select', error && 'input--error', props.disabled && 'input--disabled', className)}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={describedBy}
          {...props}
        >
          {placeholder && <option value="" disabled>{placeholder}</option>}
          {options.map((option) => (
            <option key={option.value} value={option.value} disabled={option.disabled}>
              {option.label}
            </option>
          ))}
        </select>
        {hint && <p id={`${selectId}-hint`} className="formfield__hint">{hint}</p>}
        {error && <p id={`${selectId}-error`} className="formfield__error" role="alert">{error}</p>}
      </div>
    )
  }
)