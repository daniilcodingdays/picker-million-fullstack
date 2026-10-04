import clsx from 'clsx'
import type { ComponentProps } from 'react'
import { Icon, type IconName } from '../Icon/Icon'
import styles from './Button.module.scss'

export interface ButtonProps extends ComponentProps<'button'> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md'
  icon?: IconName
}

export function Button({
  variant = 'primary',
  size = 'md',
  icon,
  type = 'button',
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={clsx(
        styles.button,
        styles[variant],
        styles[size],
        icon && !children && styles.iconOnly,
        className,
      )}
      {...props}
    >
      {icon && <Icon name={icon} />}
      {children}
    </button>
  )
}
