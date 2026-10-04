import type { AddItemRequest, AddItemResponse, ItemId, Page, PageQuery } from '@picker/contracts'
import { request, withPageQuery } from '@shared/api/http'
import { RESOURCE_NAME } from '@picker/contracts'

export const fetchAvailable = (page: PageQuery, signal: AbortSignal) =>
  request<Page>(withPageQuery(RESOURCE_NAME.ITEMS, page), { signal })

export const addItem = (id: ItemId) =>
  request<AddItemResponse>(RESOURCE_NAME.ITEMS, { method: 'POST', body: { id } satisfies AddItemRequest })
