import { Bell, User, ChevronDown } from 'lucide-react'
import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import { supabase } from '@/lib/supabase'

const LOGO_SRC = '/logo-isipp.png'

interface TopNavProps {
  userName?: string
  role?: 'admin' | 'student' | 'professor'
}

export function TopNav({ userName = 'Usuario', role }: TopNavProps) {
  const [showMenu, setShowMenu] = useState(false)

  const handleLogout = async () => {
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  const moduleLine =
    role === 'admin'
      ? 'Módulo de administración del sistema'
      : role === 'professor'
        ? 'Módulo docente — cursadas y evaluaciones'
        : 'Módulo de autogestión y consultas académicas'

  return (
    <header className="siu-topnav">
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <img src={LOGO_SRC} alt="" className="siu-topnav-logo" width={140} height={48} />
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <h1 className="siu-topnav-title truncate text-sm leading-tight sm:text-base">
            Instituto Superior de Informática Puerto Piray
          </h1>
          <p className="siu-topnav-muted hidden truncate sm:block">{moduleLine}</p>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        <Link
          to={role === 'admin' ? '/admin/announcements' : '/dashboard/announcements'}
          className="relative rounded-sm p-2 text-white/90 transition-colors hover:bg-white/10"
          title="Novedades"
        >
          <Bell size={20} />
          <span
            className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-white ring-2 ring-[var(--isipp-bordo-deep)]"
            aria-hidden
          />
        </Link>

        <div className="relative">
          <button
            type="button"
            onClick={() => setShowMenu(!showMenu)}
            className="flex items-center gap-2 rounded-sm py-1.5 pl-1 pr-2 text-white transition-colors hover:bg-white/10"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-sm border border-white/25 bg-white/15">
              <User size={17} className="text-white" />
            </div>
            <div className="hidden text-left md:block">
              <div className="max-w-[160px] truncate text-sm font-semibold leading-tight">
                {userName}
              </div>
              <div className="text-[11px] font-medium uppercase tracking-wide text-white/70">
                {role === 'admin' ? 'Administración' : role === 'professor' ? 'Docente' : 'Alumno'}
              </div>
            </div>
            <ChevronDown size={14} className="text-white/60" />
          </button>

          {showMenu && (
            <div className="absolute right-0 top-full z-50 mt-1 w-52 border border-[var(--siu-border)] bg-white py-1 shadow-lg">
              <Link
                to={role === 'admin' ? '/admin/settings' : role === 'professor' ? '/professor/settings' : '/dashboard/profile'}
                className="block px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-[var(--siu-blue-soft)]"
                onClick={() => setShowMenu(false)}
              >
                {role === 'admin'
                  ? 'Parámetros y contraseña'
                  : role === 'professor'
                    ? 'Seguridad y contraseña'
                    : 'Mis datos personales'}
              </Link>
              <hr className="my-1 border-[var(--siu-border-light)]" />
              <button
                type="button"
                onClick={handleLogout}
                className="block w-full px-4 py-2.5 text-left text-sm font-semibold text-red-700 hover:bg-red-50"
              >
                Cerrar sesión
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
