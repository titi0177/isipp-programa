import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useToast } from '@/components/Toast'

export const Route = createFileRoute('/professor/attendance')({
  component: ProfessorAttendancePage,
})

function ProfessorAttendancePage() {
  const [subjects, setSubjects] = useState<any[]>([])
  const [rows, setRows] = useState<any[]>([])
  const [selected, setSelected] = useState('')
  const { showToast } = useToast()

  useEffect(() => {
    void loadSubjects()
  }, [])

  async function loadSubjects() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data: prof } = await supabase
      .from('professors')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle()
    if (!prof?.id) {
      setSubjects([])
      return
    }
    const { data } = await supabase
      .from('subjects')
      .select('*')
      .eq('professor_id', prof.id)
      .order('name')
    setSubjects(data ?? [])
  }

  async function loadStudents(id: string) {
    const { data } = await supabase
      .from('enrollments')
      .select(`
        id,
        student:students(first_name,last_name),
        attendance:attendance(*)
      `)
      .eq('subject_id', id)

    const normalized = (data || []).map((r: any) => ({
      ...r,
      percentage: r.percentage ?? r.attendance?.[0]?.percentage ?? '',
    }))
    setRows(normalized)
  }

  function update(i: number, val: number) {
    const copy = [...rows]
    copy[i].percentage = val
    setRows(copy)
  }

  async function save() {
    for (const r of rows) {
      const pct = typeof r.percentage === 'number' ? r.percentage : Number(r.percentage)
      if (Number.isNaN(pct)) continue
      const existing = r.attendance?.[0]
      if (existing) {
        await supabase.from('attendance').update({ percentage: pct }).eq('id', existing.id)
      } else {
        await supabase.from('attendance').insert({ enrollment_id: r.id, percentage: pct })
      }
    }
    showToast('Asistencia guardada')
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Asistencia por materia</h1>
      <p className="text-sm text-slate-600">Solo tus asignaturas a cargo.</p>

      <select
        className="form-input max-w-md"
        value={selected}
        onChange={(e) => {
          const v = e.target.value
          setSelected(v)
          if (v) void loadStudents(v)
          else setRows([])
        }}
      >
        <option value="">Seleccionar materia</option>
        {subjects.map((s) => (
          <option key={s.id} value={s.id}>
            {s.name}
          </option>
        ))}
      </select>

      {rows.length > 0 && (
        <>
          <table className="w-full text-sm">
            <thead>
              <tr className="table-header">
                <th>Alumno</th>
                <th>%</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={r.id} className="border-b">
                  <td>
                    {r.student?.last_name}, {r.student?.first_name}
                  </td>
                  <td>
                    <input
                      type="number"
                      className="form-input"
                      value={r.percentage ?? ''}
                      onChange={(e) => update(i, +e.target.value)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <button type="button" className="btn-primary" onClick={() => void save()}>
            Guardar
          </button>
        </>
      )}
    </div>
  )
}
