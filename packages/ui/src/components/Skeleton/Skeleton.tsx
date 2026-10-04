import clsx from 'clsx'
import styles from './Skeleton.module.scss'

export function Skeleton({ className }: { className?: string }) {
  return <span className={clsx(styles.skeleton, className)} />
}
