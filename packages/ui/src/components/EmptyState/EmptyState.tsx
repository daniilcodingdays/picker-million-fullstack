import type { ReactNode } from 'react'
import { Icon, type IconName } from '../Icon/Icon'
import styles from './EmptyState.module.scss'
import { Text } from '../Text/Text'

export interface EmptyStateProps {
  icon: IconName
  title: string
  description?: ReactNode
  action?: ReactNode
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className={styles.emptyState}>
      <span className={styles.icon}>
        <Icon name={icon} size="md" />
      </span>
      <Text className={styles.title}>{title}</Text>
      {description && (
        <Text tone="secondary" className={styles.description}>
          {description}
        </Text>
      )}
      {action}
    </div>
  )
}
