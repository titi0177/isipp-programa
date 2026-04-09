import { createFileRoute, redirect } from '@tanstack/react-router'
import { useState } from 'react'
import { Eye, EyeOff, Lock, Mail } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useNavigate } from '@tanstack/react-router'

export const Route = createFileRoute('/login')({
  beforeLoad: async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) throw redirect({ to: '/' })
  },
  component: LoginPage,
})

function LoginPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [forgotMode, setForgotMode] = useState(false)
  const [resetSent, setResetSent] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { error: err } = await supabase.auth.signInWithPassword({ email, password })
    if (err) {
      setError('Usuario o contraseña incorrectos. Verifique los datos ingresados.')
      setLoading(false)
      return
    }
    navigate({ to: '/' })
  }

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })
    setResetSent(true)
    setLoading(false)
  }

  return (
    <div className="siu-login-page relative flex items-center justify-center p-4">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage: `linear-gradient(90deg, var(--siu-border) 1px, transparent 1px),
            linear-gradient(var(--siu-border) 1px, transparent 1px)`,
          backgroundSize: '24px 24px',
        }}
      />

      <div className="relative w-full max-w-md">
        <div className="siu-login-card bg-white">
          <div className="siu-login-banner">
            <div className="siu-login-logo-wrap">
              <img
                src="/logo-isipp.png"
                alt="Instituto Superior de Informática Puerto Piray"
                className="siu-login-logo"
                width={280}
                height={140}
              />
            </div>
            <p className="mt-2 text-sm font-semibold text-white/95">
              Sistema de Gestión Académica
            </p>
            <p className="mt-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/80">
              Acceso seguro · Autogestión
            </p>
          </div>

          <div className="border-b border-[var(--siu-border-light)] bg-[var(--isipp-bordo-soft)] px-6 py-2 text-center text-xs font-semibold text-[var(--isipp-bordo-dark)]">
            Ingrese con el correo institucional asignado
          </div>

          <div className="px-8 py-7">
            {!forgotMode ? (
              <>
                <h2 className="siu-page-title mb-1 text-lg">Inicio de sesión</h2>
                <p className="siu-page-subtitle mb-5">Autenticación segura del sistema</p>
                {error && (
                  <div className="mb-4 border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-800" style={{ borderRadius: '2px' }}>
                    {error}
                  </div>
                )}
                <form onSubmit={handleLogin} className="space-y-4">
                  <div>
                    <label className="form-label" htmlFor="login-email">Usuario (e-mail)</label>
                    <div className="relative">
                      <Mail size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--siu-text-muted)]" />
                      <input
                        id="login-email"
                        type="email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        required
                        autoComplete="username"
                        className="form-input pl-9"
                        placeholder="nombre.apellido@institucion.edu.ar"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="form-label" htmlFor="login-pass">Contraseña</label>
                    <div className="relative">
                      <Lock size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--siu-text-muted)]" />
                      <input
                        id="login-pass"
                        type={showPass ? 'text' : 'password'}
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        required
                        autoComplete="current-password"
                        className="form-input pl-9 pr-10"
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPass(!showPass)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--siu-text-muted)] hover:text-[var(--siu-navy)]"
                        aria-label={showPass ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                      >
                        {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-primary w-full py-3 font-bold"
                  >
                    {loading ? 'Verificando…' : 'Ingresar'}
                  </button>
                </form>
                <button
                  type="button"
                  onClick={() => setForgotMode(true)}
                  className="mt-4 w-full text-center text-sm font-semibold text-[var(--siu-blue)] hover:underline"
                >
                  ¿Olvidó o bloqueó su contraseña?
                </button>
              </>
            ) : (
              <>
                <h2 className="siu-page-title mb-1 text-lg">Recuperar acceso</h2>
                <p className="siu-page-subtitle mb-5">
                  Se enviará un enlace al correo registrado en el sistema.
                </p>
                {resetSent ? (
                  <div className="border border-emerald-200 bg-emerald-50 px-4 py-3 text-center text-sm text-emerald-900" style={{ borderRadius: '2px' }}>
                    Se enviaron las instrucciones a su casilla de correo.
                  </div>
                ) : (
                  <form onSubmit={handleReset} className="space-y-4">
                    <div>
                      <label className="form-label" htmlFor="reset-email">Correo electrónico</label>
                      <input
                        id="reset-email"
                        type="email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        required
                        className="form-input"
                        placeholder="usuario@institucion.edu.ar"
                      />
                    </div>
                    <button type="submit" disabled={loading} className="btn-primary w-full py-3 font-bold">
                      {loading ? 'Enviando…' : 'Enviar instrucciones'}
                    </button>
                  </form>
                )}
                <button
                  type="button"
                  onClick={() => { setForgotMode(false); setResetSent(false) }}
                  className="mt-4 w-full text-center text-sm font-medium text-[var(--siu-text-muted)] hover:text-[var(--siu-navy)]"
                >
                  ← Volver al inicio de sesión
                </button>
              </>
            )}
          </div>
        </div>

        <p className="mt-6 text-center text-xs font-medium text-[var(--siu-text-muted)]">
          © {new Date().getFullYear()} Instituto Superior de Informática Puerto Piray
        </p>
      </div>
    </div>
  )
}
