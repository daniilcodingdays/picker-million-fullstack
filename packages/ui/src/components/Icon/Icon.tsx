import clsx from 'clsx'
import {
  ArrowRight,
  CloudOff,
  GripVertical,
  Hash,
  ListChecks,
  MousePointerClick,
  Plus,
  Search,
  SearchX,
  X,
} from 'lucide-react'
import styles from './Icon.module.scss'

const ICONS = {
  ArrowRight,
  CloudOff,
  GripVertical,
  Hash,
  ListChecks,
  MousePointerClick,
  Plus,
  Search,
  SearchX,
  X,
}

export type IconName = keyof typeof ICONS

export interface IconProps {
  name: IconName
  size?: 'sm' | 'md'
  className?: string
}

export function Icon({ name, size = 'sm', className }: IconProps) {
  const Svg = ICONS[name]
  return <Svg aria-hidden className={clsx(styles.icon, styles[size], className)} />
}
