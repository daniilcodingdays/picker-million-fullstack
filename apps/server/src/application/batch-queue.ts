import { QueueOverflowError } from '../domain/errors.ts'

interface Task<T = unknown> {
  key: string | undefined
  run(): T
  resolve(value: T): void
  reject(reason: unknown): void
  promise: Promise<T>
}

export class BatchQueue {
  readonly #capacity: number
  readonly #tasksByKey = new Map<string, Task>()
  #waitingTasks: Task[] = []
  #batchTasks: Task[] = []

  constructor(capacity: number) {
    this.#capacity = capacity
  }

  /** Задача с ключом уже ожидающей задачи не ставится повторно */
  enqueue<T>(run: () => T, key?: string): Promise<T> {
    const pending = key === undefined ? undefined : this.#tasksByKey.get(key)
    if (pending) return pending.promise as Promise<T>
    if (this.#waitingTasks.length + this.#batchTasks.length >= this.#capacity) {
      throw new QueueOverflowError()
    }

    const task: Task<T> = { key, run, ...Promise.withResolvers<T>() }
    this.#waitingTasks.push(task)
    if (key !== undefined) this.#tasksByKey.set(key, task)
    return task.promise
  }

  /** Перенос ожидающих задач в батч. Задачи, пришедшие позже, будут ждать следующего */
  startBatch(): void {
    this.#batchTasks = this.#batchTasks.concat(this.#waitingTasks)
    this.#waitingTasks = []
  }

  /** Выполняет задачи батча по порядку, пока не исчерпан бюджет времени */
  processBatch(timeBudgetMs = Infinity): boolean {
    const startedAt = performance.now()
    let processedCount = 0

    while (
      processedCount < this.#batchTasks.length &&
      performance.now() - startedAt < timeBudgetMs
    ) {
      const task = this.#batchTasks[processedCount]
      processedCount += 1
      if (task.key !== undefined) this.#tasksByKey.delete(task.key)

      try {
        task.resolve(task.run())
      } catch (error) {
        task.reject(error)
      }
    }

    this.#batchTasks = this.#batchTasks.slice(processedCount)
    return this.#batchTasks.length === 0
  }
}
