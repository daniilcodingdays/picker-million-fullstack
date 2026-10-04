import {
  DndContext,
  DragOverlay,
  MeasuringStrategy,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import { restrictToVerticalAxis } from '@dnd-kit/modifiers'
import { arrayMove, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import type { ItemId } from '@picker/contracts'
import { Button, ListItem } from '@picker/ui'
import type { UseInfiniteQueryResult } from '@tanstack/react-query'
import { useState } from 'react'
import { createPortal } from 'react-dom'
import type { ItemList } from '@shared/lib/item-list'
import { ItemLabel } from '@shared/ui/ItemLabel/ItemLabel'
import { ItemListView } from '@shared/ui/ItemListView/ItemListView'
import type { MoveCommand } from '../../api'
import { SortableRow } from './SortableRow'
import styles from './SortableItemList.module.scss'

const DRAG_THRESHOLD_PX = 4
const DND_CONTEXT_MODIFIERS = [restrictToVerticalAxis]
const DND_CONTEXT_MEASURING = { droppable: { strategy: MeasuringStrategy.Always } }

interface SortableItemListProps {
  list: UseInfiniteQueryResult<ItemList>
  query: string
  onDeselect: (id: ItemId) => void
  onMove: (command: MoveCommand) => void
}

interface DroppedOrder {
  source: ItemId[] | undefined
  ids: ItemId[]
}

export function SortableItemList({ list, query, onDeselect, onMove }: SortableItemListProps) {
  const [activeId, setActiveId] = useState<ItemId | null>(null)
  const [droppedOrder, setDroppedOrder] = useState<DroppedOrder | null>(null)
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: DRAG_THRESHOLD_PX } }),
  )

  const ids =
    droppedOrder && droppedOrder.source === list.data?.ids
      ? droppedOrder.ids
      : (list.data?.ids ?? [])
  const isDragDisabled = ids.length === 1

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    setActiveId(null)
    if (!over || active.id === over.id) return

    const id = Number(active.id)
    const anchorId = Number(over.id)
    const from = ids.indexOf(id)
    const to = ids.indexOf(anchorId)
    setDroppedOrder({ source: list.data?.ids, ids: arrayMove(ids, from, to) })
    onMove({ id, anchorId, placement: from < to ? 'after' : 'before' })
  }

  return (
    <DndContext
      sensors={sensors}
      modifiers={DND_CONTEXT_MODIFIERS}
      measuring={DND_CONTEXT_MEASURING}
      onDragStart={({ active }) => setActiveId(Number(active.id))}
      onDragEnd={handleDragEnd}
      onDragCancel={() => setActiveId(null)}
    >
      <SortableContext items={ids} strategy={verticalListSortingStrategy}>
        <ItemListView
          list={list}
          query={query}
          emptyState={{
            icon: 'MousePointerClick',
            title: 'Пока ничего не выбрано',
            description: 'Нажмите на элемент в списке всех элементов',
          }}
          ids={ids}
          pinnedIndex={activeId === null ? undefined : ids.indexOf(activeId)}
          renderItem={(id) => (
            <SortableRow
              isDragDisabled={isDragDisabled}
              id={id}
              query={query}
              onDeselect={onDeselect}
            />
          )}
        />
      </SortableContext>
      {createPortal(
        <DragOverlay>
          {activeId !== null && (
            <ListItem
              className={styles.overlay}
              leading={
                <Button
                  variant="ghost"
                  size="sm"
                  icon="GripVertical"
                  className={styles.handle}
                  tabIndex={-1}
                  aria-hidden
                />
              }
            >
              <ItemLabel id={activeId} query={query} />
            </ListItem>
          )}
        </DragOverlay>,
        document.body,
      )}
    </DndContext>
  )
}
