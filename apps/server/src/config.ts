import type { SchedulerOptions } from './application/scheduler.ts'

export const CONFIG = {
  port: Number(process.env.PORT ?? 3000),
  seedSize: 1_000_000,
  batching: {
    batchIntervalMs: 1_000,
    additionsIntervalMs: 10_000,
    queueCapacity: 10_000,
    readSliceMs: 50,
  } satisfies SchedulerOptions,
}
