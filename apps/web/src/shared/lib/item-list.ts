import type { ItemId, Page, PageQuery, Placement } from '@picker/contracts'
import {
  infiniteQueryOptions,
  keepPreviousData,
  type InfiniteData,
  type QueryClient,
  type QueryKey,
} from '@tanstack/react-query'

type Cursor = PageQuery['after']
export type Pages = InfiniteData<Page, Cursor>
export type ListKey = [family: string, query: string]

export interface ItemList {
  ids: ItemId[]
  total: number
}

/**
 * Преобразует структуру бесконечного запроса в плоский список.
 * Собирает все ID со всех страниц в один одномерный массив, удаляет дубликаты
 * с помощью Set и берет общее количество элементов (total) из последней страницы.
 */
const toItemList = (data: Pages): ItemList => ({
  ids: [...new Set(data.pages.flatMap((page) => page.ids))],
  total: data.pages.at(-1)!.total,
})

/**
 * Вычисляет курсор для загрузки следующей страницы.
 * Если на бэкенде еще есть данные (hasMore), берет ID последнего элемента
 * из самой последней непустой страницы списка. Если данных больше нет - возвращает undefined.
 */
const getNextPageParam = (lastPage: Page, pages: Page[]): Cursor | undefined =>
  lastPage.hasMore ? (pages.findLast((page) => page.ids.length > 0)?.ids.at(-1) ?? null) : undefined

/** Генерирует дефолтные опции для бесконечного запроса TanStack Query */
export const itemListOptions = (
  queryKey: ListKey,
  fetchPage: (page: PageQuery, signal: AbortSignal) => Promise<Page>,
) =>
  infiniteQueryOptions({
    queryKey,
    queryFn: ({ pageParam, signal }) => fetchPage({ query: queryKey[1], after: pageParam }, signal),
    initialPageParam: null as Cursor,
    getNextPageParam,
    placeholderData: keepPreviousData,
    select: toItemList,
    gcTime: 0,
  })

/**
 * Обновляет кэш семейства списков.
 * 1. Отменяет текущие активные сетевые запросы для этого семейства списков, чтобы избежать гонки данных.
 * 2. Перебирает все списки в кэше и применяет к их данным функцию-модификатор patch.
 */
export async function patchLists(
  queryClient: QueryClient,
  family: QueryKey,
  patch: (data: Pages, query: string) => Pages,
): Promise<void> {
  await queryClient.cancelQueries({
    queryKey: family,
    predicate: (query) => query.state.data !== undefined,
  })
  for (const [key, data] of queryClient.getQueriesData<Pages>({ queryKey: family })) {
    if (data) queryClient.setQueryData(key, patch(data, (key as ListKey)[1]))
  }
}

/**
 * Оставляет у списков семейства только первую страницу и перезапрашивает её.
 * Один запрос вместо N: чтения батчатся раз в секунду, и перезапрос N страниц занял бы N секунд.
 * Пока ответа нет, на экране остаются прежние строки.
 */
export function refreshLists(queryClient: QueryClient, family: QueryKey): Promise<void> {
  queryClient.setQueriesData<Pages>(
    { queryKey: family },
    (data) => data && { pages: data.pages.slice(0, 1), pageParams: data.pageParams.slice(0, 1) },
  )
  return queryClient.invalidateQueries({ queryKey: family })
}

/** Есть ли элемент на загруженных страницах. */
export const contains = (data: Pages, id: ItemId): boolean =>
  data.pages.some((page) => page.ids.includes(id))

/**
 * Вспомогательный хелпер для глубокого копирования и иммутабельного обновления.
 * Проходится мапом по массиву и применяет коллбэк update к каждому элементу.
 */
const mapPages = (data: Pages, update: (page: Page) => Page): Pages => ({
  ...data,
  pages: data.pages.map(update),
})

/**
 * Изменяет счетчик общего количества элементов во всех страницах списка.
 * Используется для синхронизации интерфейса при добавлении (delta = 1) или удалении (delta = -1) элементов.
 */
export const withTotal = (data: Pages, delta: number): Pages =>
  mapPages(data, (page) => ({ ...page, total: page.total + delta }))

/**
 * Иммутабельно удаляет элемент с указанным id из всех страниц кэша.
 * Если страница содержит данный ID, фильтрует её массив ids.
 */
export const without = (data: Pages, id: ItemId): Pages =>
  mapPages(data, (page) =>
    page.ids.includes(id) ? { ...page, ids: page.ids.filter((other) => other !== id) } : page,
  )

/**
 * Добавляет элемент в самый конец списка.
 * Если у последней страницы флаг hasMore === true (значит, на сервере есть еще страницы),
 * функция ничего не делает, так как элемент появится естественным путем при доскролле.
 * Если серверных страниц больше нет, элемент безопасно добавляется в конец последней страницы.
 */
export function withAppended(data: Pages, id: ItemId): Pages {
  const lastPage = data.pages.at(-1)!
  if (lastPage.hasMore) return data
  return { ...data, pages: data.pages.with(-1, { ...lastPage, ids: [...lastPage.ids, id] }) }
}

/**
 * Вставляет элемент в список с сохранением сортировки (по возрастанию ID).
 * Ищет первую страницу и позицию внутри неё, где ID текущего элемента больше вставляемого (other > id).
 * Если позиция найдена, вставляет элемент туда с помощью метода .toSpliced().
 * Если элемент больше всех существующих ID во всех загруженных страницах, делегирует логику функции withAppended.
 */
export function withInsertedInOrder(data: Pages, id: ItemId): Pages {
  for (const [index, page] of data.pages.entries()) {
    const position = page.ids.findIndex((other) => other > id)
    if (position !== -1) {
      return {
        ...data,
        pages: data.pages.with(index, { ...page, ids: page.ids.toSpliced(position, 0, id) }),
      }
    }
  }
  return withAppended(data, id)
}

/**
 * Перемещает элемент относительно другого опорного элемента (anchorId).
 * 1. Сначала удаляет перемещаемый элемент id из его старого места с помощью without.
 * 2. Находит страницу, где лежит элемент anchorId. Если она не найдена - возвращает данные без изменений.
 * 3. Вычисляет индекс вставки в зависимости от флага placement (before или after).
 * 4. Иммутабельно вставляет элемент на новую позицию в найденной странице через .toSpliced().
 */
export function withMoved(data: Pages, id: ItemId, anchorId: ItemId, placement: Placement): Pages {
  const { pages } = without(data, id)
  const index = pages.findIndex((page) => page.ids.includes(anchorId))
  if (index === -1) return data

  const page = pages[index]
  const position = page.ids.indexOf(anchorId) + (placement === 'after' ? 1 : 0)
  return {
    ...data,
    pages: pages.with(index, { ...page, ids: page.ids.toSpliced(position, 0, id) }),
  }
}
