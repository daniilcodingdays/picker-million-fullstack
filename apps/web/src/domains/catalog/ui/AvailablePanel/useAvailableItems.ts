import {
  useInfiniteQuery,
} from '@tanstack/react-query'
import { itemListOptions } from '@shared/lib/item-list'
import { fetchAvailable } from '../../api'
import { availableKeys } from '@domains/catalog'

export const useAvailableItems = (query: string) =>
  useInfiniteQuery(itemListOptions(availableKeys.list(query), fetchAvailable))
