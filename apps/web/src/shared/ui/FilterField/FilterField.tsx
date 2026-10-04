import { MAX_ID_LENGTH } from '@picker/contracts'
import { Button, Spinner, TextField } from '@picker/ui'
import { digitsOnly } from '../../lib/format'
import styles from './FilterField.module.scss'

interface FilterFieldProps {
  value: string
  onChange: (value: string) => void
  busy: boolean
  disabled?: boolean
}

export function FilterField({ disabled, value, onChange, busy }: FilterFieldProps) {
  let trailing
  if (busy) {
    trailing = (
      <span className={styles.slot}>
        <Spinner />
      </span>
    )
  } else if (value) {
    trailing = (
      <Button
        variant="ghost"
        size="sm"
        icon="X"
        title="Сбросить фильтр"
        onClick={() => onChange('')}
      />
    )
  }

  return (
    <TextField
      disabled={disabled}
      value={value}
      onChange={(event) => onChange(digitsOnly(event.target.value))}
      placeholder="Фильтр по ID"
      inputMode="numeric"
      maxLength={MAX_ID_LENGTH}
      icon="Search"
      trailing={trailing}
    />
  )
}
