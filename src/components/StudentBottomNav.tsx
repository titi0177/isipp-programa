import { Link, useRouterState } from '@tanstack/react-router'
import { LayoutDashboard, BookOpen, Map, Bell, User } from 'lucide-react'

const items = [
  { to: '/dashboard', label: 'Inicio', icon: LayoutDashboard, match: (p: string) => p === '/dashboard' },
  { to: '/dashboard/subjects', label: 'Cursadas', icon: BookOpen, match: (p: string) => p.startsWith('/dashboard/subjects') },
  { to: '/dashboard/roadmap', label: 'Plan', icon: Map, match: (p: string) => p.startsWith('/dashboard/roadmap') },
  { to: '/dashboard/announcements', label: 'Avisos', icon: Bell, match: (p: string) => p.startsWith('/dashboard/announcements') },
  { to: '/dashboard/profile', label: 'Perfil', icon: User, match: (p: string) => p.startsWith('/dashboard/profile') },
] as const

export function StudentBottomNav() {
  const { location } = useRouterState()
  const path = location.pathname

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 flex border-t border-[var(--siu-border-light)] bg-white/95 px-1 py-1.5 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] backdrop-blur-md md:hidden"
      aria-label="Navegación principal"
    >
      {items.map(({ to, label, icon: Icon, match }) => {
        const active = match(path)
        return (
          <Link
            key={to}
            to={to}
            className={`flex flex-1 flex-col items-center gap-0.5 rounded-sm px-1 py-1.5 text-[10px] font-semibold ${
              active ? 'text-[var(--isipp-bordo-deep)]' : 'text-slate-500'
            }`}
          >
            <Icon className="h-5 w-5" strokeWidth={active ? 2.25 : 2} />
            <span className="leading-none">{label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
