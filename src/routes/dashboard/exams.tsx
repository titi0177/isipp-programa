import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Calendar, MapPin, User } from 'lucide-react'
import { useToast } from '@/components/Toast'

/** Columna de fecha en Supabase: `exam_date` (alias legado `date` si existiera) */
function examDateString(exam: { exam_date?: string; date?: string }) {
  return exam.exam_date ?? exam.date ?? ''
}

export const Route = createFileRoute('/dashboard/exams')({
  component: ExamsPage,
})

function ExamsPage() {

  const [exams, setExams] = useState<any[]>([])
  const [student, setStudent] = useState<any>(null)
  const [registrations, setRegistrations] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const { showToast } = useToast()

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {

    try {

      setLoading(true)

      const { data: { user } } = await supabase.auth.getUser()

      if (!user) return

      const { data: studentData, error: studentError } = await supabase
        .from('students')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (studentError || !studentData) {
        showToast('No se encontró el estudiante', 'error')
        return
      }

      setStudent(studentData)

      const { data: examsData, error: examsError } = await supabase
        .from('final_exams')
        .select(`
          *,
          subject:subjects(name),
          professor:professors(name)
        `)
        .order('exam_date', { ascending: true })

      if (examsError) {
        showToast(examsError.message, 'error')
        setExams([])
      } else {
        setExams(examsData || [])
      }

      const { data: regData, error: regError } = await supabase
        .from('exam_enrollments')
        .select('*')
        .eq('student_id', studentData.id)

      if (regError) {
        showToast(regError.message, 'error')
        setRegistrations([])
      } else {
        setRegistrations(regData || [])
      }

    } catch {

      showToast('Error cargando mesas', 'error')

    } finally {
      setLoading(false)
    }

  }

  function isRegistered(examId: string) {
    return registrations.some(r => r.final_exam_id === examId)
  }

  async function seatsTaken(examId: string) {

    const { count } = await supabase
      .from('exam_enrollments')
      .select('*', { count: 'exact', head: true })
      .eq('final_exam_id', examId)

    return count || 0
  }

  function examClosed(dateStr: string) {

    if (!dateStr) return true

    const exam = new Date(dateStr + (dateStr.length <= 10 ? 'T12:00:00' : ''))
    const now = new Date()

    const diff = exam.getTime() - now.getTime()
    const hours = diff / (1000 * 60 * 60)

    return hours < 24
  }

  async function registerExam(exam: any) {

    if (!student) return

    if (isRegistered(exam.id)) {
      showToast('Ya estás inscripto', 'info')
      return
    }

    const when = examDateString(exam)
    if (examClosed(when)) {
      showToast('La inscripción cierra 24 hs antes del examen', 'error')
      return
    }

    const maxStudents = exam.max_students
    if (maxStudents != null && maxStudents > 0) {
      const taken = await seatsTaken(exam.id)
      if (taken >= maxStudents) {
        showToast('No hay cupos disponibles', 'error')
        return
      }
    }

    const { error } = await supabase
      .from('exam_enrollments')
      .insert({
        final_exam_id: exam.id,
        student_id: student.id,
      })

    if (error) {

      showToast(error.message, 'error')

      return
    }

    showToast('Inscripción realizada')

    loadData()
  }

  async function cancelRegistration(examId: string) {

    if (!student) return

    const { error } = await supabase
      .from('exam_enrollments')
      .delete()
      .eq('final_exam_id', examId)
      .eq('student_id', student.id)

    if (error) {

      showToast('Error cancelando inscripción', 'error')

      return
    }

    showToast('Inscripción cancelada')

    loadData()
  }

  if (loading) {
    return <p>Cargando mesas...</p>
  }

  return (

    <div className="space-y-6">

      <h1 className="text-2xl font-bold">
        Mesas de Examen
      </h1>

      {exams.length === 0 && (
        <p>No hay mesas disponibles</p>
      )}

      <div className="space-y-4">

        {exams.map(exam => {

          const registered = isRegistered(exam.id)
          const when = examDateString(exam)
          const closed = examClosed(when)

          return (

            <div
              key={exam.id}
              className="bg-white rounded-lg shadow p-6 flex justify-between items-center"
            >

              <div className="space-y-2">

                <p className="font-semibold text-lg">
                  {exam.subject?.name}
                </p>

                <div className="text-sm text-gray-500 flex gap-4">

                  <span className="flex items-center gap-1">
                    <Calendar size={14} />
                    {when || '—'}
                  </span>

                  <span className="flex items-center gap-1">
                    <MapPin size={14} />
                    {exam.location}
                  </span>

                </div>

                <p className="text-sm text-gray-500 flex items-center gap-1">
                  <User size={14} />
                  {exam.professor?.name}
                </p>

              </div>

              {registered ? (

                <button
                  type="button"
                  onClick={() => cancelRegistration(exam.id)}
                  className="btn-secondary px-4 py-2 text-slate-700"
                >
                  Cancelar inscripción
                </button>

              ) : closed ? (

                <span className="text-red-600 font-semibold">
                  Inscripción cerrada
                </span>

              ) : (

                <button
                  type="button"
                  onClick={() => registerExam(exam)}
                  className="btn-primary px-4 py-2"
                >
                  Inscribirse
                </button>

              )}

            </div>

          )

        })}

      </div>

    </div>

  )

}
