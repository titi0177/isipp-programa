import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { DataTable } from '@/components/DataTable'
import { Modal } from '@/components/Modal'
import { useToast } from '@/components/Toast'
import { Pencil } from 'lucide-react'

export const Route = createFileRoute('/admin/attendance')({
  component: AttendancePage,
})

function AttendancePage() {
  const [enrollments, setEnrollments] = useState<any[]>([])
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<any>({})
  const { showToast } = useToast()

  useEffect(() => { load() }, [])

  async function load() {
    const { data } = await supabase
      .from('enrollments')
      .select('*, student:students(first_name, last_name, legajo), subject:subjects(name), attendance:attendance(*)')
      .order('created_at', { ascending: false })
    setEnrollments(data || [])
  }

  const openEdit = (enr: any) => {
    const a = enr.attendance?.[0] || {}
    setEditing({ enrollment_id: enr.id, ...a, studentName: `${enr.student?.last_name}, ${enr.student?.first_name}`, subjectName: enr.subject?.name })
    setModalOpen(true)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    const { id, studentName, subjectName, created_at, ...data } = editing
    if (id) await supabase.from('attendance').update({ percentage: data.percentage }).eq('id', id)
    else await supabase.from('attendance').insert(data)
    showToast('Asistencia guardada.'); setModalOpen(false); load()
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Asistencia</h1>

      <DataTable
        columns={[
          { key: 'student', label: 'Estudiante', render: (r: any) => `${r.student?.last_name}, ${r.student?.first_name}` },
          { key: 'legajo', label: 'Legajo', render: (r: any) => r.student?.legajo },
          { key: 'subject', label: 'Materia', render: (r: any) => r.subject?.name },
          { key: 'attendance', label: 'Asistencia', render: (r: any) => {
            const pct = r.attendance?.[0]?.percentage
            if (pct == null) return '-'
            const color = pct >= 75 ? 'text-green-600' : pct >= 50 ? 'text-yellow-600' : 'text-red-600'
            return <span className={`font-semibold ${color}`}>{pct}%</span>
          }},
        ]}
        data={enrollments}
        actions={(row: any) => (
          <button onClick={() => openEdit(row)} className="p-1.5 text-gray-500 hover:text-[#7A1E2C] hover:bg-red-50 rounded-lg"><Pencil size={15} /></button>
        )}
      />

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Editar Asistencia">
        <form onSubmit={handleSave} className="space-y-4">
          <div className="p-3 bg-gray-50 rounded-lg text-sm">
            <p className="font-medium">{editing.studentName}</p>
            <p className="text-gray-500">{editing.subjectName}</p>
          </div>
          <div>
            <label className="form-label">Porcentaje de Asistencia (0-100)</label>
            <input type="number" min={0} max={100} className="form-input" required value={editing.percentage ?? ''} onChange={e => setEditing((p: any) => ({ ...p, percentage: +e.target.value }))} />
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
