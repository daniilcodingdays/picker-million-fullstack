import {
  matchesQuery,
  type ItemId,
  type MoveRequest,
  type Page,
  type PageQuery,
} from '@picker/contracts'
import type { Catalog } from '../domain/catalog.ts'
import { ItemNotFoundError } from '../domain/errors.ts'
import type { Selection } from '../domain/selection.ts'
import { takePage } from './page.ts'
import type { RequestScheduler } from './scheduler.ts'

export class SelectionService {
  readonly #catalog: Catalog
  readonly #selection: Selection
  readonly #scheduler: RequestScheduler

  constructor(catalog: Catalog, selection: Selection, scheduler: RequestScheduler) {
    this.#catalog = catalog
    this.#selection = selection
    this.#scheduler = scheduler
  }

  listSelected({ query, after }: PageQuery): Promise<Page> {
    return this.#scheduler.read(`selected:${query}:${after}`, () =>
      takePage(
        this.#selection.idsAfter(after),
        (id) => matchesQuery(id, query),
        this.#selection.size,
      ),
    )
  }

  select(id: ItemId): void {
    if (!this.#catalog.has(id)) throw new ItemNotFoundError(id)
    this.#scheduler.write({
      key: `select:${id}`,
      itemIds: [id],
      apply: () => this.#selection.select(id),
    })
  }

  deselect(id: ItemId): void {
    this.#scheduler.write({
      key: `deselect:${id}`,
      itemIds: [id],
      apply: () => this.#selection.deselect(id),
    })
  }

  move(id: ItemId, { anchorId, placement }: MoveRequest): void {
    this.#scheduler.write({
      key: `move:${id}:${placement}:${anchorId}`,
      itemIds: [id, anchorId],
      apply: () => this.#selection.move(id, anchorId, placement),
    })
  }
}
