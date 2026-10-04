import { RESOURCE_NAME } from '@picker/contracts'
import express, { type Express, Router } from 'express'
import type { CatalogService } from '../../application/catalog-service.ts'
import type { SelectionService } from '../../application/selection-service.ts'
import { catalogRouter } from './catalog-router.ts'
import { errorHandler, notFound } from './error-handler.ts'
import { selectionRouter } from './selection-router.ts'

export interface Services {
  catalog: CatalogService
  selection: SelectionService
}

function createApiRouter({ catalog, selection }: Services): Router {
  return Router()
    .use(RESOURCE_NAME.ITEMS, catalogRouter(catalog))
    .use(RESOURCE_NAME.SELECTION, selectionRouter(selection))
}

export function createApp(services: Services): Express {
  return express()
    .disable('x-powered-by')
    .use(express.json({ limit: '1kb' }))
    .use('/api', createApiRouter(services))
    .use(notFound)
    .use(errorHandler)
}
