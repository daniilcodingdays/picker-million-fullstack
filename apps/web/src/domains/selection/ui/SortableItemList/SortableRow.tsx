import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { ItemId } from '@picker/contracts'
import { Button, ListItem } from '@picker/ui'
import clsx from 'clsx'
import { memo, type MouseEvent } from 'react'
import { ItemLabel } from '@shared/ui/ItemLabel/ItemLabel'
import styles from './SortableItemList.module.scss'

interface SortableRowProps {
  id: ItemId
  query: string
  onDeselect: (id: ItemId) => void
  isDragDisabled: boolean
}

export const SortableRow = memo(function ({
  isDragDisabled,
  id,
  query,
  onDeselect,
}: SortableRowProps) {
  const { setNodeRef, setActivatorNodeRef, listeners, transform, transition, isDragging } =
    useSortable({ id })

  const handleDeselect = (event: MouseEvent) => {
    if (event.detail > 1) return
    onDeselect(id)
  }

  return (
    <div
      ref={setNodeRef}
      className={clsx(styles.row, isDragging && styles.placeholder)}
      style={{ transform: CSS.Translate.toString(transform), transition }}
    >
      <ListItem
        leading={
          !isDragDisabled && (
            <Button
              ref={setActivatorNodeRef}
              variant="ghost"
              size="sm"
              icon="GripVertical"
              className={styles.handle}
              title="Перетащите, чтобы изменить порядок"
              {...listeners}
            />
          )
        }
        trailing={
          <Button
            variant="danger"
            size="sm"
            icon="X"
            title="Убрать из выбранных"
            onClick={handleDeselect}
          />
        }
      >
        <ItemLabel id={id} query={query} />
      </ListItem>
    </div>
  )
})
