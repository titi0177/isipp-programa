import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useToast } from '@/components/Toast'
import { BookMarked, Calendar, MapPin, User } from 'lucide-react'

export const Route = createFileRoute('/dashboard/exams')({
  component: ExamsPage,
})

function ExamsPage() {
  const [exams, setExams] = useState<any[]>([])
  const [enrolled, setEnrolled] = useState<string[]>([])
  const [studentId, setStudentId] = useState('')
  const [loading, setLoading] = useState(true)
  const { showToast } = useToast()

  useEffect(() => { loadData() }, [])

  async function loadData() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data: student } = await supabase.from('students').select('id').eq('user_id', user.id).single()
    if (student) {
      setStudentId(student.id)
      const { data: ex } = await supabase
        .from('final_exams')
        .select('*, subject:subjects(name, code), professor:professors(name)')
        .gte('date', new Date().toISOString().slice(0, 10))
        .order('date')
      setExams(ex || [])
      const { data: ee } = await supabase.from('exam_enrollments').select('final_exam_id').eq('student_id', student.id)
      setEnrolled((ee || []).map((e: any) => e.final_exam_id))
    }
    setLoading(false)
  }

  const enroll = async (examId: string) => {
    const { error } = await supabase.from('exam_enrollments').insert({ student_id: studentId, final_exam_id: examId })
    if (error) showToast('Error al inscribirse.', 'error')
    else { showToast('Inscripción realizada exitosamente.'); setEnrolled(prev => [...prev, examId]) }
  }

  const unenroll = async (examId: string) => {
    await supabase.from('exam_enrollments').delete().eq('student_id', studentId).eq('final_exam_id', examId)
    showToast('Inscripción cancelada.', 'info')
    setEnrolled(prev => prev.filter(id => id !== examId))
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Exámenes Finales</h1>
      <p className="text-gray-500 text-sm -mt-4">Mesas de examen disponibles para inscripción</p>

      {loading ? <div className="card animate-pulse h-64 bg-gray-100" /> : (
        exams.length === 0 ? (
          <div className="card text-center py-12 text-gray-400">No hay exámenes disponibles en este momento.</div>
        ) : (
          <div className="grid gap-4">
            {exams.map(ex => {
              const isEnrolled = enrolled.includes(ex.id)
              return (
                <div key={ex.id} className="card hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className="bg-red-50 p-3 rounded-xl flex-shrink-0">
                        <BookMarked size={20} className="text-[#7A1E2C]" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{ex.subject?.name}</h3>
                        <p className="text-xs text-gray-500 mt-0.5">Código: {ex.subject?.code}</p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-600">
                          <span className="flex items-center gap-1"><Calendar size={12} />{new Date(ex.date).toLocaleDateString('es-AR')}</span>
                          <span className="flex items-center gap-1"><User size={12} />{ex.professor?.name || '-'}</span>
                          <span className="flex items-center gap-1"><MapPin size={12} />{ex.location}</span>
                        </div>
                      </div>
                    </div>
                    {isEnrolled ? (
                      <button onClick={() => unenroll(ex.id)} className="btn-secondary text-xs px-3 py-1.5 whitespace-nowrap">
                        Cancelar Inscripción
                      </button>
                    ) : (
                      <button onClick={() => enroll(ex.id)} className="btn-primary text-xs px-3 py-1.5 whitespace-nowrap">
                        Inscribirse
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )
      )}
    </div>
  )
}
