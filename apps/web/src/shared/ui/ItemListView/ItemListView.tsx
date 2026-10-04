import type { ItemId } from '@picker/contracts'
import { Button, EmptyState, Spinner, VirtualList, type EmptyStateProps } from '@picker/ui'
import type { UseInfiniteQueryResult } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import type { ItemList } from '../../lib/item-list'
import { ListSkeleton } from './ListSkeleton'
import { LIST_ITEM_ROW_HEIGHT } from './constants'
import styles from './ItemListView.module.scss'

interface ItemListViewProps {
  list: UseInfiniteQueryResult<ItemList>
  query: string
  emptyState: EmptyStateProps
  renderItem: (id: ItemId) => ReactNode
  ids?: ItemId[]
  pinnedIndex?: number
}

export function ItemListView({
  list,
  query,
  emptyState,
  renderItem,
  ids,
  pinnedIndex,
}: ItemListViewProps) {
  const {
    data,
    isError,
    refetch,
    isPlaceholderData,
    hasNextPage,
    isFetching,
    isFetchNextPageError,
    fetchNextPage,
  } = list

  if (!data || (isPlaceholderData && data.ids.length === 0)) {
    return isError ? (
      <EmptyState
        icon="CloudOff"
        title="Не удалось загрузить список"
        action={
          <Button variant="secondary" size="sm" onClick={() => refetch()}>
            Повторить
          </Button>
        }
      />
    ) : (
      <ListSkeleton />
    )
  }

  if (data.ids.length === 0 && !hasNextPage) {
    return query ? (
      <EmptyState
        icon="SearchX"
        title="Ничего не найдено"
        description={`Нет ID, содержащих "${query}"`}
      />
    ) : (
      <EmptyState {...emptyState} />
    )
  }

  let footer
  if (hasNextPage) {
    footer = isFetchNextPageError ? (
      <div className={styles.status}>
        Не удалось загрузить
        <Button variant="secondary" size="sm" onClick={() => fetchNextPage()}>
          Повторить
        </Button>
      </div>
    ) : (
      <div className={styles.status}>
        <Spinner />
      </div>
    )
  }

  return (
    <div className={styles.list} inert={isPlaceholderData}>
      <VirtualList
        key={query}
        items={ids ?? data.ids}
        getKey={(id) => id}
        renderItem={renderItem}
        itemHeight={LIST_ITEM_ROW_HEIGHT}
        footer={footer}
        onEndReached={
          hasNextPage && !isFetching && !isFetchNextPageError ? fetchNextPage : undefined
        }
        pinnedIndex={pinnedIndex}
      />
    </div>
  )
}
