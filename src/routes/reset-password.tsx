import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { GraduationCap } from 'lucide-react'

export const Route = createFileRoute('/reset-password')({
  component: ResetPasswordPage,
})

function ResetPasswordPage() {
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password !== confirm) { setError('Las contraseñas no coinciden.'); return }
    setLoading(true)
    const { error: err } = await supabase.auth.updateUser({ password })
    if (err) setError('Error al actualizar contraseña.')
    else setDone(true)
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#4A0F18] via-[#7A1E2C] to-[#9B2535] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden">
        <div className="bg-[#7A1E2C] px-8 py-6 text-center">
          <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center mx-auto mb-3">
            <GraduationCap size={28} className="text-[#7A1E2C]" />
          </div>
          <h1 className="text-xl font-bold text-white">ISIPP</h1>
          <p className="text-white/70 text-sm">Restablecer Contraseña</p>
        </div>
        <div className="p-8">
          {done ? (
            <div className="text-center">
              <p className="text-green-600 font-medium mb-4">✓ Contraseña actualizada exitosamente.</p>
              <a href="/login" className="btn-primary inline-block">Ir al Inicio de Sesión</a>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">{error}</div>}
              <div>
                <label className="form-label">Nueva Contraseña</label>
                <input type="password" value={password} onChange={e => setPassword(e.target.value)} required className="form-input" placeholder="••••••••" />
              </div>
              <div>
                <label className="form-label">Confirmar Contraseña</label>
                <input type="password" value={confirm} onChange={e => setConfirm(e.target.value)} required className="form-input" placeholder="••••••••" />
              </div>
              <button type="submit" disabled={loading} className="btn-primary w-full py-3">
                {loading ? 'Guardando...' : 'Actualizar Contraseña'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
