import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'
import { Sidebar } from '@/components/Sidebar'
import { TopNav } from '@/components/TopNav'
import { StudentBottomNav } from '@/components/StudentBottomNav'
import { supabase } from '@/lib/supabase'
import { useState, useEffect } from 'react'
import { homePathForRole } from '@/lib/roles'

export const Route = createFileRoute('/dashboard')({
  beforeLoad: async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw redirect({ to: '/login' })
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    const dest = homePathForRole(profile?.role)
    if (dest !== '/dashboard') throw redirect({ to: dest })
  },
  component: DashboardLayout,
})

function DashboardLayout() {
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
      <Sidebar role="student" />
      <div className="ml-64 flex min-h-screen flex-1 flex-col">
        <TopNav userName={userName} role="student" />
        <main className="flex-1 overflow-auto border-t border-[var(--siu-border-light)] p-6 pb-24 shadow-inner md:pb-6">
          <Outlet />
        </main>
        <StudentBottomNav />
      </div>
    </div>
  )
}
