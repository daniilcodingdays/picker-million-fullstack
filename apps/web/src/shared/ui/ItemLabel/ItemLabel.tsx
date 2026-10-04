import type { ItemId } from '@picker/contracts'
import { Highlight } from '@picker/ui'
import styles from './ItemLabel.module.scss'

interface ItemLabelProps {
  id: ItemId
  query: string
}

export function ItemLabel({ id, query }: ItemLabelProps) {
  return (
    <span className={styles.label}>
      <Highlight text={String(id)} query={query} />
    </span>
  )
}
