import { format, startOfMonth, subMonths } from 'date-fns'
import type { Range } from '~/types'

export class MimirApiClientError extends Error {
  statusCode: number

  constructor(message: string, statusCode = 400) {
    super(message)
    this.name = 'MimirApiClientError'
    this.statusCode = statusCode
  }
}

export function formatMoney(value: number, currency = 'USD'): string {
  return value.toLocaleString(undefined, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })
}

/** Current calendar month: first day through today. */
export function thisMonthRange(now = new Date()): Range {
  return {
    start: startOfMonth(now),
    end: now
  }
}

/**
 * Past N calendar months including the current month.
 * e.g. monthCount=2 → start of previous month through today.
 */
export function monthsBackRange(monthCount: number, now = new Date()): Range {
  const count = Math.max(1, monthCount)
  return {
    start: startOfMonth(subMonths(now, count - 1)),
    end: now
  }
}

export function rangeToQuery(range: Range): { from: string, to: string } {
  return {
    from: format(range.start, 'yyyy-MM-dd'),
    to: format(range.end, 'yyyy-MM-dd')
  }
}

export function unwrapMimirResponse<T>(body: unknown): T {
  if (
    body
    && typeof body === 'object'
    && 'success' in body
    && (body as { success: boolean }).success === true
    && 'data' in body
  ) {
    return (body as { data: T }).data
  }

  if (body && typeof body === 'object' && 'message' in body) {
    const err = body as { message?: string, statusCode?: number }
    throw new MimirApiClientError(err.message || 'Request failed', err.statusCode || 400)
  }

  return body as T
}
