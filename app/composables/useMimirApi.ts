import type {
  ApiSuccess,
  Category,
  CategorySummaryItem,
  ConfirmDraftResult,
  CreateCategoryBody,
  CreateTransactionBody,
  Draft,
  DraftPayload,
  DraftStatus,
  MonthlySummaryItem,
  PeriodSummary,
  SummaryQuery,
  Transaction,
  TransactionListQuery,
  UpdateTransactionBody
} from '~/types'
import { unwrapMimirResponse } from '~/utils/mimir'

type QueryParams = Record<string, string | number | undefined>

function buildQuery(params?: QueryParams): Record<string, string> {
  const query: Record<string, string> = {}
  if (!params) {
    return query
  }
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== '') {
      query[key] = String(value)
    }
  }
  return query
}

async function mimirFetch<T>(path: string, options: {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE'
  body?: unknown
  query?: QueryParams
} = {}): Promise<T> {
  const url = `/api/mimir/${path.replace(/^\//, '')}`
  const body = await $fetch<ApiSuccess<T>>(url, {
    method: options.method || 'GET',
    body: options.body as Record<string, unknown> | undefined,
    query: buildQuery(options.query)
  })
  return unwrapMimirResponse<T>(body)
}

export function useMimirApi() {
  return {
    listCategories: () => mimirFetch<Category[]>('categories'),

    createCategory: (body: CreateCategoryBody) =>
      mimirFetch<Category>('categories', { method: 'POST', body }),

    listTransactions: (query?: TransactionListQuery) =>
      mimirFetch<Transaction[]>('transactions', { query: query as QueryParams }),

    getTransaction: (id: string) =>
      mimirFetch<Transaction>(`transactions/${id}`),

    createTransaction: (body: CreateTransactionBody) =>
      mimirFetch<Transaction>('transactions', { method: 'POST', body }),

    updateTransaction: (id: string, body: UpdateTransactionBody) =>
      mimirFetch<Transaction>(`transactions/${id}`, { method: 'PATCH', body }),

    deleteTransaction: (id: string) =>
      mimirFetch<null>(`transactions/${id}`, { method: 'DELETE' }),

    getPeriodSummary: (query?: SummaryQuery) =>
      mimirFetch<PeriodSummary>('summary', { query: query as QueryParams }),

    getCategorySummary: (query?: SummaryQuery) =>
      mimirFetch<CategorySummaryItem[]>('summary/categories', { query: query as QueryParams }),

    getMonthlySummary: (query: Pick<SummaryQuery, 'year' | 'type'>) =>
      mimirFetch<MonthlySummaryItem[]>('summary/monthly', { query: query as QueryParams }),

    listDrafts: (status: DraftStatus = 'pending') =>
      mimirFetch<Draft[]>('drafts', { query: { status } }),

    getDraft: (id: string) =>
      mimirFetch<Draft>(`drafts/${id}`),

    updateDraft: (id: string, payload: DraftPayload) =>
      mimirFetch<Draft>(`drafts/${id}`, { method: 'PATCH', body: { payload } }),

    confirmDraft: (id: string) =>
      mimirFetch<ConfirmDraftResult>(`drafts/${id}/confirm`, { method: 'POST' }),

    rejectDraft: (id: string) =>
      mimirFetch<Draft>(`drafts/${id}/reject`, { method: 'POST' })
  }
}
