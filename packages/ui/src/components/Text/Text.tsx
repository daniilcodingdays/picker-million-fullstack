import { clsx } from 'clsx'
import type { ElementType, HTMLAttributes } from 'react'
import styles from './Text.module.scss'

type TextVariant = 'heading' | 'title' | 'body'
type TextTone = 'primary' | 'secondary' | 'muted' | 'error'

interface TextProps extends HTMLAttributes<HTMLElement> {
  variant?: TextVariant
  tone?: TextTone
}

const DEFAULT_TAGS: Record<TextVariant, ElementType> = {
  heading: 'h1',
  title: 'h2',
  body: 'span',
}

export function Text({
  variant = 'body',
  tone = 'primary',
  className,
  ...props
}: TextProps) {
  const Component = DEFAULT_TAGS[variant]

  return (
    <Component
      {...props}
      className={clsx(styles.element, styles[variant], styles[tone], className)}
    />
  )
}
