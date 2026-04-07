import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { DataTable } from '@/components/DataTable'
import { Modal } from '@/components/Modal'
import { useToast } from '@/components/Toast'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import type { Professor } from '@/types'

export const Route = createFileRoute('/admin/professors')({
  component: ProfessorsPage,
})

function ProfessorsPage() {
  const [professors, setProfessors] = useState<Professor[]>([])
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Partial<Professor>>({})
  const { showToast } = useToast()

  useEffect(() => { load() }, [])

  const load = async () => {
    const { data } = await supabase.from('professors').select('*').order('name')
    setProfessors(data || [])
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    const { id, created_at, ...data } = editing as any
    if (id) await supabase.from('professors').update(data).eq('id', id)
    else await supabase.from('professors').insert(data)
    showToast('Profesor guardado.'); setModalOpen(false); load()
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar este profesor?')) return
    await supabase.from('professors').delete().eq('id', id)
    showToast('Profesor eliminado.', 'info'); load()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Profesores</h1>
        <button onClick={() => { setEditing({}); setModalOpen(true) }} className="btn-primary flex items-center gap-2">
          <Plus size={16} /> Nuevo Profesor
        </button>
      </div>

      <DataTable
        columns={[
          { key: 'name', label: 'Nombre' },
          { key: 'email', label: 'Email' },
          { key: 'department', label: 'Departamento' },
        ]}
        data={professors as any}
        actions={(row: any) => (
          <div className="flex items-center gap-2 justify-end">
            <button onClick={() => { setEditing(row); setModalOpen(true) }} className="p-1.5 text-gray-500 hover:text-[#7A1E2C] hover:bg-red-50 rounded-lg"><Pencil size={15} /></button>
            <button onClick={() => handleDelete(row.id)} className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg"><Trash2 size={15} /></button>
          </div>
        )}
      />

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing.id ? 'Editar Profesor' : 'Nuevo Profesor'}>
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="form-label">Nombre completo *</label>
            <input className="form-input" required value={editing.name || ''} onChange={e => setEditing(p => ({ ...p, name: e.target.value }))} />
          </div>
          <div>
            <label className="form-label">Email *</label>
            <input type="email" className="form-input" required value={editing.email || ''} onChange={e => setEditing(p => ({ ...p, email: e.target.value }))} />
          </div>
          <div>
            <label className="form-label">Departamento *</label>
            <input className="form-input" required value={editing.department || ''} onChange={e => setEditing(p => ({ ...p, department: e.target.value }))} />
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
