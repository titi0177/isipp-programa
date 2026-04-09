import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { StatusBadge } from '@/components/StatusBadge'
import { Download } from 'lucide-react'

export const Route = createFileRoute('/dashboard/history')({
  component: HistoryPage,
})

function HistoryPage() {
  const [enrollments, setEnrollments] = useState<any[]>([])
  const [student, setStudent] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => { loadData() }, [])

  async function loadData() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data: s } = await supabase.from('students').select('*, program:programs(name)').eq('user_id', user.id).single()
    setStudent(s)
    if (s) {
      const { data } = await supabase
        .from('enrollments')
        .select('*, subject:subjects(name, code, year, credits, professor:professors(name)), grade:grades(*), attendance:attendance(*)')
        .eq('student_id', s.id)
        .order('year', { ascending: true })
      setEnrollments(data || [])
    }
    setLoading(false)
  }

  const handlePrint = () => window.print()

  const byYear = enrollments.reduce((acc: any, enr: any) => {
    const y = enr.subject?.year || enr.year
    if (!acc[y]) acc[y] = []
    acc[y].push(enr)
    return acc
  }, {})

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Historial Académico</h1>
          <p className="text-gray-500 text-sm mt-1">Registro completo de tu trayectoria académica</p>
        </div>
        <button type="button" onClick={handlePrint} className="btn-primary flex items-center gap-2" title="Abre el diálogo de impresión del navegador (puede guardar como PDF)">
          <Download size={16} /> Imprimir / guardar PDF
        </button>
      </div>

      {student && (
        <div className="card">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div><span className="text-gray-500">Alumno:</span><p className="font-semibold">{student.first_name} {student.last_name}</p></div>
            <div><span className="text-gray-500">Legajo:</span><p className="font-semibold">{student.legajo}</p></div>
            <div><span className="text-gray-500">DNI:</span><p className="font-semibold">{student.dni}</p></div>
            <div><span className="text-gray-500">Carrera:</span><p className="font-semibold">{student.program?.name || '-'}</p></div>
          </div>
        </div>
      )}

      {loading ? <div className="card animate-pulse h-64 bg-gray-100" /> : (
        Object.keys(byYear).map(year => (
          <div key={year} className="card p-0 overflow-hidden">
            <div className="siu-band-header">
              <h3 className="text-sm font-bold tracking-wide text-white">{year}° Año</h3>
            </div>
            <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-sm">
              <thead>
                <tr className="bg-gray-50 text-xs text-gray-500 border-b">
                  {['Materia', 'Código', 'Profesor', 'Parcial', 'Final', 'Asistencia', 'Estado'].map(h => (
                    <th key={h} className="px-4 py-2 text-left font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {byYear[year].map((enr: any) => {
                  const g = Array.isArray(enr.grade) ? enr.grade[0] : enr.grade
                  const att = Array.isArray(enr.attendance) ? enr.attendance[0] : enr.attendance
                  return (
                  <tr key={enr.id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium">{enr.subject?.name}</td>
                    <td className="px-4 py-3 text-gray-500">{enr.subject?.code}</td>
                    <td className="px-4 py-3 text-gray-600">{enr.subject?.professor?.name || '-'}</td>
                    <td className="px-4 py-3">{g?.partial_grade ?? '-'}</td>
                    <td className="px-4 py-3">{g?.final_grade ?? g?.final_exam_grade ?? '-'}</td>
                    <td className="px-4 py-3">{att?.percentage != null ? `${att.percentage}%` : '-'}</td>
                    <td className="px-4 py-3"><StatusBadge status={g?.status || 'in_progress'} /></td>
                  </tr>
                  )
                })}
              </tbody>
            </table>
            </div>
          </div>
        ))
      )}
    </div>
  )
}
