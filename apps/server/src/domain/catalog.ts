import { matchesQuery, type ItemId } from '@picker/contracts'
import { DuplicateItemError } from './errors.ts'

export class Catalog {
  readonly #seedSize: number
  readonly #cellWidth: number
  readonly #seedText: string
  readonly #addedIds = new Set<ItemId>()
  readonly #addedIdsInOrder: ItemId[] = []
  #hasUnsortedIds = false

  constructor(seedSize: number) {
    this.#seedSize = seedSize
    this.#cellWidth = String(seedSize).length + 1
    this.#seedText = Array.from({ length: seedSize }, (_, index) =>
      String(index + 1).padStart(this.#cellWidth),
    ).join('')
  }

  get size(): number {
    return this.#seedSize + this.#addedIds.size
  }

  has(id: ItemId): boolean {
    return (id >= 1 && id <= this.#seedSize) || this.#addedIds.has(id)
  }

  add(id: ItemId): void {
    if (this.has(id)) throw new DuplicateItemError(id)
    this.#addedIds.add(id)
    this.#addedIdsInOrder.push(id)
    this.#hasUnsortedIds = true
  }

  *idsAfter(after: ItemId | null, query: string): Generator<ItemId> {
    const firstId = (after ?? 0) + 1
    yield* this.#seedIdsFrom(firstId, query)

    const addedIds = this.#sortedAddedIds()
    for (let index = findInsertIndex(addedIds, firstId); index < addedIds.length; index++) {
      if (matchesQuery(addedIds[index], query)) yield addedIds[index]
    }
  }

  #sortedAddedIds(): ItemId[] {
    if (this.#hasUnsortedIds) {
      this.#addedIdsInOrder.sort((a, b) => a - b)
      this.#hasUnsortedIds = false
    }
    return this.#addedIdsInOrder
  }

  *#seedIdsFrom(firstId: ItemId, query: string): Generator<ItemId> {
    if (query === '') {
      for (let id = firstId; id <= this.#seedSize; id++) yield id
      return
    }

    let position = (firstId - 1) * this.#cellWidth
    while (true) {
      const foundAt = this.#seedText.indexOf(query, position)
      if (foundAt === -1) return

      const id = Math.floor(foundAt / this.#cellWidth) + 1
      yield id
      position = id * this.#cellWidth
    }
  }
}

function findInsertIndex(sorted: number[], value: number): number {
  let low = 0
  let high = sorted.length
  while (low < high) {
    const middle = Math.floor((low + high) / 2)
    if (sorted[middle] < value) {
      low = middle + 1
    } else {
      high = middle
    }
  }
  return low
}
