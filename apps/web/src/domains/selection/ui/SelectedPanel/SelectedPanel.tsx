import type { ItemId } from '@picker/contracts'
import { Panel } from '@picker/ui'
import { formatCount } from '@shared/lib/format'
import { useFilter } from '@shared/lib/use-filter'
import { FilterField } from '@shared/ui/FilterField/FilterField'
import type { MoveCommand } from '../../api'
import { useSelectedItems } from './useSelectedItems'
import { SortableItemList } from '../SortableItemList/SortableItemList'

interface SelectedPanelProps {
  onDeselect: (id: ItemId) => void
  onMove: (command: MoveCommand) => void
  className?: string
}

export function SelectedPanel({ onDeselect, onMove, className }: SelectedPanelProps) {
  const filter = useFilter()
  const list = useSelectedItems(filter.query)

  return (
    <Panel
      className={className}
      heading="Выбранные"
      count={formatCount(list.data?.total)}
      toolbar={
        <FilterField
          disabled={!filter.value && list.data?.ids.length === 0}
          value={filter.value}
          onChange={filter.setValue}
          busy={list.isPlaceholderData}
        />
      }
    >
      <SortableItemList list={list} query={filter.query} onDeselect={onDeselect} onMove={onMove} />
    </Panel>
  )
}
