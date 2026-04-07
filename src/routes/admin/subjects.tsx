import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { DataTable } from '@/components/DataTable'
import { Modal } from '@/components/Modal'
import { useToast } from '@/components/Toast'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import type { Subject, Program, Professor } from '@/types'

export const Route = createFileRoute('/admin/subjects')({
  component: SubjectsPage,
})

function SubjectsPage() {
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [programs, setPrograms] = useState<Program[]>([])
  const [professors, setProfessors] = useState<Professor[]>([])
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Partial<Subject>>({})
  const { showToast } = useToast()

  useEffect(() => { load() }, [])

  async function load() {
    const [{ data: s }, { data: p }, { data: pr }] = await Promise.all([
      supabase.from('subjects').select('*, program:programs(name), professor:professors(name)').order('name'),
      supabase.from('programs').select('*').order('name'),
      supabase.from('professors').select('*').order('name'),
    ])
    setSubjects(s || [])
    setPrograms(p || [])
    setProfessors(pr || [])
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    const { id, created_at, program, professor, ...data } = editing as any
    if (id) await supabase.from('subjects').update(data).eq('id', id)
    else await supabase.from('subjects').insert(data)
    showToast('Materia guardada.'); setModalOpen(false); load()
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar esta materia?')) return
    await supabase.from('subjects').delete().eq('id', id)
    showToast('Materia eliminada.', 'info'); load()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Materias</h1>
        <button onClick={() => { setEditing({ year: 1, credits: 4 }); setModalOpen(true) }} className="btn-primary flex items-center gap-2">
          <Plus size={16} /> Nueva Materia
        </button>
      </div>

      <DataTable
        columns={[
          { key: 'code', label: 'Código' },
          { key: 'name', label: 'Nombre' },
          { key: 'program', label: 'Carrera', render: (r: any) => r.program?.name || '-' },
          { key: 'year', label: 'Año' },
          { key: 'professor', label: 'Profesor', render: (r: any) => r.professor?.name || '-' },
          { key: 'credits', label: 'Créditos' },
        ]}
        data={subjects as any}
        actions={(row: any) => (
          <div className="flex items-center gap-2 justify-end">
            <button onClick={() => { setEditing(row); setModalOpen(true) }} className="p-1.5 text-gray-500 hover:text-[#7A1E2C] hover:bg-red-50 rounded-lg"><Pencil size={15} /></button>
            <button onClick={() => handleDelete(row.id)} className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg"><Trash2 size={15} /></button>
          </div>
        )}
      />

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing.id ? 'Editar Materia' : 'Nueva Materia'}>
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="form-label">Nombre *</label>
              <input className="form-input" required value={editing.name || ''} onChange={e => setEditing(p => ({ ...p, name: e.target.value }))} />
            </div>
            <div>
              <label className="form-label">Código *</label>
              <input className="form-input" required value={editing.code || ''} onChange={e => setEditing(p => ({ ...p, code: e.target.value }))} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="form-label">Carrera</label>
              <select className="form-input" value={editing.program_id || ''} onChange={e => setEditing(p => ({ ...p, program_id: e.target.value }))}>
                <option value="">Sin asignar</option>
                {programs.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            <div>
              <label className="form-label">Año</label>
              <input type="number" min={1} max={6} className="form-input" value={editing.year || 1} onChange={e => setEditing(p => ({ ...p, year: +e.target.value }))} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="form-label">Profesor</label>
              <select className="form-input" value={editing.professor_id || ''} onChange={e => setEditing(p => ({ ...p, professor_id: e.target.value }))}>
                <option value="">Sin asignar</option>
                {professors.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            <div>
              <label className="form-label">Créditos</label>
              <input type="number" min={1} className="form-input" value={editing.credits || 4} onChange={e => setEditing(p => ({ ...p, credits: +e.target.value }))} />
            </div>
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
