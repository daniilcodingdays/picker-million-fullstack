import { Skeleton } from '@picker/ui'
import { LIST_ITEM_ROW_HEIGHT } from './constants'
import styles from './ItemListView.module.scss'

const SKELETON_ROWS = 8

export function ListSkeleton() {
  return (
    <div className={styles.list}>
      {Array.from({ length: SKELETON_ROWS }, (_, index) => (
        <div key={index} className={styles.skeletonRow} style={{ height: LIST_ITEM_ROW_HEIGHT }}>
          <Skeleton className={styles.skeletonBar} />
        </div>
      ))}
    </div>
  )
}