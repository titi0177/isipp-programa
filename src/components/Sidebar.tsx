import { Link, useRouterState } from '@tanstack/react-router'
import {
  LayoutDashboard, Users, BookOpen, GraduationCap, UserCheck,
  ClipboardList, Star, Calendar, FileText, Bell, Settings,
  ChevronRight, LogOut, BookMarked, BarChart3, ClipboardCheck,
  Link2
} from 'lucide-react'
import { supabase } from '@/lib/supabase'

const LOGO_SRC = '/logo-isipp.png'
const LOGO_ALT = 'Instituto Superior de Informática Puerto Piray'

interface NavItem {
  label: string
  href: string
  icon: React.ReactNode
}

const professorNav: NavItem[] = [
  { label: 'Inicio', href: '/professor', icon: <LayoutDashboard size={18} /> },
  { label: 'Mis asignaturas', href: '/professor/subjects', icon: <BookOpen size={18} /> },
  { label: 'Calificaciones', href: '/professor/grades', icon: <Star size={18} /> },
  { label: 'Asistencia', href: '/professor/attendance', icon: <ClipboardCheck size={18} /> },
  { label: 'Materiales', href: '/professor/materials', icon: <FileText size={18} /> },
  { label: 'Seguridad', href: '/professor/settings', icon: <Settings size={18} /> },
]

const adminNav: NavItem[] = [
  { label: 'Inicio', href: '/admin', icon: <LayoutDashboard size={18} /> },
  { label: 'Estudiantes', href: '/admin/students', icon: <Users size={18} /> },
  { label: 'Propuestas formativas', href: '/admin/programs', icon: <GraduationCap size={18} /> },
  { label: 'Asignaturas', href: '/admin/subjects', icon: <BookOpen size={18} /> },
  { label: 'Docentes', href: '/admin/professors', icon: <UserCheck size={18} /> },
  { label: 'Inscripciones a cursadas', href: '/admin/enrollments', icon: <ClipboardList size={18} /> },
  { label: 'Actas / Calificaciones', href: '/admin/grades', icon: <Star size={18} /> },
  { label: 'Asistencia', href: '/admin/attendance', icon: <ClipboardCheck size={18} /> },
  { label: 'Correlativas', href: '/admin/correlatives', icon: <Link2 size={18} /> },
  { label: 'Mesas de exámenes', href: '/admin/final-exams', icon: <BookMarked size={18} /> },
  { label: 'Actas de examen', href: '/admin/exam-records', icon: <FileText size={18} /> },
  { label: 'Novedades', href: '/admin/announcements', icon: <Bell size={18} /> },
  { label: 'Reportes y estadísticas', href: '/admin/reports', icon: <BarChart3 size={18} /> },
  { label: 'Calendario', href: '/admin/calendar', icon: <Calendar size={18} /> },
  { label: 'Parámetros / Seguridad', href: '/admin/settings', icon: <Settings size={18} /> },
]

const studentNav: NavItem[] = [
  { label: 'Inicio', href: '/dashboard', icon: <LayoutDashboard size={18} /> },
  { label: 'Mis cursadas', href: '/dashboard/subjects', icon: <BookOpen size={18} /> },
  { label: 'Plan de estudios', href: '/dashboard/roadmap', icon: <GraduationCap size={18} /> },
  { label: 'Historial académico', href: '/dashboard/history', icon: <FileText size={18} /> },
  { label: 'Inscripción a exámenes', href: '/dashboard/exams', icon: <BookMarked size={18} /> },
  { label: 'Novedades', href: '/dashboard/announcements', icon: <Bell size={18} /> },
  { label: 'Datos personales', href: '/dashboard/profile', icon: <UserCheck size={18} /> },
]

interface SidebarProps {
  role: 'admin' | 'student' | 'professor'
}

export function Sidebar({ role }: SidebarProps) {
  const router = useRouterState()
  const currentPath = router.location.pathname
  const navItems =
    role === 'admin' ? adminNav : role === 'professor' ? professorNav : studentNav

  const handleLogout = async () => {
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  return (
    <aside className="sidebar">
      <div className="siu-sidebar-brand">
        <div className="siu-sidebar-logo-box">
          <img src={LOGO_SRC} alt={LOGO_ALT} className="siu-sidebar-logo" width={220} height={120} />
        </div>
        <p className="mt-3 text-center text-[11px] font-semibold uppercase leading-snug tracking-wide text-white/90">
          Sistema de gestión académica
        </p>
      </div>

      <div className="siu-sidebar-section-label">
        {role === 'admin'
          ? 'Menú de administración'
          : role === 'professor'
            ? 'Menú docente'
            : 'Menú de autogestión'}
      </div>

      <nav className="flex-1 space-y-0.5 py-3">
        {navItems.map((item) => {
          const isActive = currentPath === item.href ||
            (item.href !== '/admin' &&
              item.href !== '/dashboard' &&
              item.href !== '/professor' &&
              currentPath.startsWith(item.href))
          return (
            <Link
              key={item.href}
              to={item.href}
              className={`sidebar-link ${isActive ? 'active' : ''}`}
            >
              {item.icon}
              <span className="flex-1 leading-snug">{item.label}</span>
              {isActive && <ChevronRight size={14} className="opacity-70" />}
            </Link>
          )
        })}
      </nav>

      <div className="mt-auto border-t border-[var(--siu-border-light)] bg-white/60 p-3">
        <button
          type="button"
          onClick={handleLogout}
          className="sidebar-link w-full text-left text-slate-600 hover:text-red-800"
        >
          <LogOut size={18} />
          <span className="font-semibold">Cerrar sesión</span>
        </button>
      </div>
    </aside>
  )
}
