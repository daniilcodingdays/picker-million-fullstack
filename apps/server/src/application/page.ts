import { PAGE_SIZE, type ItemId, type Page } from '@picker/contracts'

export function takePage(
  ids: Iterable<ItemId>,
  accept: (id: ItemId) => boolean,
  total: number,
): Page {
  const found: ItemId[] = []
  for (const id of ids) {
    if (!accept(id)) continue
    found.push(id)
    if (found.length > PAGE_SIZE) break
  }
  return { ids: found.slice(0, PAGE_SIZE), hasMore: found.length > PAGE_SIZE, total }
}
