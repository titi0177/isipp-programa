import { useState } from 'react'
import { Search, ChevronLeft, ChevronRight } from 'lucide-react'

interface Column<T> {
  key: string
  label: string
  render?: (row: T) => React.ReactNode
}

interface DataTableProps<T> {
  columns: Column<T>[]
  data: T[]
  searchable?: boolean
  searchPlaceholder?: string
  actions?: (row: T) => React.ReactNode
  emptyMessage?: string
}

export function DataTable<T extends Record<string, unknown>>({
  columns,
  data,
  searchable = true,
  searchPlaceholder = 'Buscar...',
  actions,
  emptyMessage = 'No hay datos disponibles',
}: DataTableProps<T>) {
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const pageSize = 10

  const filtered = searchable
    ? data.filter((row) =>
        JSON.stringify(row).toLowerCase().includes(search.toLowerCase())
        )
    : data

  const totalPages = Math.ceil(filtered.length / pageSize)
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize)

  return (
    <div className="card overflow-hidden p-0">
      {searchable && (
        <div className="border-b border-[var(--siu-border-light)] bg-[var(--siu-blue-soft)]/50 px-4 py-3">
          <div className="relative max-w-md">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--siu-text-muted)]" />
            <input
              type="text"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1) }}
              placeholder={searchPlaceholder}
              className="form-input pl-9"
            />
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="siu-table w-full border-collapse text-sm">
          <thead>
            <tr className="table-header">
              {columns.map((col) => (
                <th key={col.key} className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-white">
                  {col.label}
                </th>
              ))}
              {actions && (
                <th className="px-4 py-3 text-right text-xs font-bold uppercase tracking-wide text-white">
                  Acciones
                </th>
              )}
            </tr>
          </thead>
          <tbody className="border border-[var(--siu-border-light)]">
            {paginated.length === 0 ? (
              <tr>
                <td colSpan={columns.length + (actions ? 1 : 0)} className="border border-[var(--siu-border-light)] bg-white px-4 py-10 text-center text-[var(--siu-text-muted)]">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              paginated.map((row, i) => (
                <tr key={i} className="border-b border-[var(--siu-border-light)] transition-colors">
                  {columns.map((col) => (
                    <td key={col.key} className="px-4 py-2.5 text-slate-700">
                      {col.render ? col.render(row) : String(row[col.key] ?? '-')}
                    </td>
                  ))}
                  {actions && (
                    <td className="px-4 py-2.5 text-right">{actions(row)}</td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-[var(--siu-border-light)] bg-[var(--siu-blue-soft)]/30 px-4 py-2.5">
          <span className="text-xs font-medium text-[var(--siu-text-muted)]">
            {filtered.length} reg. · Pág. {page} / {totalPages}
          </span>
          <div className="flex items-center gap-0.5">
            <button
              type="button"
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="rounded-sm border border-[var(--siu-border)] bg-white p-1.5 text-[var(--siu-navy)] hover:bg-[var(--siu-blue-soft)] disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              type="button"
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="rounded-sm border border-[var(--siu-border)] bg-white p-1.5 text-[var(--siu-navy)] hover:bg-[var(--siu-blue-soft)] disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
