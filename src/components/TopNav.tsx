import { Bell, User, ChevronDown } from 'lucide-react'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'

interface TopNavProps {
  userName?: string
  role?: 'admin' | 'student'
}

export function TopNav({ userName = 'Usuario', role }: TopNavProps) {
  const [showMenu, setShowMenu] = useState(false)

  const handleLogout = async () => {
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  return (
    <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-6 sticky top-0 z-30">
      <div className="flex items-center gap-2">
        <h1 className="text-lg font-semibold text-[#7A1E2C]">ISIPP Academic System</h1>
        <span className="hidden md:inline text-gray-400">|</span>
        <span className="hidden md:inline text-sm text-gray-500">Instituto Superior ISIPP</span>
      </div>

      <div className="flex items-center gap-3">
        <button className="relative p-2 text-gray-500 hover:text-[#7A1E2C] hover:bg-gray-50 rounded-lg transition-colors">
          <Bell size={20} />
          <span className="absolute top-1 right-1 w-2 h-2 bg-[#7A1E2C] rounded-full"></span>
        </button>

        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="flex items-center gap-2 p-2 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
          >
            <div className="w-8 h-8 bg-[#7A1E2C] rounded-full flex items-center justify-center">
              <User size={16} className="text-white" />
            </div>
            <div className="hidden md:block text-left">
              <div className="text-sm font-medium leading-tight">{userName}</div>
              <div className="text-xs text-gray-500 capitalize">{role}</div>
            </div>
            <ChevronDown size={14} className="text-gray-400" />
          </button>

          {showMenu && (
            <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-50">
              <a href={role === 'admin' ? '/admin' : '/dashboard/profile'} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">Mi Perfil</a>
              <hr className="my-1 border-gray-100" />
              <button onClick={handleLogout} className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50">Cerrar Sesión</button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
