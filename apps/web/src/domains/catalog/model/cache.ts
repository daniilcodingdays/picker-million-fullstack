import { matchesQuery, type ItemId } from '@picker/contracts'
import type { QueryClient } from '@tanstack/react-query'
import {
  contains,
  patchLists,
  withInsertedInOrder,
  withTotal,
  type ListKey,
} from '@shared/lib/item-list'

export const availableKeys = {
  all: ['available'] as const,
  list: (query: string): ListKey => ['available', query],
}

export const showAvailable = (queryClient: QueryClient, id: ItemId) =>
  patchLists(queryClient, availableKeys.all, (data, query) => {
    if (contains(data, id)) return data
    return withTotal(matchesQuery(id, query) ? withInsertedInOrder(data, id) : data, 1)
  })
