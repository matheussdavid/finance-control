export interface UserSummary {
  id: string
  name: string
  email: string
}

export interface AuthResponse {
  token: string
  user: UserSummary
}

export type AccountType = 'CHECKING' | 'SAVINGS' | 'CASH'
export type Status = 'ACTIVE' | 'INACTIVE'
export type CategoryType = 'INCOME' | 'EXPENSE'
export type TransactionType = 'INCOME' | 'EXPENSE'
export type InvoiceStatus = 'OPEN' | 'CLOSED' | 'PAID'
export type InstallmentStatus = 'OPEN' | 'PAID'

export interface Account {
  id: string
  name: string
  type: AccountType
  initialBalance: number
  balance: number
  status: Status
  createdAt: string
  updatedAt: string | null
}

export interface Category {
  id: string
  name: string
  type: CategoryType
  status: Status
  createdAt: string
  updatedAt: string | null
}

export interface Transaction {
  id: string
  type: TransactionType
  description: string | null
  amount: number
  accountId: string
  accountName: string
  categoryId: string
  categoryName: string
  transactionDate: string
  createdAt: string
}

export interface Transfer {
  id: string
  sourceAccountId: string
  sourceAccountName: string
  destinationAccountId: string
  destinationAccountName: string
  amount: number
  transferDate: string
  description: string | null
  createdAt: string
}

export interface CreditCard {
  id: string
  name: string
  creditLimit: number
  usedLimit: number
  availableLimit: number
  closingDay: number
  dueDay: number
  status: Status
  createdAt: string
  updatedAt: string | null
}

export interface Installment {
  id: string
  invoiceId: string
  referenceMonth: string
  number: number
  amount: number
  status: InstallmentStatus
}

export interface Purchase {
  id: string
  creditCardId: string
  creditCardName: string
  categoryId: string
  categoryName: string
  description: string | null
  totalAmount: number
  installmentsCount: number
  purchaseDate: string
  createdAt: string
  installments: Installment[]
}

export interface Invoice {
  id: string
  creditCardId: string
  creditCardName: string
  referenceMonth: string
  closingDate: string
  dueDate: string
  status: InvoiceStatus
  totalAmount: number
  paidAt: string | null
}

export interface InvoiceInstallment {
  installmentId: string
  purchaseId: string
  purchaseDescription: string | null
  categoryId: string
  categoryName: string
  number: number
  amount: number
  status: InstallmentStatus
}

export interface InvoiceDetail extends Invoice {
  installments: InvoiceInstallment[]
}

export interface Budget {
  id: string
  categoryId: string
  categoryName: string
  month: number
  year: number
  amount: number
  spent: number
  available: number
  createdAt: string
  updatedAt: string | null
}

export interface CategoryExpense {
  categoryId: string
  categoryName: string
  total: number
}

export interface Dashboard {
  totalBalance: number
  income: number
  expenses: number
  totalCreditLimit: number
  totalUsedLimit: number
  totalAvailableLimit: number
  expensesByCategory: CategoryExpense[]
  budgets: Budget[]
  nextInvoice: Invoice | null
}

export interface Page<T> {
  content: T[]
  totalElements: number
  totalPages: number
  number: number
  size: number
}

export interface ApiErrorBody {
  timestamp: string
  status: number
  error: string
  message: string
  path: string
  fields?: Record<string, string>
}
