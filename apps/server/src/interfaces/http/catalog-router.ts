import { Router } from 'express'
import type { CatalogService } from '../../application/catalog-service.ts'
import { addItemSchema, pageQuerySchema } from './schemas.ts'

export function catalogRouter(catalog: CatalogService): Router {
  return Router()
    .get('/', async (req, res) => {
      res.json(await catalog.listAvailable(pageQuerySchema.parse(req.query)))
    })
    .post('/', (req, res) => {
      const { id } = addItemSchema.parse(req.body)
      res.status(202).json(catalog.addItem(id))
    })
}
