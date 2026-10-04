import clsx from 'clsx'
import type { ComponentProps, ReactNode } from 'react'
import { Icon, type IconName } from '../Icon/Icon'
import styles from './TextField.module.scss'

export interface TextFieldProps extends ComponentProps<'input'> {
  icon?: IconName
  trailing?: ReactNode
  invalid?: boolean
}

export function TextField({ icon, trailing, invalid, className, disabled, ...props }: TextFieldProps) {
  return (
    <label
      className={clsx(
        styles.field,
        trailing && styles.withTrailing,
        invalid && styles.invalid,
        disabled && styles.disabled,
        className,
      )}
    >
      {icon && <Icon name={icon} className={styles.icon} />}
      <input className={styles.input} disabled={disabled} {...props} />
      {trailing}
    </label>
  )
}
