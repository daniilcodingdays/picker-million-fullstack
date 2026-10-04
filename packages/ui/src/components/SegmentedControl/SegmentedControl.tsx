import clsx from 'clsx'
import type { ReactNode } from 'react'
import styles from './SegmentedControl.module.scss'

export interface SegmentedControlProps<T extends string> {
  options: Array<{ value: T; label: ReactNode }>
  value: T
  onChange: (value: T) => void
  className?: string
}

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  className,
}: SegmentedControlProps<T>) {
  return (
    <div className={clsx(styles.control, className)}>
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          className={clsx(styles.option, option.value === value && styles.active)}
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}
