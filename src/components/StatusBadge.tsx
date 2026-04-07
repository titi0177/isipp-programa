import type { Grade } from '@/types'

const badgeMap: Record<Grade['status'], { className: string; label: string }> = {
  promoted: { className: 'badge-promoted', label: 'Promocionado' },
  regular: { className: 'badge-regular', label: 'Regular' },
  in_progress: { className: 'badge-inprogress', label: 'En Curso' },
  free: { className: 'badge-free', label: 'Libre' },
  failed: { className: 'badge-failed', label: 'Desaprobado' },
  passed: { className: 'badge-passed', label: 'Aprobado' },
}

export function StatusBadge({ status }: { status: Grade['status'] }) {
  const badge = badgeMap[status] || { className: 'badge-inprogress', label: status }
  return <span className={badge.className}>{badge.label}</span>
}
