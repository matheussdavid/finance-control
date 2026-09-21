import { Navigate, Route, Routes } from 'react-router-dom'
import { Layout } from '../components/Layout'
import { ProtectedRoute } from './ProtectedRoute'
import { LoginPage } from '../pages/LoginPage'
import { DashboardPage } from '../pages/DashboardPage'
import { SpendPage } from '../pages/SpendPage'
import { SavingsPage } from '../pages/SavingsPage'
import { CreditCardsPage } from '../pages/CreditCardsPage'
import { PlanningPage } from '../pages/PlanningPage'
import { AccountsPage } from '../pages/AccountsPage'
import { CategoriesPage } from '../pages/CategoriesPage'
import { TransfersPage } from '../pages/TransfersPage'

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<LoginPage />} />
      <Route
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<DashboardPage />} />
        <Route path="/gastos" element={<SpendPage />} />
        <Route path="/reservas" element={<SavingsPage />} />
        <Route path="/cartoes" element={<CreditCardsPage />} />
        <Route path="/planejamento" element={<PlanningPage />} />
        <Route path="/contas" element={<AccountsPage />} />
        <Route path="/categorias" element={<CategoriesPage />} />
        <Route path="/transferencias" element={<TransfersPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}