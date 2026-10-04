import { matchesQuery, type ItemId } from '@picker/contracts'
import type { QueryClient } from '@tanstack/react-query'
import {
  contains,
  patchLists,
  withAppended,
  withMoved,
  without,
  withTotal,
  type ListKey,
} from '@shared/lib/item-list'
import { availableKeys } from '@domains/catalog'
import type { MoveCommand } from '../api'

export const selectedKeys = {
  all: ['selected'] as const,
  list: (query: string): ListKey => ['selected', query],
}

export const showSelected = (queryClient: QueryClient, id: ItemId) =>
  patchLists(queryClient, selectedKeys.all, (data, query) => {
    if (contains(data, id)) return data
    return withTotal(matchesQuery(id, query) ? withAppended(data, id) : data, 1)
  })

export const hideSelected = (queryClient: QueryClient, id: ItemId) =>
  patchLists(queryClient, selectedKeys.all, (data) => withTotal(without(data, id), -1))

export const moveSelected = (queryClient: QueryClient, { id, anchorId, placement }: MoveCommand) =>
  patchLists(queryClient, selectedKeys.all, (data) => withMoved(data, id, anchorId, placement))

export const hideAvailable = (queryClient: QueryClient, id: ItemId) =>
  patchLists(queryClient, availableKeys.all, (data) => withTotal(without(data, id), -1))
