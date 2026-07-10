import type { DataTableColumns } from 'naive-ui'

type SortableColumn<Row> = DataTableColumns<Row>[number] & {
  key?: string | number | symbol
  sorter?: unknown
  children?: DataTableColumns<Row>
  type?: string
  title?: unknown
}

const EXCLUDED_KEYS = new Set([
  'action',
  'actions',
  'operation',
  'operations',
  'controls',
  'expand',
  'selection',
  'index',
  '#'
])

const EXCLUDED_TITLES = new Set(['操作', '動作'])

const normalizeSortValue = (value: unknown): string | number => {
  if (value == null) return ''
  if (typeof value === 'number') return value
  if (typeof value === 'boolean') return value ? 1 : 0
  if (value instanceof Date) return value.getTime()
  if (Array.isArray(value)) return value.map(normalizeSortValue).join(' ')

  if (typeof value === 'object') return JSON.stringify(value)

  const text = String(value).trim()
  if (!text) return ''

  const time = Date.parse(text)
  if (!Number.isNaN(time) && /\d{4}[-/]\d{1,2}[-/]\d{1,2}|T\d{2}:\d{2}/.test(text)) {
    return time
  }

  const numeric = Number(text.replace(/[,%\s]/g, ''))
  if (!Number.isNaN(numeric) && /^-?[\d,%.\s]+$/.test(text)) return numeric

  return text.toLocaleLowerCase()
}

const compareValues = (left: unknown, right: unknown) => {
  const a = normalizeSortValue(left)
  const b = normalizeSortValue(right)

  if (typeof a === 'number' && typeof b === 'number') return a - b
  return String(a).localeCompare(String(b), 'zh-Hant', { numeric: true, sensitivity: 'base' })
}

const shouldAddSorter = <Row>(column: SortableColumn<Row>) => {
  if (column.sorter || column.children?.length) return false
  if (column.type === 'selection' || column.type === 'expand') return false

  const key = column.key == null ? '' : String(column.key)
  if (!key || EXCLUDED_KEYS.has(key)) return false

  const title = typeof column.title === 'string' ? column.title.trim() : ''
  if (EXCLUDED_TITLES.has(title)) return false

  return true
}

export const withTableSorters = <Row>(columns: DataTableColumns<Row>): DataTableColumns<Row> => {
  return columns.map(column => {
    const sortableColumn = column as SortableColumn<Row>

    if (sortableColumn.children?.length) {
      return {
        ...sortableColumn,
        children: withTableSorters(sortableColumn.children)
      } as DataTableColumns<Row>[number]
    }

    if (!shouldAddSorter(sortableColumn)) return column

    const key = sortableColumn.key as keyof Row
    return {
      ...sortableColumn,
      sorter: (left: Row, right: Row) => compareValues(left[key], right[key])
    } as DataTableColumns<Row>[number]
  })
}
