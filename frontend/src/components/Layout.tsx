import { useState } from 'react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import {
  ArrowUpDown,
  CreditCard,
  LayoutDashboard,
  LogOut,
  Menu,
  PiggyBank,
  Plus,
  Settings,
  TrendingUp,
  Wallet,
  X,
  type LucideIcon,
} from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { cn } from '../utils/cn'
import { t } from '../i18n'
import { QuickCapture } from './QuickCapture'

interface NavItem {
  to: string
  label: string
  key: string
  icon: LucideIcon
}

const mainNav: NavItem[] = [
  { to: '/', label: 'layout.navDashboard', key: 'dashboard', icon: LayoutDashboard },
  { to: '/gastos', label: 'layout.navExpenses', key: 'expenses', icon: ArrowUpDown },
  { to: '/reservas', label: 'layout.navSavings', key: 'savings', icon: PiggyBank },
  { to: '/cartoes', label: 'layout.navCards', key: 'cards', icon: CreditCard },
  { to: '/planejamento', label: 'layout.navPlanning', key: 'planning', icon: TrendingUp },
]

const userNav: NavItem[] = [
  { to: '/contas', label: 'layout.navAccounts', key: 'accounts', icon: Wallet },
  { to: '/categorias', label: 'layout.navCategories', key: 'categories', icon: Settings },
  { to: '/transferencias', label: 'layout.navTransfers', key: 'transfers', icon: ArrowUpDown },
]

export function Layout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [quickCaptureOpen, setQuickCaptureOpen] = useState(false)

  const initials = (user?.name ?? 'U').trim().charAt(0).toUpperCase()

  function handleLogout() {
    logout()
    navigate('/login')
  }

  function closeMenus() {
    setMobileMenuOpen(false)
    setUserMenuOpen(false)
  }

  return (
    <div className="layout flex min-h-screen flex-col bg-canvas">
      {mobileMenuOpen && (
        <div
          data-testid="layout-mobile-overlay"
          className="fixed inset-0 z-30 bg-ink/30 backdrop-blur-sm lg:hidden"
          onClick={closeMenus}
          aria-hidden="true"
        />
      )}

      <header data-testid="layout-topnav" id="layout-topnav" className="layout__topnav top-nav">
        <div className="top-nav-inner layout__topnav-inner">
          <div className="flex items-center gap-4">
            <button
              type="button"
              data-testid="layout-topnav-menu-btn"
              className="btn-ghost btn-icon lg:hidden"
              onClick={() => setMobileMenuOpen(true)}
              aria-label={t('layout.openMenu')}
            >
              <Menu size={22} />
            </button>

            <NavLink
              data-testid="layout-topnav-brand"
              to="/"
              className="top-nav-brand layout__topnav-brand"
              aria-label={t('layout.brandAria')}
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-600">
                <Wallet size={20} className="text-inverse" />
              </div>
              <span className="hidden sm:block">{t('common.brand')}</span>
            </NavLink>
          </div>

          <nav data-testid="layout-topnav-nav" className="top-nav-links layout__topnav-nav" aria-label={t('layout.mainNavigation')}>
            {mainNav.map((link) => {
              const Icon = link.icon
              const isActive = location.pathname === link.to || location.pathname.startsWith(link.to + '/')
              return (
                <NavLink
                  key={link.to}
                  to={link.to}
                  data-testid={`layout-topnav-nav-${link.key}`}
                  className={cn('top-nav-link layout__topnav-link', isActive && 'top-nav-link-active layout__topnav-link--active')}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <Icon size={18} className="shrink-0" aria-hidden="true" />
                  <span>{t(link.label)}</span>
                </NavLink>
              )
            })}
          </nav>

          <div className="top-nav-user layout__topnav-user">
            <div className="hidden sm:block text-right">
              <p className="text-body-sm font-medium text-ink">{user?.name}</p>
              <p className="text-caption text-muted">{user?.email}</p>
            </div>

            <div className="relative">
              <button
                type="button"
                data-testid="layout-topnav-user-menu-btn"
                id="layout-topnav-user-menu-btn"
                className="top-nav-avatar layout__topnav-user-menu-btn"
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                aria-expanded={userMenuOpen}
                aria-haspopup="true"
                aria-label={t('layout.userMenu')}
              >
                {initials}
              </button>

              {userMenuOpen && (
                <>
                  <div
                    data-testid="layout-topnav-user-dropdown-overlay"
                    className="fixed inset-0 z-40"
                    onClick={closeMenus}
                    aria-hidden="true"
                  />
                  <div
                    data-testid="layout-topnav-user-dropdown"
                    id="layout-topnav-user-dropdown"
                    className="absolute right-0 mt-2 w-56 rounded-xl border border-hairline bg-surface shadow-dropdown py-2 layout__topnav-user-dropdown"
                  >
                    <div className="px-4 py-3 border-b border-hairline">
                      <p className="text-body-sm font-semibold text-ink truncate">{user?.name}</p>
                      <p className="text-caption text-muted truncate">{user?.email}</p>
                    </div>
                    <nav className="py-2" aria-label={t('layout.userMenu')}>
                      {userNav.map((link) => {
                        const Icon = link.icon
                        const isActive = location.pathname === link.to || location.pathname.startsWith(link.to + '/')
                        return (
                          <NavLink
                            key={link.to}
                            to={link.to}
                            onClick={closeMenus}
                            data-testid={`layout-topnav-user-dropdown-nav-${link.key}`}
                            className={cn('flex items-center gap-3 px-4 py-2.5 text-body-sm font-medium transition-colors duration-fast layout__topnav-user-dropdown-link', isActive ? 'text-primary-700 bg-primary-50' : 'text-muted hover:text-ink hover:bg-surfaceHover')}
                          >
                            <Icon size={18} className="shrink-0" aria-hidden="true" />
                            {t(link.label)}
                          </NavLink>
                        )
                      })}
                      <hr className="my-2 border-hairline" />
                      <button
                        type="button"
                        data-testid="layout-topnav-user-logout-btn"
                        onClick={handleLogout}
                        className={cn('flex w-full items-center gap-3 px-4 py-2.5 text-body-sm font-medium text-expense-600 transition-colors duration-fast hover:bg-surfaceHover layout__topnav-user-logout-btn')}
                      >
                        <LogOut size={18} className="shrink-0" aria-hidden="true" />
                        {t('layout.logout')}
                      </button>
                    </nav>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      <aside
        data-testid="layout-sidebar"
        id="layout-sidebar"
        className={cn(
          'layout__sidebar fixed inset-y-0 left-0 z-40 w-64 border-r border-hairline bg-surface transition-transform duration-300 ease-smooth lg:hidden',
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full',
        )}
        aria-label={t('layout.sideMenu')}
      >
        <div className="flex h-16 items-center justify-between px-4 border-b border-hairline lg:hidden">
          <span className="text-title-sm font-semibold text-ink">{t('layout.menuHeading')}</span>
          <button
            type="button"
            data-testid="layout-sidebar-close-btn"
            className="btn-ghost btn-icon"
            onClick={closeMenus}
            aria-label={t('layout.closeMenu')}
          >
            <X size={20} />
          </button>
        </div>

        <nav data-testid="layout-sidebar-nav" className="layout__sidebar-nav flex-1 overflow-y-auto px-3 py-4 space-y-1" aria-label={t('layout.mainNavigation')}>
          {mainNav.map((link) => {
            const Icon = link.icon
            const isActive = location.pathname === link.to || location.pathname.startsWith(link.to + '/')
            return (
              <NavLink
                key={link.to}
                to={link.to}
                onClick={closeMenus}
                data-testid={`layout-sidebar-nav-${link.key}`}
                className={cn('sidebar-link layout__sidebar-link', isActive && 'sidebar-link-active layout__sidebar-link--active')}
                aria-current={isActive ? 'page' : undefined}
              >
                <Icon size={20} className="shrink-0" aria-hidden="true" />
                <span>{t(link.label)}</span>
              </NavLink>
            )
          })}

          <div className="my-4 border-t border-hairline" />

          {userNav.map((link) => {
            const Icon = link.icon
            const isActive = location.pathname === link.to || location.pathname.startsWith(link.to + '/')
            return (
              <NavLink
                key={link.to}
                to={link.to}
                onClick={closeMenus}
                data-testid={`layout-sidebar-nav-${link.key}`}
                className={cn('sidebar-link layout__sidebar-link', isActive && 'sidebar-link-active layout__sidebar-link--active')}
                aria-current={isActive ? 'page' : undefined}
              >
                <Icon size={20} className="shrink-0" aria-hidden="true" />
                <span>{t(link.label)}</span>
              </NavLink>
            )
          })}
        </nav>

        <div className="border-t border-hairline p-4 lg:hidden">
          <button
            type="button"
            data-testid="layout-sidebar-logout-btn"
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-body-sm font-medium text-expense-600 transition-colors hover:bg-surfaceHover"
          >
            <LogOut size={18} />
            {t('layout.logout')}
          </button>
        </div>
      </aside>

      <main data-testid="layout-main" id="main-content" className="layout__main page-container flex-1" role="main">
        <div className="page-content">
          <Outlet />
        </div>
      </main>

      <button
        type="button"
        data-testid="layout-fab-mobile"
        id="layout-fab-mobile"
        className="btn-fab lg:hidden layout__fab--mobile"
        aria-label={t('layout.newTransaction')}
        onClick={() => setQuickCaptureOpen(true)}
      >
        <Plus size={24} />
      </button>

      <button
        type="button"
        data-testid="layout-fab-desktop"
        id="layout-fab-desktop"
        className="hidden btn-fab lg:flex layout__fab--desktop"
        aria-label={t('layout.newTransaction')}
        onClick={() => setQuickCaptureOpen(true)}
      >
        <Plus size={24} />
      </button>

      <QuickCapture
        isOpen={quickCaptureOpen}
        onClose={() => setQuickCaptureOpen(false)}
        onSuccess={() => setQuickCaptureOpen(false)}
      />
    </div>
  )
}