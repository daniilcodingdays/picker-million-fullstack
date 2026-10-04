import { Router } from 'express'
import type { SelectionService } from '../../application/selection-service.ts'
import { itemParamsSchema, moveSchema, pageQuerySchema } from './schemas.ts'
import { RESOURCE_NAME } from '@picker/contracts'

export function selectionRouter(selection: SelectionService): Router {
  return Router()
    .get('/', async (req, res) => {
      res.json(await selection.listSelected(pageQuerySchema.parse(req.query)))
    })
    .put(RESOURCE_NAME.ID, (req, res) => {
      selection.select(itemParamsSchema.parse(req.params).id)
      res.status(202).end()
    })
    .delete(RESOURCE_NAME.ID, (req, res) => {
      selection.deselect(itemParamsSchema.parse(req.params).id)
      res.status(202).end()
    })
    .patch(RESOURCE_NAME.ID, (req, res) => {
      selection.move(itemParamsSchema.parse(req.params).id, moveSchema.parse(req.body))
      res.status(202).end()
    })
}
