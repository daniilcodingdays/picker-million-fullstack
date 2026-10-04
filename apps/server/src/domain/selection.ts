import type { ItemId, Placement } from '@picker/contracts'
import { CursorNotFoundError } from './errors.ts'

interface SelectedNode {
  id: ItemId
  previous: SelectedNode | null
  next: SelectedNode | null
}

export class Selection {
  readonly #nodes = new Map<ItemId, SelectedNode>()
  #head: SelectedNode | null = null
  #tail: SelectedNode | null = null

  get size(): number {
    return this.#nodes.size
  }

  has(id: ItemId): boolean {
    return this.#nodes.has(id)
  }

  select(id: ItemId): void {
    if (this.#nodes.has(id)) return

    const node: SelectedNode = { id, previous: null, next: null }
    this.#nodes.set(id, node)
    this.#link(node, this.#tail, null)
  }

  deselect(id: ItemId): void {
    const node = this.#nodes.get(id)
    if (!node) return

    this.#unlink(node)
    this.#nodes.delete(id)
  }

  move(id: ItemId, anchorId: ItemId, placement: Placement): void {
    const node = this.#nodes.get(id)
    const anchor = this.#nodes.get(anchorId)
    if (!node || !anchor || node === anchor) return

    this.#unlink(node)
    if (placement === 'before') this.#link(node, anchor.previous, anchor)
    else this.#link(node, anchor, anchor.next)
  }

  *idsAfter(after: ItemId | null): Generator<ItemId> {
    let node = after === null ? this.#head : this.#nodeOfCursor(after).next
    while (node !== null) {
      yield node.id
      node = node.next
    }
  }

  #nodeOfCursor(id: ItemId): SelectedNode {
    const node = this.#nodes.get(id)
    if (!node) throw new CursorNotFoundError(id)
    return node
  }

  #link(node: SelectedNode, previous: SelectedNode | null, next: SelectedNode | null): void {
    node.previous = previous
    node.next = next
    if (previous === null) this.#head = node
    else previous.next = node
    if (next === null) this.#tail = node
    else next.previous = node
  }

  #unlink({ previous, next }: SelectedNode): void {
    if (previous === null) this.#head = next
    else previous.next = next
    if (next === null) this.#tail = previous
    else next.previous = previous
  }
}
