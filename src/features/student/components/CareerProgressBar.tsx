type Props = {
  careerName: string
  porcentaje: number
  aprobadas: number
  enCurso: number
  pendientes: number
  totalMaterias: number
}

export function CareerProgressBar({
  careerName,
  porcentaje,
  aprobadas,
  enCurso,
  pendientes,
  totalMaterias,
}: Props) {
  const pct = Math.min(100, Math.max(0, porcentaje))

  return (
    <section className="card overflow-hidden p-0">
      <div className="border-b border-[var(--siu-border-light)] bg-[var(--isipp-bordo-soft)] px-5 py-3">
        <h2 className="text-base font-bold text-[var(--isipp-bordo-dark)]">Progreso de carrera</h2>
        <p className="text-sm text-slate-700">{careerName}</p>
      </div>
      <div className="space-y-4 p-5">
        <div>
          <div className="mb-1 flex justify-between text-sm font-semibold text-slate-800">
            <span>Avance curricular</span>
            <span className="tabular-nums text-[var(--isipp-bordo-deep)]">{pct}%</span>
          </div>
          <div
            className="h-3 w-full overflow-hidden rounded-full bg-slate-200"
            role="progressbar"
            aria-valuenow={pct}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#582c31] to-[#7a1e2c] transition-[width] duration-500"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatPill label="Materias plan" value={totalMaterias} tone="slate" />
          <StatPill label="Aprobadas" value={aprobadas} tone="emerald" />
          <StatPill label="En curso" value={enCurso} tone="sky" />
          <StatPill label="Pendientes" value={pendientes} tone="amber" />
        </div>
        <p className="text-xs text-slate-500">
          El porcentaje se calcula sobre materias del plan de tu carrera en el sistema (ISIPP 1206 · Puerto Piray).
        </p>
      </div>
    </section>
  )
}

function StatPill({
  label,
  value,
  tone,
}: {
  label: string
  value: number
  tone: 'slate' | 'emerald' | 'sky' | 'amber'
}) {
  const tones = {
    slate: 'bg-slate-50 text-slate-800 border-slate-200',
    emerald: 'bg-emerald-50 text-emerald-900 border-emerald-200',
    sky: 'bg-sky-50 text-sky-900 border-sky-200',
    amber: 'bg-amber-50 text-amber-950 border-amber-200',
  }
  return (
    <div className={`rounded-lg border px-3 py-2.5 ${tones[tone]}`}>
      <div className="text-[10px] font-bold uppercase tracking-wide opacity-80">{label}</div>
      <div className="text-xl font-bold tabular-nums">{value}</div>
    </div>
  )
}
