import { useState, type FormEvent } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { Wallet } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { formatApiError } from '../services/api'
import { Message } from '../components/Message'
import { Button } from '../components/ui/Button'
import { FormField } from '../components/ui/FormField'
import { Input } from '../components/ui/Input'
import { t } from '../i18n'

export function LoginPage() {
  const { isAuthenticated, login, register } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [mode, setMode] = useState<'login' | 'register'>(location.pathname === '/register' ? 'register' : 'login')
  const [name, setName] = useState('')
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  if (isAuthenticated) {
    return <Navigate to="/" replace />
  }

  function validateForm(): string | null {
    if (mode === 'login') {
      if (!identifier.trim()) return t('login.identifierRequired')
      if (!password) return t('login.passwordRequired')
      if (password.length < 6) return t('login.passwordMin')
      return null
    }
    if (!name.trim()) return t('login.nameRequired')
    if (!username.trim()) return t('login.usernameRequired')
    if (!email.trim()) return t('login.emailRequired')
    if (!/^\S+@\S+\.\S+$/.test(email)) return t('login.emailInvalid')
    if (!password) return t('login.passwordRequired')
    if (password.length < 6) return t('login.passwordMin')
    if (!confirmPassword) return t('login.confirmPasswordRequired')
    if (password !== confirmPassword) return t('login.passwordMismatch')
    return null
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    const validationError = validateForm()
    if (validationError) {
      setError(validationError)
      return
    }
    setError(null)
    setLoading(true)
    try {
      if (mode === 'login') {
        await login(identifier, password)
      } else {
        await register(name, username, email, password, confirmPassword)
      }
      navigate('/')
    } catch (err) {
      setError(formatApiError(err))
    } finally {
      setLoading(false)
    }
  }

  function toggleMode() {
    const next = mode === 'login' ? 'register' : 'login'
    setMode(next)
    setError(null)
    navigate(next === 'register' ? '/register' : '/login')
  }

  return (
    <div data-testid="login-page" className="login-page flex min-h-screen items-center justify-center bg-canvas px-4 py-12">
      <div className="login-page__card w-full max-w-md">
        <div className="login-page__header mb-8 text-center">
          <div className="login-page__logo mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-feature bg-ink text-canvas">
            <Wallet size={30} />
          </div>
          <h1 className="login-page__title text-display-sm text-ink">{t('common.brand')}</h1>
          <p className="login-page__subtitle mt-1 text-body-sm text-muted">{t('login.subtitle')}</p>
        </div>

        <div data-testid="login-form-wrapper" className="login-form card card--padded">
          <h2 data-testid="login-form-title" className="login-form__title mb-6 text-center text-title-md text-ink">
            {mode === 'login' ? t('login.titleLogin') : t('login.titleRegister')}
          </h2>

          <Message type="error" text={error} />

          <form data-testid="login-form" id="login-form" onSubmit={handleSubmit} noValidate className="login-form__form">
            {mode === 'register' && (
              <FormField
                data-testid="login-name-field"
                label={t('common.name')}
                htmlFor="login-name"
              >
                <Input
                  id="login-name"
                  data-testid="login-name-input"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  maxLength={100}
                  placeholder={t('login.namePlaceholder')}
                  autoFocus
                />
              </FormField>
            )}

            {mode === 'register' && (
              <FormField
                data-testid="login-username-field"
                label={t('login.username')}
                htmlFor="login-username"
              >
                <Input
                  id="login-username"
                  data-testid="login-username-input"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  maxLength={100}
                  placeholder={t('login.usernamePlaceholder')}
                />
              </FormField>
            )}

            {mode === 'login' ? (
              <FormField
                data-testid="login-identifier-field"
                label={t('login.userOrEmail')}
                htmlFor="login-identifier"
              >
                <Input
                  id="login-identifier"
                  data-testid="login-identifier-input"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  required
                  autoFocus
                  placeholder={t('login.userOrEmailPlaceholder')}
                />
              </FormField>
            ) : (
              <FormField
                data-testid="login-email-field"
                label={t('common.email')}
                htmlFor="login-email"
              >
                <Input
                  id="login-email"
                  data-testid="login-email-input"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder={t('login.emailPlaceholder')}
                />
              </FormField>
            )}

            <FormField
              data-testid="login-password-field"
              label={t('common.password')}
              htmlFor="login-password"
            >
              <Input
                id="login-password"
                data-testid="login-password-input"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                placeholder={t('login.passwordPlaceholder')}
              />
            </FormField>

            {mode === 'register' && (
              <FormField
                data-testid="login-confirm-password-field"
                label={t('login.confirmPassword')}
                htmlFor="login-confirm-password"
              >
                <Input
                  id="login-confirm-password"
                  data-testid="login-confirm-password-input"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={6}
                  placeholder={t('login.confirmPasswordPlaceholder')}
                />
              </FormField>
            )}

            <Button
              data-testid="login-submit-btn"
              type="submit"
              loading={loading}
              className="login-form__submit-btn w-full"
            >
              {mode === 'login' ? t('login.login') : t('login.register')}
            </Button>
          </form>

          <button
            data-testid="login-toggle-mode-btn"
            type="button"
            className="login-form__toggle-btn mt-5 w-full text-center text-body-sm font-semibold text-ink underline-offset-4 hover:underline"
            onClick={toggleMode}
          >
            {mode === 'login' ? t('login.toRegister') : t('login.toLogin')}
          </button>
        </div>
      </div>
    </div>
  )
}