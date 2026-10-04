const numberFormat = new Intl.NumberFormat('ru-RU')

export const formatCount = (count: number | undefined): string | undefined =>
  count === undefined ? undefined : numberFormat.format(count)

export const digitsOnly = (value: string): string => value.replace(/\D/g, '')
