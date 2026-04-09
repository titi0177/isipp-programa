import { useEffect } from 'react'
import type { RealtimeChannel } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'

/** Refresca datos cuando cambia cualquier fila en `grades` (alumno debe volver a cargar su vista). */
export function useRealtimeGrades(onChange: (() => void) | null) {
  useEffect(() => {
    if (!onChange) return
    const ch: RealtimeChannel = supabase
      .channel('grades_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'grades' }, () => onChange())
      .subscribe()
    return () => {
      void supabase.removeChannel(ch)
    }
  }, [onChange])
}
