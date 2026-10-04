import type { ItemId, MoveRequest, Page, PageQuery } from '@picker/contracts'
import { request, withPageQuery } from '@shared/api/http'
import { RESOURCE_NAME } from '@picker/contracts'

export interface MoveCommand extends MoveRequest {
  id: ItemId
}

export const fetchSelected = (page: PageQuery, signal: AbortSignal) =>
  request<Page>(withPageQuery(RESOURCE_NAME.SELECTION, page), { signal })

export const selectItem = (id: ItemId) => request(`${RESOURCE_NAME.SELECTION}/${id}`, { method: 'PUT' })

export const deselectItem = (id: ItemId) =>
  request(`${RESOURCE_NAME.SELECTION}/${id}`, { method: 'DELETE' })

export const moveItem = ({ id, ...move }: MoveCommand) =>
  request(`${RESOURCE_NAME.SELECTION}/${id}`, { method: 'PATCH', body: move satisfies MoveRequest })
