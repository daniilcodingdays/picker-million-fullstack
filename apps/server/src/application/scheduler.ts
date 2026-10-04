import type { ItemId } from '@picker/contracts'
import { BatchQueue } from './batch-queue.ts'

export interface SchedulerOptions {
  batchIntervalMs: number
  additionsIntervalMs: number
  queueCapacity: number
  readSliceMs: number
}

export interface WriteCommand {
  key: string
  itemIds: ItemId[]
  apply(): void
}

export class RequestScheduler {
  readonly #reads: BatchQueue
  readonly #writes: BatchQueue
  readonly #additions: BatchQueue
  readonly #batchIntervalMs: number
  readonly #additionsIntervalMs: number
  readonly #ticksPerAdditionsBatch: number
  readonly #readSliceMs: number
  readonly #lastWriteByItem = new Map<ItemId, string>()
  #isReading = false
  #startedAt = 0
  #tickCount = 0
  #nextAdditionsAt = 0
  #timer: NodeJS.Timeout | undefined

  constructor({
    batchIntervalMs,
    additionsIntervalMs,
    queueCapacity,
    readSliceMs,
  }: SchedulerOptions) {
    this.#batchIntervalMs = batchIntervalMs
    this.#additionsIntervalMs = additionsIntervalMs
    this.#ticksPerAdditionsBatch = additionsIntervalMs / batchIntervalMs
    this.#readSliceMs = readSliceMs
    this.#reads = new BatchQueue(queueCapacity)
    this.#writes = new BatchQueue(queueCapacity)
    this.#additions = new BatchQueue(queueCapacity)
  }

  get msUntilNextAdditions(): number {
    return Math.max(0, Math.round(this.#nextAdditionsAt - performance.now()))
  }

  read<T>(key: string, run: () => T): Promise<T> {
    return this.#reads.enqueue(run, key)
  }

  write({ key, itemIds, apply }: WriteCommand): void {
    const repeatsLastCommand = itemIds.every((id) => this.#lastWriteByItem.get(id) === key)
    if (repeatsLastCommand) return

    this.#writes.enqueue(apply).catch(reportFailure)
    for (const id of itemIds) this.#lastWriteByItem.set(id, key)
  }

  add(key: string, run: () => void): void {
    this.#additions.enqueue(run, key).catch(reportFailure)
  }

  start(): void {
    this.#startedAt = performance.now()
    this.#nextAdditionsAt = this.#startedAt + this.#additionsIntervalMs
    this.#scheduleNextTick()
  }

  stop(): void {
    clearTimeout(this.#timer)
    for (const queue of [this.#additions, this.#writes, this.#reads]) {
      queue.startBatch()
      queue.processBatch()
    }
  }

  #scheduleNextTick(): void {
    const nextTickAt = this.#startedAt + (this.#tickCount + 1) * this.#batchIntervalMs
    this.#timer = setTimeout(() => this.#runTick(), Math.max(0, nextTickAt - performance.now()))
  }

  #runTick(): void {
    this.#tickCount += 1
    if (this.#tickCount % this.#ticksPerAdditionsBatch === 0) {
      this.#additions.startBatch()
      this.#additions.processBatch()
      this.#nextAdditionsAt += this.#additionsIntervalMs
    }

    this.#writes.startBatch()
    this.#writes.processBatch()
    this.#lastWriteByItem.clear()

    this.#reads.startBatch()
    if (!this.#isReading) this.#processReads()
    this.#scheduleNextTick()
  }

  /**
   * Операции чтения дорогие (фильтр по миллиону ID), поэтому батч выполняется частями по readSliceMs
   * Между частями сервер принимает новые запросы и отвечает на команды, а не ждёт конца батча
   */
  #processReads(): void {
    const isBatchDone = this.#reads.processBatch(this.#readSliceMs)
    this.#isReading = !isBatchDone
    if (!isBatchDone) setImmediate(() => this.#processReads())
  }
}

function reportFailure(error: unknown): void {
  console.error('Не удалось выполнить пакетную операцию', error)
}
