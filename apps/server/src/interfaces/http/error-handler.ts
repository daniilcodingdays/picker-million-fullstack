import type { ErrorResponse } from '@picker/contracts'
import type { ErrorRequestHandler, RequestHandler } from 'express'
import { ZodError, z } from 'zod'
import {
  CursorNotFoundError,
  DuplicateItemError,
  ItemNotFoundError,
  QueueOverflowError,
} from '../../domain/errors.ts'

export const notFound: RequestHandler = (_req, res) => {
  res.status(404).json({ message: 'Не найдено' } satisfies ErrorResponse)
}

export const errorHandler: ErrorRequestHandler = (error: unknown, _req, res, _next) => {
  const status = getStatus(error)
  if (status === 500) console.error(error)
  if (status === 503) res.set('Retry-After', '1')
  res.status(status).json({ message: getMessage(error, status) } satisfies ErrorResponse)
}

function getStatus(error: unknown): number {
  if (error instanceof ZodError) return 400
  if (error instanceof ItemNotFoundError) return 404
  if (error instanceof DuplicateItemError || error instanceof CursorNotFoundError) return 409
  if (error instanceof QueueOverflowError) return 503
  return hasHttpStatus(error) ? error.status : 500
}

function getMessage(error: unknown, status: number): string {
  if (status === 500 || !(error instanceof Error)) return 'Внутренняя ошибка сервера'
  return error instanceof ZodError ? z.prettifyError(error) : error.message
}

function hasHttpStatus(error: unknown): error is Error & { status: number } {
  return error instanceof Error && 'status' in error && typeof error.status === 'number'
}
