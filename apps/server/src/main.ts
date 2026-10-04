import path from 'path'
import express from 'express'
import { fileURLToPath } from 'url'
import { CatalogService } from './application/catalog-service.ts'
import { RequestScheduler } from './application/scheduler.ts'
import { SelectionService } from './application/selection-service.ts'
import { CONFIG } from './config.ts'
import { Catalog } from './domain/catalog.ts'
import { Selection } from './domain/selection.ts'
import { createApp } from './interfaces/http/app.ts'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const frontendDist = path.join(__dirname, '../../web/dist')

const catalog = new Catalog(CONFIG.seedSize)
const selection = new Selection()
const scheduler = new RequestScheduler(CONFIG.batching)

const app = createApp({
  catalog: new CatalogService(catalog, selection, scheduler),
  selection: new SelectionService(catalog, selection, scheduler),
})

app.get(/^(?!\/api).*$/, (_, res) => {
  res.sendFile(path.join(frontendDist, 'index.html'))
})

app.use(express.static(frontendDist))

scheduler.start()
const server = app.listen(CONFIG.port, (error) => {
  if (error) throw error
  console.log(`API is listening on http://localhost:${CONFIG.port}`)
})

for (const signal of ['SIGINT', 'SIGTERM']) {
  process.once(signal, () => {
    scheduler.stop()
    server.close()
  })
}
