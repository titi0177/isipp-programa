import { createFileRoute, Link } from '@tanstack/react-router'
import { useCallback, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { generateRegularCertificate } from '@/utils/generateRegularCertificate'
import { FileText, GraduationCap, CalendarCheck, BookOpen, TrendingUp, Calendar } from 'lucide-react'
import StatCard from '@/components/StatCard'
import { CareerProgressBar } from '@/features/student/components/CareerProgressBar'
import { useRealtimeGrades } from '@/hooks/useRealtimeGrades'
import { useRealtimeFinalExams } from '@/hooks/useRealtimeFinalExams'
import { useRealtimeAnnouncements } from '@/hooks/useRealtimeAnnouncements'

export const Route = createFileRoute('/dashboard/')({
  component: DashboardPage,
})

type Row = {
  subject?: { name?: string; code?: string }
  final_grade?: number | null
  partial_grade?: number | null
  final_exam_grade?: number | null
  status?: string
}

function DashboardPage() {
  const [student, setStudent] = useState<any>(null)
  const [rows, setRows] = useState<Row[]>([])
  const [attendancePercent, setAttendancePercent] = useState(0)
  const [gpa, setGpa] = useState<number | null>(null)
  const [progress, setProgress] = useState({
    total_materias: 0,
    aprobadas: 0,
    en_curso: 0,
    pendientes: 0,
    porcentaje: 0,
  })
  const [upcomingExams, setUpcomingExams] = useState<any[]>([])

  const loadData = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: studentData } = await supabase
      .from('students')
      .select('*, program:programs(name)')
      .eq('user_id', user.id)
      .single()

    if (!studentData) return
    setStudent(studentData)

    const { data: gpaData } = await supabase.rpc('calcular_promedio_alumno', {
      p_estudiante: studentData.id,
    })
    setGpa(typeof gpaData === 'number' ? gpaData : null)

    const { data: progData } = await supabase.rpc('calcular_progreso_carrera', {
      p_estudiante: studentData.id,
    })
    const p0 = progData?.[0]
    if (p0) {
      setProgress({
        total_materias: p0.total_materias,
        aprobadas: p0.aprobadas,
        en_curso: p0.en_curso,
        pendientes: p0.pendientes,
        porcentaje: Number(p0.porcentaje),
      })
    }

    const { data: enr } = await supabase
      .from('enrollments')
      .select(`
        subject:subjects(name, code),
        grades:grades(final_grade, partial_grade, final_exam_grade, status)
      `)
      .eq('student_id', studentData.id)

    const mapped: Row[] =
      enr?.map((e: any) => {
        const g = Array.isArray(e.grades) ? e.grades[0] : e.grades
        return {
          subject: e.subject,
          final_grade: g?.final_grade,
          partial_grade: g?.partial_grade,
          final_exam_grade: g?.final_exam_grade,
          status: g?.status,
        }
      }) ?? []
    setRows(mapped)

    const { data: enrollmentsWithAttendance } = await supabase
      .from('enrollments')
      .select('attendance:attendance(percentage)')
      .eq('student_id', studentData.id)

    if (enrollmentsWithAttendance?.length) {
      let sum = 0
      let n = 0
      for (const e of enrollmentsWithAttendance) {
        const p = e.attendance?.[0]?.percentage
        if (p != null) {
          sum += p
          n++
        }
      }
      setAttendancePercent(n ? Math.round(sum / n) : 0)
    } else {
      setAttendancePercent(0)
    }

    const { data: exams } = await supabase
      .from('final_exams')
      .select('id, exam_date, location, subject:subjects(name)')
      .gte('exam_date', new Date().toISOString())
      .order('exam_date', { ascending: true })
      .limit(6)

    setUpcomingExams(exams ?? [])
  }, [])

  useEffect(() => {
    void loadData()
  }, [loadData])

  useRealtimeGrades(loadData)
  useRealtimeFinalExams(loadData)
  useRealtimeAnnouncements(loadData)

  if (!student) return null

  const approved = rows.filter(
    (s) =>
      s.final_grade != null &&
      s.final_grade >= 4 &&
      s.status &&
      ['promoted', 'passed', 'regular'].includes(s.status),
  ).length

  return (
    <div className="space-y-8">
      <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">Panel del alumno</h1>
          <p className="text-sm text-gray-500">
            {student.first_name} {student.last_name} · {student.program?.name ?? 'Carrera'}
          </p>
        </div>
        <Link
          to="/dashboard/roadmap"
          className="btn-primary w-fit text-sm"
        >
          Ver plan de estudios
        </Link>
      </div>

      <CareerProgressBar
        careerName={student.program?.name ?? 'Tu carrera'}
        porcentaje={progress.porcentaje}
        aprobadas={progress.aprobadas}
        enCurso={progress.en_curso}
        pendientes={progress.pendientes}
        totalMaterias={progress.total_materias}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={TrendingUp}
          title="Promedio general"
          value={gpa != null ? gpa.toFixed(2) : '—'}
          color="bg-amber-50 text-amber-900 border border-amber-200/80"
        />
        <StatCard
          icon={GraduationCap}
          title="Materias aprobadas"
          value={approved}
          color="bg-blue-100 text-blue-600"
        />
        <StatCard
          icon={CalendarCheck}
          title="Asistencia prom."
          value={`${attendancePercent}%`}
          color="bg-green-100 text-green-600"
        />
        <StatCard
          icon={BookOpen}
          title="Inscripciones activas"
          value={rows.length}
          color="bg-purple-100 text-purple-600"
        />
      </div>

      <div className="card p-5">
        <div className="mb-3 flex items-center gap-2">
          <Calendar className="h-5 w-5 text-[var(--siu-blue)]" />
          <h2 className="text-lg font-semibold">Próximas mesas de examen</h2>
        </div>
        {upcomingExams.length === 0 ? (
          <p className="text-sm text-slate-600">No hay mesas programadas a futuro.</p>
        ) : (
          <ul className="divide-y divide-slate-100 text-sm">
            {upcomingExams.map((ex) => (
              <li key={ex.id} className="flex flex-col gap-0.5 py-2 sm:flex-row sm:items-center sm:justify-between">
                <span className="font-medium text-slate-900">{ex.subject?.name ?? 'Materia'}</span>
                <span className="text-slate-600">
                  {new Date(ex.exam_date).toLocaleString('es-AR', {
                    dateStyle: 'short',
                    timeStyle: 'short',
                  })}{' '}
                  · {ex.location || '—'}
                </span>
              </li>
            ))}
          </ul>
        )}
        <Link to="/dashboard/exams" className="mt-3 inline-block text-sm font-semibold text-[var(--siu-blue)] hover:underline">
          Gestionar inscripción a finales
        </Link>
      </div>

      <div className="card overflow-hidden p-0">
        <div className="flex flex-col gap-2 border-b border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-lg font-semibold">Mis calificaciones recientes</h2>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => generateRegularCertificate(student, student.program)}
              className="btn-primary text-xs px-3 py-1.5"
            >
              Certificado alumno regular
            </button>
            <Link to="/dashboard/certificates" className="text-xs font-semibold text-blue-600 hover:underline">
              Más certificados
            </Link>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[520px] text-sm">
            <thead>
              <tr className="border-b bg-slate-50 text-left text-gray-600">
                <th className="px-4 py-3">Materia</th>
                <th className="px-4 py-3">Parcial</th>
                <th className="px-4 py-3">Final</th>
                <th className="px-4 py-3">Nota</th>
                <th className="px-4 py-3">Estado</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((s, i) => {
                const fg = s.final_grade
                let status = 'En curso'
                let color = 'bg-slate-100 text-slate-700'
                if (fg != null && fg >= 7) {
                  status = 'Promocionado'
                  color = 'bg-green-100 text-green-700'
                } else if (fg != null && fg >= 4) {
                  status = 'Aprobado'
                  color = 'bg-blue-100 text-blue-700'
                } else if (fg != null && fg < 4) {
                  status = 'Desaprobado'
                  color = 'bg-red-100 text-red-700'
                }
                return (
                  <tr key={i} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3">{s.subject?.name}</td>
                    <td className="px-4 py-3 tabular-nums">{s.partial_grade ?? '—'}</td>
                    <td className="px-4 py-3 tabular-nums">{s.final_exam_grade ?? '—'}</td>
                    <td className="px-4 py-3 tabular-nums">{fg ?? '—'}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded px-2 py-1 text-xs ${color}`}>{status}</span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
