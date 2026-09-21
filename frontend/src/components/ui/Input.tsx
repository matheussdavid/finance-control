import { forwardRef, type InputHTMLAttributes, type TextareaHTMLAttributes } from 'react'
import { cn } from '../../utils/cn'

interface BaseInputProps {
  testId?: string
  label?: string
  error?: string
  hint?: string
}

type InputProps = BaseInputProps & InputHTMLAttributes<HTMLInputElement>
type TextareaProps = BaseInputProps & TextareaHTMLAttributes<HTMLTextAreaElement>

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ testId, label, error, hint, id, className, ...props }, ref) => {
    const inputId = id || testId
    const describedBy = [error && `${inputId}-error`, hint && `${inputId}-hint`].filter(Boolean).join(' ') || undefined

    return (
      <div data-testid={testId ? `${testId}-wrapper` : undefined} className="formfield">
        {label && <label htmlFor={inputId} className="formfield__label">{label}</label>}
        <input
          ref={ref}
          id={inputId}
          data-testid={testId}
          className={cn('formfield__input input', error && 'input--error', props.disabled && 'input--disabled', className)}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={describedBy}
          {...props}
        />
        {hint && <p id={`${inputId}-hint`} className="formfield__hint">{hint}</p>}
        {error && <p id={`${inputId}-error`} className="formfield__error" role="alert">{error}</p>}
      </div>
    )
  }
)

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ testId, label, error, hint, id, className, ...props }, ref) => {
    const inputId = id || testId
    const describedBy = [error && `${inputId}-error`, hint && `${inputId}-hint`].filter(Boolean).join(' ') || undefined

    return (
      <div data-testid={testId ? `${testId}-wrapper` : undefined} className="formfield">
        {label && <label htmlFor={inputId} className="formfield__label">{label}</label>}
        <textarea
          ref={ref}
          id={inputId}
          data-testid={testId}
          className={cn('formfield__input input', error && 'input--error', props.disabled && 'input--disabled', className)}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={describedBy}
          {...props}
        />
        {hint && <p id={`${inputId}-hint`} className="formfield__hint">{hint}</p>}
        {error && <p id={`${inputId}-error`} className="formfield__error" role="alert">{error}</p>}
      </div>
    )
  }
)