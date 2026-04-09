import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useToast } from '@/components/Toast'

export const Route = createFileRoute('/professor/grades')({
  component: ProfessorGradesPage,
})

function ProfessorGradesPage() {
  const [subjects, setSubjects] = useState<any[]>([])
  const [selected, setSelected] = useState('')
  const [rows, setRows] = useState<any[]>([])
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

  async function loadStudents(subjectId: string) {
    const { data } = await supabase
      .from('enrollments')
      .select(`
        id,
        student:students(first_name,last_name),
        grade:grades(*)
      `)
      .eq('subject_id', subjectId)
    setRows(data ?? [])
  }

  function updateValue(i: number, key: string, val: number | '') {
    const copy = [...rows]
    copy[i] = { ...copy[i], [key]: val === '' ? undefined : val }
    setRows(copy)
  }

  async function saveAll() {
    for (const r of rows) {
      const existing = Array.isArray(r.grade) ? r.grade[0] : r.grade
      const partial = r.partial_grade ?? existing?.partial_grade
      const fx = r.final_exam_grade ?? existing?.final_exam_grade
      const final = fx ?? partial

      const status =
        final == null || Number.isNaN(final)
          ? 'in_progress'
          : final >= 7
            ? 'promoted'
            : final >= 4
              ? 'passed'
              : 'failed'

      if (existing?.id) {
        await supabase
          .from('grades')
          .update({
            partial_grade: r.partial_grade ?? existing.partial_grade,
            final_exam_grade: r.final_exam_grade ?? existing.final_exam_grade,
            final_grade: final ?? undefined,
            status,
          })
          .eq('id', existing.id)
      } else {
        await supabase.from('grades').insert({
          enrollment_id: r.id,
          partial_grade: r.partial_grade,
          final_exam_grade: r.final_exam_grade,
          final_grade: final ?? undefined,
          status,
        })
      }
    }
    showToast('Notas guardadas correctamente')
    if (selected) await loadStudents(selected)
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Carga de notas</h1>
      <p className="text-sm text-slate-600">Solo materias donde figurás como docente a cargo.</p>

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
        <div className="card p-4">
          <table className="w-full text-sm">
            <thead>
              <tr className="table-header">
                <th>Alumno</th>
                <th>Parcial</th>
                <th>Final</th>
                <th>Nota</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => {
                const g0 = Array.isArray(r.grade) ? r.grade[0] : r.grade
                const partial = r.partial_grade ?? g0?.partial_grade
                const finalEx = r.final_exam_grade ?? g0?.final_exam_grade
                const final = finalEx ?? partial
                return (
                  <tr key={r.id} className="border-b">
                    <td>
                      {r.student?.last_name}, {r.student?.first_name}
                    </td>
                    <td>
                      <input
                        type="number"
                        className="form-input"
                        value={partial ?? ''}
                        onChange={(e) =>
                          updateValue(i, 'partial_grade', e.target.value === '' ? '' : +e.target.value)
                        }
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        className="form-input"
                        value={finalEx ?? ''}
                        onChange={(e) =>
                          updateValue(i, 'final_exam_grade', e.target.value === '' ? '' : +e.target.value)
                        }
                      />
                    </td>
                    <td>{final ?? '-'}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          <button type="button" onClick={() => void saveAll()} className="btn-primary mt-4">
            Guardar todo
          </button>
        </div>
      )}
    </div>
  )
}
