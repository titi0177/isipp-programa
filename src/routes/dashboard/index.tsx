import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { StatCard } from '@/components/StatCard'
import { StatusBadge } from '@/components/StatusBadge'
import { BookOpen, Star, CheckCircle, Clock, Award, Bell } from 'lucide-react'
import type { Announcement, CalendarEvent } from '@/types'

export const Route = createFileRoute('/dashboard/')({
  component: StudentDashboard,
})

function StudentDashboard() {
  const [stats, setStats] = useState({ passed: 0, inProgress: 0, gpa: '0.00', attendance: '0%', credits: 0 })
  const [enrollments, setEnrollments] = useState<any[]>([])
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: student } = await supabase
      .from('students').select('id').eq('user_id', user.id).single()

    if (student) {
      const { data: enrs } = await supabase
        .from('enrollments')
        .select('*, subject:subjects(name, code, credits), grade:grades(*), attendance:attendance(*)')
        .eq('student_id', student.id)
      setEnrollments(enrs || [])

      const grades = (enrs || []).map(e => e.grade?.[0]).filter(Boolean)
      const passed = grades.filter((g: any) => ['promoted', 'passed'].includes(g?.status)).length
      const inProgress = grades.filter((g: any) => g?.status === 'in_progress').length
      const finalGrades = grades.filter((g: any) => g?.final_grade != null).map((g: any) => g.final_grade)
      const gpa = finalGrades.length ? (finalGrades.reduce((a: number, b: number) => a + b, 0) / finalGrades.length).toFixed(2) : '0.00'
      const attValues = (enrs || []).map((e: any) => e.attendance?.[0]?.percentage).filter((v: any) => v != null)
      const attendance = attValues.length ? `${Math.round(attValues.reduce((a: number, b: number) => a + b, 0) / attValues.length)}%` : '0%'
      const credits = (enrs || [])
        .filter((e: any) => ['promoted', 'passed'].includes(e.grade?.[0]?.status))
        .reduce((sum: number, e: any) => sum + (e.subject?.credits || 0), 0)

      setStats({ passed, inProgress, gpa, attendance, credits })
    }

    const { data: ann } = await supabase.from('announcements').select('*').order('date', { ascending: false }).limit(5)
    setAnnouncements(ann || [])

    const { data: ev } = await supabase.from('calendar_events').select('*').gte('date', new Date().toISOString().slice(0, 10)).order('date').limit(5)
    setEvents(ev || [])

    setLoading(false)
  }

  if (loading) return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {[...Array(5)].map((_, i) => <div key={i} className="card h-24 animate-pulse bg-gray-100" />)}
      </div>
    </div>
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Mi Panel Académico</h1>
        <p className="text-gray-500 text-sm mt-1">Bienvenido al Sistema de Gestión Académica ISIPP</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard title="Promedio General" value={stats.gpa} subtitle="Escala 1-10" icon={<Star size={22} />} color="bordeaux" />
        <StatCard title="Materias Aprobadas" value={stats.passed} icon={<CheckCircle size={22} />} color="green" />
        <StatCard title="En Cursada" value={stats.inProgress} icon={<Clock size={22} />} color="blue" />
        <StatCard title="Asistencia Prom." value={stats.attendance} icon={<BookOpen size={22} />} color="orange" />
        <StatCard title="Créditos" value={stats.credits} icon={<Award size={22} />} color="purple" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Current enrollments */}
        <div className="lg:col-span-2 card">
          <h2 className="text-base font-semibold text-gray-900 mb-4">Materias en Cursada</h2>
          {enrollments.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-6">No tiene materias inscriptas actualmente.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-gray-500 border-b border-gray-100">
                    <th className="pb-2 pr-4">Materia</th>
                    <th className="pb-2 pr-4">Nota Parcial</th>
                    <th className="pb-2 pr-4">Asistencia</th>
                    <th className="pb-2">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {enrollments.slice(0, 8).map((enr: any) => (
                    <tr key={enr.id} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="py-2 pr-4 font-medium text-gray-800">{enr.subject?.name || '-'}</td>
                      <td className="py-2 pr-4 text-gray-600">{enr.grade?.[0]?.partial_grade ?? '-'}</td>
                      <td className="py-2 pr-4 text-gray-600">{enr.attendance?.[0]?.percentage != null ? `${enr.attendance[0].percentage}%` : '-'}</td>
                      <td className="py-2"><StatusBadge status={enr.grade?.[0]?.status || 'in_progress'} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Announcements and calendar */}
        <div className="space-y-4">
          <div className="card">
            <h2 className="text-base font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Bell size={16} className="text-[#7A1E2C]" /> Anuncios
            </h2>
            {announcements.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-3">Sin anuncios.</p>
            ) : (
              <div className="space-y-3">
                {announcements.map(ann => (
                  <div key={ann.id} className="border-l-2 border-[#7A1E2C] pl-3">
                    <p className="text-sm font-medium text-gray-800">{ann.title}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{new Date(ann.date).toLocaleDateString('es-AR')}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="card">
            <h2 className="text-base font-semibold text-gray-900 mb-3">Próximos Eventos</h2>
            {events.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-3">Sin eventos próximos.</p>
            ) : (
              <div className="space-y-2">
                {events.map(ev => (
                  <div key={ev.id} className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-[#7A1E2C] rounded-full mt-1.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-gray-800">{ev.title}</p>
                      <p className="text-xs text-gray-500">{new Date(ev.date).toLocaleDateString('es-AR')}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
