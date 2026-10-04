import type { ItemId } from '@picker/contracts'
import { useMutationState, useMutation, useQueryClient } from '@tanstack/react-query'
import { addItem } from '../../api'
import { showAvailable } from '../../model/cache'

const addItemKey = ['add-item']

export const usePendingAdditions = () =>
  useMutationState({
    filters: { mutationKey: addItemKey, status: 'pending' },
    select: (mutation) => mutation.state.variables as ItemId,
  })

export function useAddItem() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationKey: addItemKey,
    mutationFn: async (id: ItemId) => {
      const { appliesInMs } = await addItem(id)
      await new Promise((resolve) => setTimeout(resolve, appliesInMs))
    },
    onSuccess: (_, id) => showAvailable(queryClient, id),
  })
}