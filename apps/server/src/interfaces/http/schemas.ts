import {
  MAX_ID_LENGTH,
  MAX_NUMBER,
  type AddItemRequest,
  type MoveRequest,
  type PageQuery,
} from '@picker/contracts'
import { z } from 'zod'

const itemId = z
  .number({ error: 'Поддерживаются только числа' })
  .int('ID должен быть целым числом')
  .positive('ID должен быть больше нуля')
  .max(MAX_NUMBER, `ID должен быть не длиннее ${MAX_ID_LENGTH} знаков`)

const itemIdParam = z.coerce.number().pipe(itemId)

export const pageQuerySchema = z.object({
  query: z.string().regex(/^\d*$/, 'Ожидаются только цифры').max(MAX_ID_LENGTH).default(''),
  after: itemIdParam.nullable().default(null),
}) satisfies z.ZodType<PageQuery>

export const itemParamsSchema = z.object({ id: itemIdParam })

export const addItemSchema = z.object({ id: itemId }) satisfies z.ZodType<AddItemRequest>

export const moveSchema = z.object({
  anchorId: itemId,
  placement: z.enum(['before', 'after']),
}) satisfies z.ZodType<MoveRequest>
