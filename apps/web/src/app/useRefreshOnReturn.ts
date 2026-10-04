import { focusManager, useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'
import { availableKeys } from '@domains/catalog'
import { selectedKeys, selectionCommandKey } from '@domains/selection'
import { refreshLists } from '@shared/lib/item-list'

export function useRefreshOnReturn() {
  const queryClient = useQueryClient()

  useEffect(
    () =>
      focusManager.subscribe((isFocused) => {
        if (!isFocused || queryClient.isMutating({ mutationKey: selectionCommandKey }) > 0) return
        void refreshLists(queryClient, availableKeys.all)
        void refreshLists(queryClient, selectedKeys.all)
      }),
    [queryClient],
  )
}
