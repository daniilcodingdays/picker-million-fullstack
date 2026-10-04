import { useEffect, useState } from 'react'

const DEBOUNCE_MS = 300

export function useFilter() {
  const [value, setValue] = useState('')
  const [query, setQuery] = useState('')

  useEffect(() => {
    const timer = setTimeout(() => setQuery(value), DEBOUNCE_MS)
    return () => clearTimeout(timer)
  }, [value])

  return { value, setValue, query }
}
