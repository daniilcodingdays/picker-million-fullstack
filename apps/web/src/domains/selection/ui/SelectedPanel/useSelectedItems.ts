import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'
import { isConflict } from '@shared/api/http'
import { itemListOptions } from '@shared/lib/item-list'
import { fetchSelected } from '../../api'
import { selectedKeys } from '../../model/cache'

export function useSelectedItems(query: string) {
  const queryClient = useQueryClient()
  const list = useInfiniteQuery(itemListOptions(selectedKeys.list(query), fetchSelected))
  const cursorLost = isConflict(list.error)

  useEffect(() => {
    if (cursorLost) void queryClient.resetQueries({ queryKey: selectedKeys.list(query) })
  }, [cursorLost, query, queryClient])

  return list
}
