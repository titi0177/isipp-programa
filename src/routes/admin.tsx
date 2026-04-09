import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'
import { Sidebar } from '@/components/Sidebar'
import { TopNav } from '@/components/TopNav'
import { supabase } from '@/lib/supabase'
import { useState, useEffect } from 'react'
import { homePathForRole, isStaffRole } from '@/lib/roles'

export const Route = createFileRoute('/admin')({
  beforeLoad: async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw redirect({ to: '/login' })
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    if (!isStaffRole(profile?.role)) throw redirect({ to: homePathForRole(profile?.role) })
  },
  component: AdminLayout,
})

function AdminLayout() {
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
      <Sidebar role="admin" />
      <div className="ml-64 flex min-h-screen flex-1 flex-col">
        <TopNav userName={userName} role="admin" />
        <main className="flex-1 overflow-auto border-t border-[var(--siu-border-light)] p-6 shadow-inner">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
