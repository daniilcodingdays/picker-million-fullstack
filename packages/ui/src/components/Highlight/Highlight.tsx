import styles from './Highlight.module.scss'

interface HighlightProps {
  text: string
  query: string
}

export function Highlight({ text, query }: HighlightProps) {
  const start = query ? text.indexOf(query) : -1
  if (start === -1) return text

  const end = start + query.length
  return (
    <>
      {text.slice(0, start)}
      <mark className={styles.mark}>{text.slice(start, end)}</mark>
      {text.slice(end)}
    </>
  )
}
