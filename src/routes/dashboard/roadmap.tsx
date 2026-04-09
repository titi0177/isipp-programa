import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useMemo, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Lock, CheckCircle2, BookOpen } from 'lucide-react'

type SubjectRow = {
  id: string
  name: string
  code: string
  year: number
  correlatives_ok: boolean
  state: 'done' | 'current' | 'locked' | 'available'
}

export const Route = createFileRoute('/dashboard/roadmap')({
  component: RoadmapPage,
})

function RoadmapPage() {
  const [loading, setLoading] = useState(true)
  const [programName, setProgramName] = useState('')
  const [subjects, setSubjects] = useState<SubjectRow[]>([])

  useEffect(() => {
    void load()
  }, [])

  async function load() {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setLoading(false)
      return
    }

    const { data: student } = await supabase
      .from('students')
      .select('id, year, program_id, program:programs(name)')
      .eq('user_id', user.id)
      .single()

    if (!student) {
      setLoading(false)
      return
    }

    setProgramName((student as any).program?.name ?? '')

    const programId = (student as any).program_id as string | undefined
    const studentYear = (student as any).year as number

    let catalog: any[] = []
    if (programId) {
      const { data: subs } = await supabase
        .from('subjects')
        .select('id, name, code, year')
        .eq('program_id', programId)
        .order('year')
        .order('code')
      catalog = subs ?? []
    }

    const { data: enrollments } = await supabase
      .from('enrollments')
      .select('subject_id, year, grades(*)')
      .eq('student_id', (student as any).id)

    const enrolledIds = new Set((enrollments ?? []).map((e: any) => e.subject_id))
    const passedIds = new Set(
      (enrollments ?? [])
        .filter((e: any) => {
          const g = Array.isArray(e.grades) ? e.grades[0] : e.grades
          return g && ['promoted', 'passed', 'regular'].includes(g.status)
        })
        .map((e: any) => e.subject_id),
    )

    const { data: corrs } = await supabase
      .from('subject_correlatives')
      .select('subject_id, requires_subject_id')

    const requiresMap = new Map<string, string[]>()
    for (const c of corrs ?? []) {
      const arr = requiresMap.get(c.subject_id) ?? []
      arr.push(c.requires_subject_id)
      requiresMap.set(c.subject_id, arr)
    }

    const computed: SubjectRow[] = (catalog as any[]).map((s) => {
      const reqs = requiresMap.get(s.id) ?? []
      const correlatives_ok =
        reqs.length === 0 || reqs.every((rid) => passedIds.has(rid))

      let state: SubjectRow['state'] = 'locked'
      if (passedIds.has(s.id)) state = 'done'
      else if (enrolledIds.has(s.id)) state = 'current'
      else if (correlatives_ok && s.year <= studentYear + 1) state = 'available'
      else state = 'locked'

      return {
        id: s.id,
        name: s.name,
        code: s.code,
        year: s.year,
        correlatives_ok,
        state,
      }
    })

    setSubjects(computed)
    setLoading(false)
  }

  const byYear = useMemo(() => {
    const m = new Map<number, SubjectRow[]>()
    for (const s of subjects) {
      const arr = m.get(s.year) ?? []
      arr.push(s)
      m.set(s.year, arr)
    }
    return [...m.entries()].sort((a, b) => a[0] - b[0])
  }, [subjects])

  if (loading) return <p className="text-slate-600">Cargando plan de estudios…</p>

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Plan de estudios</h1>
        {programName && (
          <p className="mt-1 text-slate-600">
            Propuesta: <span className="font-semibold text-slate-800">{programName}</span>
          </p>
        )}
        <p className="mt-2 max-w-3xl text-sm text-slate-600">
          Estados: cursada aprobada, en curso, disponible para inscribir (correlativas aprobadas), o bloqueada.
        </p>
      </div>

      {byYear.map(([year, list]) => (
        <section key={year} className="space-y-3">
          <h2 className="text-lg font-bold text-[var(--siu-navy)]">Año {year}</h2>
          <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-3">
            {list.map((s) => (
              <div
                key={s.id}
                className={`card flex gap-3 border-l-4 p-4 ${
                  s.state === 'done'
                    ? 'border-l-emerald-600 bg-emerald-50/40'
                    : s.state === 'current'
                      ? 'border-l-sky-600 bg-sky-50/40'
                      : s.state === 'available'
                        ? 'border-l-amber-500 bg-amber-50/30'
                        : 'border-l-slate-300 bg-slate-50/50'
                }`}
              >
                <div className="pt-0.5">
                  {s.state === 'done' && <CheckCircle2 className="h-5 w-5 text-emerald-700" />}
                  {s.state === 'current' && <BookOpen className="h-5 w-5 text-sky-700" />}
                  {s.state === 'available' && <BookOpen className="h-5 w-5 text-amber-700" />}
                  {s.state === 'locked' && <Lock className="h-5 w-5 text-slate-400" />}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-mono text-[11px] font-semibold text-slate-500">{s.code}</div>
                  <div className="font-semibold leading-snug text-slate-900">{s.name}</div>
                  <div className="mt-1 text-xs text-slate-600">
                    {s.state === 'done' && 'Aprobada'}
                    {s.state === 'current' && 'En curso'}
                    {s.state === 'available' && 'Podés inscribirte (según cupos y fechas)'}
                    {s.state === 'locked' && !s.correlatives_ok && 'Bloqueada por correlativas'}
                    {s.state === 'locked' && s.correlatives_ok && 'Bloqueada (año / gestión)'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      ))}

      {subjects.length === 0 && (
        <p className="text-slate-600">No hay materias catalogadas para tu programa.</p>
      )}
    </div>
  )
}
