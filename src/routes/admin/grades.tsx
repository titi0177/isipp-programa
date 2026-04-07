import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { DataTable } from '@/components/DataTable'
import { Modal } from '@/components/Modal'
import { useToast } from '@/components/Toast'
import { Pencil } from 'lucide-react'
import { StatusBadge } from '@/components/StatusBadge'

export const Route = createFileRoute('/admin/grades')({
  component: GradesPage,
})

function GradesPage() {
  const [enrollments, setEnrollments] = useState<any[]>([])
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<any>({})
  const { showToast } = useToast()

  useEffect(() => { load() }, [])

  async function load() {
    const { data } = await supabase
      .from('enrollments')
      .select('*, student:students(first_name, last_name, legajo), subject:subjects(name, code), grade:grades(*)')
      .order('created_at', { ascending: false })
    setEnrollments(data || [])
  }

  const openEdit = (enr: any) => {
    const g = enr.grade?.[0] || {}
    setEditing({ enrollment_id: enr.id, ...g, studentName: `${enr.student?.last_name}, ${enr.student?.first_name}`, subjectName: enr.subject?.name })
    setModalOpen(true)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    const { id, studentName, subjectName, created_at, ...data } = editing
    if (id) {
      await supabase.from('grades').update(data).eq('id', id)
    } else {
      await supabase.from('grades').insert({ ...data, status: data.status || 'in_progress' })
    }
    showToast('Calificación guardada.'); setModalOpen(false); load()
  }

  const STATUS_OPTIONS = ['promoted', 'regular', 'in_progress', 'free', 'failed', 'passed']

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Calificaciones</h1>

      <DataTable
        columns={[
          { key: 'student', label: 'Estudiante', render: (r: any) => `${r.student?.last_name}, ${r.student?.first_name}` },
          { key: 'subject', label: 'Materia', render: (r: any) => r.subject?.name },
          { key: 'partial', label: 'Parcial', render: (r: any) => r.grade?.[0]?.partial_grade ?? '-' },
          { key: 'exam', label: 'Final Mesa', render: (r: any) => r.grade?.[0]?.final_exam_grade ?? '-' },
          { key: 'final', label: 'Nota Final', render: (r: any) => r.grade?.[0]?.final_grade ?? '-' },
          { key: 'status', label: 'Estado', render: (r: any) => <StatusBadge status={r.grade?.[0]?.status || 'in_progress'} /> },
        ]}
        data={enrollments}
        actions={(row: any) => (
          <button onClick={() => openEdit(row)} className="p-1.5 text-gray-500 hover:text-[#7A1E2C] hover:bg-red-50 rounded-lg"><Pencil size={15} /></button>
        )}
      />

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Editar Calificación">
        <form onSubmit={handleSave} className="space-y-4">
          <div className="p-3 bg-gray-50 rounded-lg text-sm">
            <p className="font-medium">{editing.studentName}</p>
            <p className="text-gray-500">{editing.subjectName}</p>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="form-label">Parcial (1-10)</label>
              <input type="number" min={1} max={10} step={0.1} className="form-input" value={editing.partial_grade ?? ''} onChange={e => setEditing((p: any) => ({ ...p, partial_grade: e.target.value ? +e.target.value : null }))} />
            </div>
            <div>
              <label className="form-label">Final Mesa (1-10)</label>
              <input type="number" min={1} max={10} step={0.1} className="form-input" value={editing.final_exam_grade ?? ''} onChange={e => setEditing((p: any) => ({ ...p, final_exam_grade: e.target.value ? +e.target.value : null }))} />
            </div>
            <div>
              <label className="form-label">Nota Final (1-10)</label>
              <input type="number" min={1} max={10} step={0.1} className="form-input" value={editing.final_grade ?? ''} onChange={e => setEditing((p: any) => ({ ...p, final_grade: e.target.value ? +e.target.value : null }))} />
            </div>
          </div>
          <div>
            <label className="form-label">Estado</label>
            <select className="form-input" value={editing.status || 'in_progress'} onChange={e => setEditing((p: any) => ({ ...p, status: e.target.value }))}>
              {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" className="btn-primary flex-1">Guardar</button>
            <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary flex-1">Cancelar</button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
