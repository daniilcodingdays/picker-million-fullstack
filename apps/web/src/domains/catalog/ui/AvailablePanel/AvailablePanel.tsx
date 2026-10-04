import type { ItemId } from '@picker/contracts'
import { Panel } from '@picker/ui'
import { formatCount } from '@shared/lib/format'
import { useFilter } from '@shared/lib/use-filter'
import { FilterField } from '@shared/ui/FilterField/FilterField'
import { ItemListView } from '@shared/ui/ItemListView/ItemListView'
import { useAvailableItems } from './useAvailableItems'
import { AvailableRow } from './AvailableRow'
import { AddItemForm } from '../AddItemForm/AddItemForm'

interface AvailablePanelProps {
  onSelect: (id: ItemId) => void
  className?: string
}

export function AvailablePanel({ onSelect, className }: AvailablePanelProps) {
  const filter = useFilter()
  const list = useAvailableItems(filter.query)

  return (
    <Panel
      className={className}
      heading="Все элементы"
      count={formatCount(list.data?.total)}
      toolbar={
        <FilterField
          disabled={!filter.value && !list.data?.ids.length}
          value={filter.value}
          onChange={filter.setValue}
          busy={list.isPlaceholderData}
        />
      }
      footer={<AddItemForm />}
    >
      <ItemListView
        list={list}
        query={filter.query}
        emptyState={{ icon: 'ListChecks', title: 'Все элементы выбраны' }}
        renderItem={(id) => <AvailableRow id={id} query={filter.query} onSelect={onSelect} />}
      />
    </Panel>
  )
}
