import { MAX_ID_LENGTH } from '@picker/contracts'
import { Badge, Button, Spinner, Text, TextField } from '@picker/ui'
import { useState, type SubmitEvent } from 'react'
import { isConflict } from '@shared/api/http'
import { digitsOnly } from '@shared/lib/format'
import { usePendingAdditions, useAddItem } from './useAddItemForm'
import styles from './AddItemForm.module.scss'

export function AddItemForm() {
  const [value, setValue] = useState('')
  const [error, setError] = useState<string | null>(null)
  const { mutate: addItem } = useAddItem()
  const pending = usePendingAdditions()

  const submit = (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault()

    const id = Number(value)

    if (id < 1) {
      setError('ID должен быть больше нуля')
      return
    }

    if (pending.includes(id)) {
      setError(`ID ${id} уже ждёт добавления`)
      return
    }

    setValue('')
    addItem(id, {
      onError: (cause) =>
        setError(isConflict(cause) ? `ID ${id} уже существует` : `Не удалось добавить ID ${id}`),
      onSuccess: () => {
        setError(null)
      },
    })
  }

  return (
    <form className={styles.form} onSubmit={submit} noValidate>
      <div className={styles.controls}>
        <TextField
          className={styles.field}
          value={value}
          onChange={(event) => {
            setValue(digitsOnly(event.target.value))
            setError(null)
          }}
          placeholder="Новый ID"
          inputMode="numeric"
          maxLength={MAX_ID_LENGTH}
          icon="Hash"
          invalid={error !== null}
        />
        <Button type="submit" icon="Plus" disabled={!value}>
          Добавить
        </Button>
      </div>

      <div className={styles.status}>
        {error ? (
          <Text variant="body" tone="error">
            {error}
          </Text>
        ) : (
          <Text variant="body" tone="muted">
            {pending.length > 0 ? 'Ждут применения:' : 'Новые ID добавляются раз в 10 секунд'}
          </Text>
        )}
        {pending.map((id) => (
          <Badge key={id} tone="accent">
            <Spinner />
            {id}
          </Badge>
        ))}
      </div>
    </form>
  )
}
