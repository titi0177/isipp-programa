import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useToast } from '@/components/Toast'
import { User, Lock, Save } from 'lucide-react'

export const Route = createFileRoute('/dashboard/profile')({
  component: ProfilePage,
})

function ProfilePage() {
  const [student, setStudent] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [currentPass, setCurrentPass] = useState('')
  const [newPass, setNewPass] = useState('')
  const [confirmPass, setConfirmPass] = useState('')
  const [saving, setSaving] = useState(false)
  const { showToast } = useToast()

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return
      supabase.from('students').select('*, program:programs(name)').eq('user_id', user.id).single()
        .then(({ data }) => { setStudent(data); setLoading(false) })
    })
  }, [])

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (newPass !== confirmPass) { showToast('Las contraseñas no coinciden.', 'error'); return }
    if (newPass.length < 6) { showToast('La contraseña debe tener al menos 6 caracteres.', 'error'); return }
    setSaving(true)
    const { error } = await supabase.auth.updateUser({ password: newPass })
    if (error) showToast('Error al cambiar contraseña.', 'error')
    else { showToast('Contraseña actualizada exitosamente.'); setCurrentPass(''); setNewPass(''); setConfirmPass('') }
    setSaving(false)
  }

  if (loading) return <div className="card animate-pulse h-64 bg-gray-100" />

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900">Mi Perfil</h1>

      <div className="card">
        <div className="flex items-center gap-4 mb-6">
          <div className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-[var(--siu-gold)] bg-[var(--siu-blue)]">
            <User size={28} className="text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">{student?.first_name} {student?.last_name}</h2>
            <p className="text-gray-500 text-sm">Legajo: {student?.legajo}</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 text-sm">
          {[
            ['Nombre', `${student?.first_name} ${student?.last_name}`],
            ['DNI', student?.dni],
            ['Legajo', student?.legajo],
            ['Email', student?.email],
            ['Carrera', student?.program?.name || '-'],
            ['Año', `${student?.year}°`],
            ['Estado', student?.status],
          ].map(([label, value]) => (
            <div key={label}>
              <span className="text-gray-500">{label}:</span>
              <p className="font-medium mt-0.5 capitalize">{value}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        <h2 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Lock size={16} className="text-[var(--siu-blue)]" /> Cambiar contraseña
        </h2>
        <form onSubmit={handleChangePassword} className="space-y-4">
          <div>
            <label className="form-label">Nueva Contraseña</label>
            <input type="password" value={newPass} onChange={e => setNewPass(e.target.value)} required className="form-input" placeholder="••••••••" />
          </div>
          <div>
            <label className="form-label">Confirmar Nueva Contraseña</label>
            <input type="password" value={confirmPass} onChange={e => setConfirmPass(e.target.value)} required className="form-input" placeholder="••••••••" />
          </div>
          <button type="submit" disabled={saving} className="btn-primary flex items-center gap-2">
            <Save size={16} /> {saving ? 'Guardando...' : 'Actualizar Contraseña'}
          </button>
        </form>
      </div>
    </div>
  )
}
