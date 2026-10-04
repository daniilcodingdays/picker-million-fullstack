import { QueryClient } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import { HttpError } from '../api/http'
import { QueryClientProvider as QueryClientContext } from '@tanstack/react-query'

const MAX_RETRIES = 3
const COMMAND_RETRY_DELAY_MS = 1_000

const isTemporaryFailure = (error: unknown): boolean =>
  !(error instanceof HttpError) || error.status === 503

const initQueryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: Infinity,
      refetchOnWindowFocus: false,
      retry: (failureCount, error) =>
        failureCount < MAX_RETRIES && !(error instanceof HttpError && error.status < 500),
    },
    mutations: {
      retry: (failureCount, error) => failureCount < MAX_RETRIES && isTemporaryFailure(error),
      retryDelay: COMMAND_RETRY_DELAY_MS,
    },
  },
})

export const QueryClientProvider = ({ children }: { children: ReactNode }) => (
  <QueryClientContext client={initQueryClient}>{children}</QueryClientContext>
)
