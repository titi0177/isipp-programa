import { Link, useRouterState } from '@tanstack/react-router'
import {
  LayoutDashboard, Users, BookOpen, GraduationCap, UserCheck,
  ClipboardList, Star, Calendar, FileText, Bell, Settings,
  ChevronRight, LogOut, BookMarked, BarChart3, ClipboardCheck,
  Link2
} from 'lucide-react'
import { supabase } from '@/lib/supabase'

interface NavItem {
  label: string
  href: string
  icon: React.ReactNode
}

const adminNav: NavItem[] = [
  { label: 'Dashboard', href: '/admin', icon: <LayoutDashboard size={18} /> },
  { label: 'Estudiantes', href: '/admin/students', icon: <Users size={18} /> },
  { label: 'Carreras', href: '/admin/programs', icon: <GraduationCap size={18} /> },
  { label: 'Materias', href: '/admin/subjects', icon: <BookOpen size={18} /> },
  { label: 'Profesores', href: '/admin/professors', icon: <UserCheck size={18} /> },
  { label: 'Inscripciones', href: '/admin/enrollments', icon: <ClipboardList size={18} /> },
  { label: 'Calificaciones', href: '/admin/grades', icon: <Star size={18} /> },
  { label: 'Asistencia', href: '/admin/attendance', icon: <ClipboardCheck size={18} /> },
  { label: 'Correlativas', href: '/admin/correlatives', icon: <Link2 size={18} /> },
  { label: 'Exámenes Finales', href: '/admin/final-exams', icon: <BookMarked size={18} /> },
  { label: 'Anuncios', href: '/admin/announcements', icon: <Bell size={18} /> },
  { label: 'Reportes', href: '/admin/reports', icon: <BarChart3 size={18} /> },
  { label: 'Calendario', href: '/admin/calendar', icon: <Calendar size={18} /> },
  { label: 'Configuración', href: '/admin/settings', icon: <Settings size={18} /> },
]

const studentNav: NavItem[] = [
  { label: 'Mi Panel', href: '/dashboard', icon: <LayoutDashboard size={18} /> },
  { label: 'Mis Materias', href: '/dashboard/subjects', icon: <BookOpen size={18} /> },
  { label: 'Historial Académico', href: '/dashboard/history', icon: <FileText size={18} /> },
  { label: 'Exámenes Finales', href: '/dashboard/exams', icon: <BookMarked size={18} /> },
  { label: 'Anuncios', href: '/dashboard/announcements', icon: <Bell size={18} /> },
  { label: 'Mi Perfil', href: '/dashboard/profile', icon: <UserCheck size={18} /> },
]

interface SidebarProps {
  role: 'admin' | 'student'
}

export function Sidebar({ role }: SidebarProps) {
  const router = useRouterState()
  const currentPath = router.location.pathname
  const navItems = role === 'admin' ? adminNav : studentNav

  const handleLogout = async () => {
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="px-4 py-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
            <GraduationCap size={22} className="text-[#7A1E2C]" />
          </div>
          <div>
            <div className="font-bold text-white text-sm leading-tight">ISIPP</div>
            <div className="text-white/60 text-xs">Sistema Académico</div>
          </div>
        </div>
      </div>

      {/* Role badge */}
      <div className="px-4 py-3 border-b border-white/10">
        <span className="text-xs font-semibold uppercase tracking-wider text-white/50">
          {role === 'admin' ? 'Administración' : 'Portal Estudiante'}
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 space-y-1">
        {navItems.map((item) => {
          const isActive = currentPath === item.href ||
            (item.href !== '/admin' && item.href !== '/dashboard' && currentPath.startsWith(item.href))
          return (
            <Link
              key={item.href}
              to={item.href}
              className={`sidebar-link ${isActive ? 'active' : ''}`}
            >
              {item.icon}
              <span className="flex-1">{item.label}</span>
              {isActive && <ChevronRight size={14} />}
            </Link>
          )
        })}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-white/10">
        <button
          onClick={handleLogout}
          className="sidebar-link w-full text-left"
        >
          <LogOut size={18} />
          <span>Cerrar Sesión</span>
        </button>
      </div>
    </aside>
  )
}
