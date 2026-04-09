import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

function serviceUrl(): string {
  const u = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL
  if (!u) throw new Error('Falta SUPABASE_URL o VITE_SUPABASE_URL en el servidor')
  return u
}

function serviceKey(): string {
  const k = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!k) throw new Error('Falta SUPABASE_SERVICE_ROLE_KEY (solo servidor, nunca en VITE_)')
  return k
}

export function getServiceSupabase() {
  return createClient<Database>(serviceUrl(), serviceKey(), {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}

/** Valida JWT del operador y exige rol admin u operador en `profiles`. */
export async function assertStaffFromAccessToken(accessToken: string | undefined) {
  if (!accessToken?.trim()) {
    throw new Error('No autenticado.')
  }
  const admin = getServiceSupabase()
  const { data: authData, error: authErr } = await admin.auth.getUser(accessToken)
  if (authErr || !authData.user) {
    throw new Error('Sesión inválida o expirada.')
  }
  const { data: profile, error: pErr } = await admin
    .from('profiles')
    .select('role')
    .eq('id', authData.user.id)
    .single()
  if (pErr || !profile) {
    throw new Error('No se encontró el perfil del operador.')
  }
  const r = profile.role
  if (r !== 'admin' && r !== 'operador') {
    throw new Error('No tenés permisos para crear usuarios.')
  }
  return authData.user
}

/** Contraseña inicial = solo dígitos del DNI; mínimo 6 caracteres (política típica de Supabase). */
export function passwordFromDni(dni: string): string {
  const digits = dni.replace(/\D/g, '')
  if (digits.length < 6) {
    throw new Error(
      'El DNI debe tener al menos 6 dígitos para usarlo como contraseña inicial (requisito de seguridad).',
    )
  }
  return digits
}
