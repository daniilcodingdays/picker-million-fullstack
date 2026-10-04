import clsx from 'clsx'
import type { MouseEvent, ReactNode } from 'react'
import styles from './ListItem.module.scss'

export interface ListItemProps {
  children: ReactNode
  leading?: ReactNode
  trailing?: ReactNode
  onClick?: (event: MouseEvent) => void
  className?: string
}

export function ListItem({ children, leading, trailing, onClick, className }: ListItemProps) {
  const Root = onClick ? 'button' : 'div'
  return (
    <Root
      type={onClick ? 'button' : undefined}
      className={clsx(styles.item, className)}
      onClick={onClick}
    >
      {leading}
      <span className={styles.content}>{children}</span>
      {trailing && <span className={styles.trailing}>{trailing}</span>}
    </Root>
  )
}
