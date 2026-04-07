import { Store } from '@tanstack/store'
import type { User } from '@supabase/supabase-js'
import type { Role } from '@/types'

interface AuthState {
  user: User | null
  role: Role | null
  loading: boolean
}

export const authStore = new Store<AuthState>({
  user: null,
  role: null,
  loading: true,
})
