import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { useToast } from '@/components/Toast'
import { supabase } from '@/lib/supabase'
import { Settings, Lock } from 'lucide-react'

export const Route = createFileRoute('/admin/settings')({
  component: SettingsPage,
})

function SettingsPage() {
  const [newPass, setNewPass] = useState('')
  const [confirmPass, setConfirmPass] = useState('')
  const [saving, setSaving] = useState(false)
  const { showToast } = useToast()

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (newPass !== confirmPass) { showToast('Las contraseñas no coinciden.', 'error'); return }
    if (newPass.length < 6) { showToast('La contraseña debe tener al menos 6 caracteres.', 'error'); return }
    setSaving(true)
    const { error } = await supabase.auth.updateUser({ password: newPass })
    if (error) showToast('Error al cambiar contraseña.', 'error')
    else { showToast('Contraseña actualizada.'); setNewPass(''); setConfirmPass('') }
    setSaving(false)
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
        <Settings size={24} className="text-[var(--siu-blue)]" /> Configuración
      </h1>

      <div className="card">
        <h2 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Lock size={16} className="text-[var(--siu-blue)]" /> Cambiar contraseña del operador
        </h2>
        <form onSubmit={handleChangePassword} className="space-y-4">
          <div>
            <label className="form-label">Nueva Contraseña</label>
            <input type="password" value={newPass} onChange={e => setNewPass(e.target.value)} required className="form-input" placeholder="••••••••" />
          </div>
          <div>
            <label className="form-label">Confirmar Contraseña</label>
            <input type="password" value={confirmPass} onChange={e => setConfirmPass(e.target.value)} required className="form-input" placeholder="••••••••" />
          </div>
          <button type="submit" disabled={saving} className="btn-primary">
            {saving ? 'Guardando...' : 'Actualizar Contraseña'}
          </button>
        </form>
      </div>

      <div className="card">
        <h2 className="text-base font-semibold text-gray-900 mb-2">Información del Sistema</h2>
        <div className="space-y-2 text-sm text-gray-600">
          <p><span className="font-medium">Institución:</span> Instituto Superior ISIPP</p>
          <p><span className="font-medium">Sistema:</span> ISIPP Academic System v1.0</p>
          <p><span className="font-medium">Backend:</span> Supabase PostgreSQL</p>
        </div>
      </div>
    </div>
  )
}
