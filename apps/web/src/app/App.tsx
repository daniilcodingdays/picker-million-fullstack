import { Icon, SegmentedControl, Text } from '@picker/ui'
import { useState } from 'react'
import { AvailablePanel } from '@domains/catalog'
import { useSelectionCommands } from '@domains/selection'
import { SelectedPanel } from '@domains/selection'
import { useRefreshOnReturn } from './useRefreshOnReturn'
import styles from './App.module.scss'

const PANELS: Array<{ value: string; label: string }> = [
  { value: 'available', label: 'Все элементы' },
  { value: 'selected', label: 'Выбранные' },
]

type PanelId = (typeof PANELS)[number]['value']

export function App() {
  const [activePanel, setActivePanel] = useState<PanelId>('available')
  const { select, deselect, move } = useSelectionCommands()
  useRefreshOnReturn()

  return (
    <div className={styles.app}>
      <header className={styles.header}>
        <span className={styles.logo}>
          <Icon name="ListChecks" size="md" />
        </span>
        <div>
          <Text variant="heading">Миллион элементов</Text>
          <Text tone="secondary" variant="body">
            фильтр, выбор и сортировка перетаскиванием
          </Text>
        </div>
      </header>

      <SegmentedControl
        className={styles.switcher}
        options={PANELS}
        value={activePanel}
        onChange={setActivePanel}
      />

      <main className={styles.panels} data-active={activePanel}>
        <AvailablePanel className={styles.available} onSelect={select} />
        <SelectedPanel className={styles.selected} onDeselect={deselect} onMove={move} />
      </main>
    </div>
  )
}
