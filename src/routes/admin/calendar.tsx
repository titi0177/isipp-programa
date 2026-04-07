import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { DataTable } from '@/components/DataTable'
import { Modal } from '@/components/Modal'
import { useToast } from '@/components/Toast'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import type { CalendarEvent } from '@/types'

export const Route = createFileRoute('/admin/calendar')({
  component: CalendarPage,
})

function CalendarPage() {
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Partial<CalendarEvent>>({})
  const { showToast } = useToast()

  useEffect(() => { load() }, [])

  const load = async () => {
    const { data } = await supabase.from('calendar_events').select('*').order('date')
    setEvents(data || [])
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    const { id, created_at, ...data } = editing as any
    if (id) await supabase.from('calendar_events').update(data).eq('id', id)
    else await supabase.from('calendar_events').insert(data)
    showToast('Evento guardado.'); setModalOpen(false); load()
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar este evento?')) return
    await supabase.from('calendar_events').delete().eq('id', id)
    showToast('Evento eliminado.', 'info'); load()
  }

  const typeLabel: Record<string, string> = { exam: 'Examen', deadline: 'Vencimiento', event: 'Evento' }
  const typeColor: Record<string, string> = {
    exam: 'bg-red-100 text-red-700',
    deadline: 'bg-orange-100 text-orange-700',
    event: 'bg-blue-100 text-blue-700',
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Calendario Académico</h1>
        <button onClick={() => { setEditing({ type: 'event', date: new Date().toISOString().slice(0, 10) }); setModalOpen(true) }} className="btn-primary flex items-center gap-2">
          <Plus size={16} /> Nuevo Evento
        </button>
      </div>

      <DataTable
        columns={[
          { key: 'title', label: 'Título' },
          { key: 'type', label: 'Tipo', render: (r: any) => <span className={`px-2 py-1 rounded-full text-xs font-medium ${typeColor[r.type] || ''}`}>{typeLabel[r.type] || r.type}</span> },
          { key: 'date', label: 'Fecha', render: (r: any) => new Date(r.date).toLocaleDateString('es-AR') },
          { key: 'description', label: 'Descripción', render: (r: any) => r.description || '-' },
        ]}
        data={events as any}
        actions={(row: any) => (
          <div className="flex items-center gap-2 justify-end">
            <button onClick={() => { setEditing(row); setModalOpen(true) }} className="p-1.5 text-gray-500 hover:text-[#7A1E2C] hover:bg-red-50 rounded-lg"><Pencil size={15} /></button>
            <button onClick={() => handleDelete(row.id)} className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg"><Trash2 size={15} /></button>
          </div>
        )}
      />

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing.id ? 'Editar Evento' : 'Nuevo Evento'}>
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="form-label">Título *</label>
            <input className="form-input" required value={editing.title || ''} onChange={e => setEditing(p => ({ ...p, title: e.target.value }))} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="form-label">Tipo *</label>
              <select className="form-input" required value={editing.type || 'event'} onChange={e => setEditing(p => ({ ...p, type: e.target.value as any }))}>
                <option value="event">Evento</option>
                <option value="exam">Examen</option>
                <option value="deadline">Vencimiento</option>
              </select>
            </div>
            <div>
              <label className="form-label">Fecha *</label>
              <input type="date" className="form-input" required value={editing.date || ''} onChange={e => setEditing(p => ({ ...p, date: e.target.value }))} />
            </div>
          </div>
          <div>
            <label className="form-label">Descripción</label>
            <textarea className="form-input" rows={3} value={editing.description || ''} onChange={e => setEditing(p => ({ ...p, description: e.target.value }))} />
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
