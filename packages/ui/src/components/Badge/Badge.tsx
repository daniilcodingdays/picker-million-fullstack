import clsx from 'clsx'
import type { ComponentProps } from 'react'
import styles from './Badge.module.scss'

export interface BadgeProps extends ComponentProps<'span'> {
  tone?: 'neutral' | 'accent'
}

export function Badge({ tone = 'neutral', className, ...props }: BadgeProps) {
  return <span className={clsx(styles.badge, styles[tone], className)} {...props} />
}
