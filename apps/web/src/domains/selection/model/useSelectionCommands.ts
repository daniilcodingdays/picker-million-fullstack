import { useMutation, useQueryClient } from '@tanstack/react-query'
import { availableKeys, showAvailable } from '../../catalog/model/cache'
import { deselectItem, moveItem, selectItem } from '../api'
import { hideSelected, moveSelected, selectedKeys, showSelected, hideAvailable } from './cache'

export const selectionCommandKey = ['selection-command']
const scope = { id: 'selection' }

export function useSelectionCommands() {
  const queryClient = useQueryClient()

  const resync = () =>
    Promise.all(
      [availableKeys.all, selectedKeys.all].map((queryKey) =>
        queryClient.resetQueries({ queryKey }),
      ),
    )

  const { mutate: select } = useMutation({
    mutationKey: selectionCommandKey,
    scope,
    mutationFn: selectItem,
    onMutate: (id) => Promise.all([hideAvailable(queryClient, id), showSelected(queryClient, id)]),
    onError: resync,
  })

  const { mutate: deselect } = useMutation({
    mutationKey: selectionCommandKey,
    scope,
    mutationFn: deselectItem,
    onMutate: (id) => Promise.all([hideSelected(queryClient, id), showAvailable(queryClient, id)]),
    onError: resync,
  })

  const { mutate: move } = useMutation({
    mutationKey: selectionCommandKey,
    scope,
    mutationFn: moveItem,
    onMutate: (command) => moveSelected(queryClient, command),
    onError: resync,
  })

  return { select, deselect, move }
}
