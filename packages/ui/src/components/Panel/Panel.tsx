import clsx from 'clsx'
import type { ReactNode } from 'react'
import { Badge } from '../Badge/Badge'
import styles from './Panel.module.scss'
import { Text } from '../Text/Text'

export interface PanelProps {
  heading: string
  count?: ReactNode
  toolbar?: ReactNode
  footer?: ReactNode
  children: ReactNode
  className?: string
}

export function Panel({ heading, count, toolbar, footer, children, className }: PanelProps) {
  return (
    <section className={clsx(styles.panel, className)}>
      <header className={styles.header}>
        <Text variant='title'>{heading}</Text>
        {count !== undefined && <Badge>{count}</Badge>}
      </header>
      {toolbar && <div className={styles.toolbar}>{toolbar}</div>}
      <div className={styles.body}>{children}</div>
      {footer && <footer className={styles.footer}>{footer}</footer>}
    </section>
  )
}
