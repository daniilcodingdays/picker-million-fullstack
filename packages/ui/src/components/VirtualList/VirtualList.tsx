import { defaultRangeExtractor, useVirtualizer, type Range } from '@tanstack/react-virtual'
import clsx from 'clsx'
import { useCallback, useEffect, useRef, type Key, type ReactNode } from 'react'
import styles from './VirtualList.module.scss'

export interface VirtualListProps<T> {
  items: T[]
  getKey: (item: T) => Key
  renderItem: (item: T) => ReactNode
  itemHeight: number
  footer?: ReactNode
  onEndReached?: () => void
  pinnedIndex?: number
  className?: string
}

const OVERSCAN = 4
const FOOTER_KEY = 'footer'

export function VirtualList<T>({
  items,
  getKey,
  renderItem,
  itemHeight,
  footer,
  onEndReached,
  pinnedIndex,
  className,
}: VirtualListProps<T>) {
  const viewportRef = useRef<HTMLDivElement>(null)
  const count = footer === undefined ? items.length : items.length + 1

  const rangeExtractor = useCallback(
    (range: Range) => {
      const indexes = defaultRangeExtractor(range)
      return pinnedIndex === undefined || indexes.includes(pinnedIndex)
        ? indexes
        : [...indexes, pinnedIndex].sort((a, b) => a - b)
    },
    [pinnedIndex],
  )

  const virtualizer = useVirtualizer({
    count,
    getScrollElement: () => viewportRef.current,
    estimateSize: () => itemHeight,
    getItemKey: (index) => (index < items.length ? getKey(items[index]) : FOOTER_KEY),
    rangeExtractor,
    overscan: OVERSCAN,
  })

  const rows = virtualizer.getVirtualItems()
  const endReached = rows.at(-1)?.index === count - 1

  useEffect(() => {
    if (endReached) onEndReached?.()
  }, [endReached, onEndReached])

  return (
    <div ref={viewportRef} className={clsx(styles.viewport, className)}>
      <div className={styles.canvas} style={{ height: virtualizer.getTotalSize() }}>
        {rows.map((row) => (
          <div
            key={row.key}
            className={styles.row}
            style={{ height: row.size, transform: `translateY(${row.start}px)` }}
          >
            {row.index < items.length ? renderItem(items[row.index]) : footer}
          </div>
        ))}
      </div>
    </div>
  )
}
