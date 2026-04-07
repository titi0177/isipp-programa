import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'
import { Sidebar } from '@/components/Sidebar'
import { TopNav } from '@/components/TopNav'
import { supabase } from '@/lib/supabase'
import { useState, useEffect } from 'react'

export const Route = createFileRoute('/admin')({
  beforeLoad: async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw redirect({ to: '/login' })
    const { data: profile } = await supabase.from('users').select('role').eq('id', user.id).single()
    if (profile?.role !== 'admin') throw redirect({ to: '/dashboard' })
  },
  component: AdminLayout,
})

function AdminLayout() {
  const [userName, setUserName] = useState('')
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        supabase.from('users').select('full_name').eq('id', user.id).single()
          .then(({ data }) => setUserName(data?.full_name || user.email || ''))
      }
    })
  }, [])
  return (
    <div className="flex min-h-screen bg-[#F4F4F4]">
      <Sidebar role="admin" />
      <div className="flex-1 ml-64 flex flex-col min-h-screen">
        <TopNav userName={userName} role="admin" />
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
