import type { AddItemResponse, ItemId, Page, PageQuery } from '@picker/contracts'
import type { Catalog } from '../domain/catalog.ts'
import { DuplicateItemError } from '../domain/errors.ts'
import type { Selection } from '../domain/selection.ts'
import { takePage } from './page.ts'
import type { RequestScheduler } from './scheduler.ts'

export class CatalogService {
  readonly #catalog: Catalog
  readonly #selection: Selection
  readonly #scheduler: RequestScheduler

  constructor(catalog: Catalog, selection: Selection, scheduler: RequestScheduler) {
    this.#catalog = catalog
    this.#selection = selection
    this.#scheduler = scheduler
  }

  listAvailable({ query, after }: PageQuery): Promise<Page> {
    return this.#scheduler.read(`available:${query}:${after}`, () =>
      takePage(
        this.#catalog.idsAfter(after, query),
        (id) => !this.#selection.has(id),
        this.#catalog.size - this.#selection.size,
      ),
    )
  }

  /**
   * Если такой ID уже ждёт батча (например, его добавили в соседней вкладке), запрос присоединяется к нему
   * элемент добавится один раз, и оба клиента получат одно и то же время ожидания
   */
  addItem(id: ItemId): AddItemResponse {
    if (this.#catalog.has(id)) throw new DuplicateItemError(id)

    this.#scheduler.add(String(id), () => this.#catalog.add(id))
    return { appliesInMs: this.#scheduler.msUntilNextAdditions }
  }
}
