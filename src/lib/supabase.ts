import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://lgljkqohoidxhrcycyvb.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_jyA5Ipi3M_5Ab8RO0snEOw_zOjS3FFi'

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)

export type { Database }
