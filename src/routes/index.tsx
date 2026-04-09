import { createFileRoute, redirect } from '@tanstack/react-router'
import { supabase } from '@/lib/supabase'
import { homePathForRole } from '@/lib/roles'

export const Route = createFileRoute('/')({
  beforeLoad: async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw redirect({ to: '/login' })

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    throw redirect({ to: homePathForRole(profile?.role) })
  },
  component: () => null,
})
