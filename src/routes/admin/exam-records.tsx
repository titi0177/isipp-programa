import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useToast } from '@/components/Toast'
import { generateExamRecordPdf, type ExamRecordStudentRow } from '@/utils/generateExamRecordPdf'
import { FileDown, Plus } from 'lucide-react'

const INSTITUTION = 'Instituto Superior de Informática Puerto Piray (ISIPP 1206)'

export const Route = createFileRoute('/admin/exam-records')({
  component: ExamRecordsAdminPage,
})

function ExamRecordsAdminPage() {
  const [records, setRecords] = useState<any[]>([])
  const [mesas, setMesas] = useState<any[]>([])
  const [mesaId, setMesaId] = useState('')
  const { showToast } = useToast()

  useEffect(() => {
    void load()
  }, [])

  async function load() {
    const [r1, r2] = await Promise.all([
      supabase
        .from('exam_records')
        .select('*, subject:subjects(name, code), professor:professors(name)')
        .order('created_at', { ascending: false }),
      supabase
        .from('final_exams')
        .select('*, subject:subjects(name, code, program:programs(name)), professor:professors(name)')
        .order('exam_date', { ascending: false }),
    ])
    setRecords(r1.data ?? [])
    setMesas(r2.data ?? [])
  }

  async function buildRowsForMesa(exam: any): Promise<ExamRecordStudentRow[]> {
    const { data: regs } = await supabase
      .from('exam_enrollments')
      .select('student:students(id, legajo, first_name, last_name)')
      .eq('final_exam_id', exam.id)

    const rows: ExamRecordStudentRow[] = []
    for (const r of regs ?? []) {
      const st = r.student as any
      if (!st?.id) continue
      const { data: enr } = await supabase
        .from('enrollments')
        .select('grades:grades(final_grade)')
        .eq('student_id', st.id)
        .eq('subject_id', exam.subject_id)
        .maybeSingle()
      const g = Array.isArray(enr?.grades) ? enr?.grades[0] : enr?.grades
      rows.push({
        legajo: st.legajo,
        nombre: `${st.last_name}, ${st.first_name}`,
        nota: g?.final_grade ?? null,
      })
    }
    return rows
  }

  async function crearActaDesdeMesa() {
    if (!mesaId) {
      showToast('Seleccioná una mesa de examen.', 'error')
      return
    }
    const exam = mesas.find((m) => m.id === mesaId)
    if (!exam) return

    const students = await buildRowsForMesa(exam)
    const examDateIso = exam.exam_date

    const { data: inserted, error } = await supabase
      .from('exam_records')
      .insert({
        subject_id: exam.subject_id,
        professor_id: exam.professor_id,
        final_exam_id: exam.id,
        exam_date: examDateIso,
        title: 'ACTA DE EXAMEN FINAL',
        students_grades: students,
        estado_acta: 'borrador',
        institution_id: exam.institution_id ?? undefined,
      })
      .select('id')
      .single()

    if (error) {
      showToast(error.message, 'error')
      return
    }

    showToast('Acta creada en estado borrador.')
    void load()

    if (inserted?.id) {
      descargarPdf({
        id: inserted.id,
        exam_date: examDateIso,
        title: 'ACTA DE EXAMEN FINAL',
        subject: exam.subject,
        professor: exam.professor,
        students_grades: students,
      })
    }
  }

  function descargarPdf(rec: any) {
    const students: ExamRecordStudentRow[] = Array.isArray(rec.students_grades)
      ? rec.students_grades
      : typeof rec.students_grades === 'string'
        ? JSON.parse(rec.students_grades)
        : []

    generateExamRecordPdf({
      title: rec.title ?? 'ACTA DE EXAMEN FINAL',
      institution: INSTITUTION,
      career: rec.subject?.program?.name,
      subjectName: rec.subject?.name ?? 'Materia',
      subjectCode: rec.subject?.code,
      examDate: new Date(rec.exam_date).toLocaleString('es-AR'),
      professorName: rec.professor?.name,
      students,
    })
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Actas de examen final</h1>
        <p className="mt-1 text-sm text-slate-600">
          Generá actas oficiales con alumnos inscriptos a la mesa y notas del cursado. Podés imprimir o guardar PDF.
        </p>
      </div>

      <div className="card space-y-4 p-5">
        <h2 className="font-semibold">Nueva acta desde mesa</h2>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="flex-1">
            <label className="form-label">Mesa de examen</label>
            <select className="form-input w-full" value={mesaId} onChange={(e) => setMesaId(e.target.value)}>
              <option value="">Seleccionar…</option>
              {mesas.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.subject?.name ?? 'Materia'} · {new Date(m.exam_date).toLocaleString('es-AR')}
                </option>
              ))}
            </select>
          </div>
          <button type="button" className="btn-primary flex items-center gap-2" onClick={() => void crearActaDesdeMesa()}>
            <Plus size={18} />
            Crear acta y PDF
          </button>
        </div>
      </div>

      <div className="card overflow-hidden p-0">
        <div className="border-b border-slate-100 px-5 py-3 font-semibold">Actas registradas</div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="table-header">
                <th className="px-4 py-2 text-left">Materia</th>
                <th className="px-4 py-2 text-left">Fecha</th>
                <th className="px-4 py-2 text-left">Estado</th>
                <th className="px-4 py-2 text-left">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {records.map((rec) => (
                <tr key={rec.id} className="border-b">
                  <td className="px-4 py-2">{rec.subject?.name}</td>
                  <td className="px-4 py-2">{new Date(rec.exam_date).toLocaleString('es-AR')}</td>
                  <td className="px-4 py-2 capitalize">{rec.estado_acta}</td>
                  <td className="px-4 py-2">
                    <button
                      type="button"
                      className="inline-flex items-center gap-1 text-sm font-semibold text-[var(--siu-blue)] hover:underline"
                      onClick={() => descargarPdf(rec)}
                    >
                      <FileDown size={16} />
                      PDF / imprimir
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {records.length === 0 && <p className="p-6 text-slate-600">No hay actas cargadas.</p>}
        </div>
      </div>
    </div>
  )
}
