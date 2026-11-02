export interface ApiSuccess<T = unknown> {
  statusCode: number
  data: T
  message: string
  success: boolean
}

export interface ApiError {
  statusCode: number
  data: null
  message: string
  success: false
  errors?: unknown[]
}

export interface User {
  id: string
  email: string
  name: string
  createdAt?: string
  updatedAt?: string
}

export interface AuthPayload {
  token: string
  user: User
}

export interface Category {
  id: string
  userId: string
  name: string
  createdAt?: string
  updatedAt?: string
}

export type TransactionType = 'expense' | 'income'

export interface Transaction {
  id: string
  userId: string
  categoryId: string
  categoryName?: string
  type: TransactionType
  amount: number
  date: string
  note?: string | null
  createdAt?: string
  updatedAt?: string
}

export interface CreateTransactionBody {
  categoryId: string
  type: TransactionType
  amount: number
  date: string
  note?: string | null
}

export interface UpdateTransactionBody {
  categoryId?: string
  type?: TransactionType
  amount?: number
  date?: string
  note?: string | null
}

export interface CreateCategoryBody {
  name: string
}

export interface PeriodSummary {
  from?: string | null
  to?: string | null
  type?: TransactionType | null
  totalIncome: number
  totalExpense: number
  net: number
  count: number
}

export interface CategorySummaryItem {
  categoryId: string
  name: string
  total: number
  count: number
}

export interface MonthlySummaryItem {
  month: string
  totalIncome: number
  totalExpense: number
  net: number
}

export interface Range {
  start: Date
  end: Date
}

export interface TransactionListQuery {
  from?: string
  to?: string
  type?: TransactionType
  categoryId?: string
  limit?: number
  offset?: number
}

export interface SummaryQuery {
  from?: string
  to?: string
  type?: TransactionType
  categoryId?: string
  year?: number
}

export type DraftKind = 'transaction' | 'category'
export type DraftStatus = 'pending' | 'confirmed' | 'rejected'

export interface TransactionDraftPayload {
  categoryId?: string
  categoryName?: string
  type: TransactionType
  amount: number
  date: string
  note?: string | null
}

export interface CategoryDraftPayload {
  name: string
}

export type DraftPayload = TransactionDraftPayload | CategoryDraftPayload

export interface Draft {
  id: string
  userId: string
  kind: DraftKind
  status: DraftStatus
  payload: DraftPayload
  source: string
  confirmedAt?: string | null
  rejectedAt?: string | null
  createdAt: string
  updatedAt: string
}

export interface ConfirmDraftResult {
  draft: Draft
  result: unknown
}
