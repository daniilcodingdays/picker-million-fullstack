import type { ErrorResponse, PageQuery } from '@picker/contracts'

export class HttpError extends Error {
  readonly status: number

  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

export const isConflict = (error: unknown): boolean =>
  error instanceof HttpError && error.status === 409

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  body?: unknown
  signal?: AbortSignal
}

export async function request<T = void>(
  path: string,
  { method = 'GET', body, signal }: RequestOptions = {},
): Promise<T> {
  const response = await fetch(`/api${path}`, {
    method,
    signal,
    headers: body === undefined ? undefined : { 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
  })
  const payload = response.headers.get('Content-Type')?.includes('application/json')
    ? await response.json()
    : undefined

  if (!response.ok) {
    throw new HttpError(
      response.status,
      (payload as ErrorResponse | undefined)?.message ?? response.statusText,
    )
  }
  return payload as T
}

export function withPageQuery(path: string, { query, after }: PageQuery): string {
  const params = new URLSearchParams()
  if (query) params.set('query', query)
  if (after !== null) params.set('after', String(after))
  return params.size ? `${path}?${params}` : path
}
