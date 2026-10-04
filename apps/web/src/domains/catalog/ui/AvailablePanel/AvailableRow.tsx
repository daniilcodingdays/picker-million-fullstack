import type { ItemId } from '@picker/contracts'
import { Icon, ListItem } from '@picker/ui'
import { memo, type MouseEvent } from 'react'
import { ItemLabel } from '@shared/ui/ItemLabel/ItemLabel'

interface AvailableRowProps {
  id: ItemId
  query: string
  onSelect: (id: ItemId) => void
}

export const AvailableRow = memo(function ({ id, query, onSelect }: AvailableRowProps) {
  const handleClick = (event: MouseEvent) => {
    if (event.detail > 1) return
    onSelect(id)
  }

  return (
    <ListItem onClick={handleClick} trailing={<Icon name="ArrowRight" />}>
      <ItemLabel id={id} query={query} />
    </ListItem>
  )
})
