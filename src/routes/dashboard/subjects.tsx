import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { StatusBadge } from '@/components/StatusBadge'

export const Route = createFileRoute('/dashboard/subjects')({
  component: SubjectsPage,
})

function SubjectsPage() {
  const [enrollments, setEnrollments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data: student } = await supabase.from('students').select('id').eq('user_id', user.id).single()
    if (student) {
      const { data } = await supabase
        .from('enrollments')
        .select('*, subject:subjects(name, code, credits, year, professor:professors(name)), grade:grades(*), attendance:attendance(*)')
        .eq('student_id', student.id)
        .order('year', { ascending: false })
      setEnrollments(data || [])
    }
    setLoading(false)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Mis Materias</h1>
        <p className="text-gray-500 text-sm mt-1">Todas tus inscripciones académicas</p>
      </div>

      {loading ? (
        <div className="card animate-pulse h-64 bg-gray-100" />
      ) : (
        <div className="card p-0 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="table-header">
                {['Materia', 'Profesor', 'Año', 'Nota Parcial', 'Nota Final', 'Asistencia', 'Estado'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-white/90">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {enrollments.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-400">No tiene materias inscriptas.</td></tr>
              ) : (
                enrollments.map(enr => (
                  <tr key={enr.id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-800">{enr.subject?.name}</td>
                    <td className="px-4 py-3 text-gray-600">{enr.subject?.professor?.name || '-'}</td>
                    <td className="px-4 py-3 text-gray-600">{enr.year}</td>
                    <td className="px-4 py-3 text-gray-600">{enr.grade?.[0]?.partial_grade ?? '-'}</td>
                    <td className="px-4 py-3 text-gray-600">{enr.grade?.[0]?.final_grade ?? '-'}</td>
                    <td className="px-4 py-3 text-gray-600">{enr.attendance?.[0]?.percentage != null ? `${enr.attendance[0].percentage}%` : '-'}</td>
                    <td className="px-4 py-3"><StatusBadge status={enr.grade?.[0]?.status || 'in_progress'} /></td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
