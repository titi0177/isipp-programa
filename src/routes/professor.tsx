import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'
import { Sidebar } from '@/components/Sidebar'
import { TopNav } from '@/components/TopNav'
import { supabase } from '@/lib/supabase'
import { useEffect, useState } from 'react'

export const Route = createFileRoute('/professor')({
  beforeLoad: async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw redirect({ to: '/login' })
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    const r = profile?.role
    const ok =
      r === 'profesor' ||
      r === 'professor' ||
      r === 'admin' ||
      r === 'operador' ||
      r === 'operator'
    if (!ok) {
      throw redirect({ to: '/dashboard' })
    }
  },
  component: ProfessorLayout,
})

function ProfessorLayout() {
  const [userName, setUserName] = useState('')
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        supabase.from('profiles').select('full_name').eq('id', user.id).single()
          .then(({ data }) => setUserName(data?.full_name || user.email || ''))
      }
    })
  }, [])

  return (
    <div className="flex min-h-screen siu-main-bg">
      <Sidebar role="professor" />
      <div className="ml-64 flex min-h-screen flex-1 flex-col">
        <TopNav userName={userName} role="professor" />
        <main className="flex-1 overflow-auto border-t border-[var(--siu-border-light)] p-6 shadow-inner">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
