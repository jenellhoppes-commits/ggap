export const formatDisplayAmount = (value: number, currency: string) => `${currency} ${value.toLocaleString()}`

export const formatRate = (value?: number, decimals = 2) => {
  if (value === undefined || value === null) return '-'
  return `${(value * 100).toFixed(decimals)}%`
}
