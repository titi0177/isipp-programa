import { useEffect } from 'react'
import type { RealtimeChannel } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'

export function useRealtimeFinalExams(onChange: (() => void) | null) {
  useEffect(() => {
    if (!onChange) return
    const ch: RealtimeChannel = supabase
      .channel('final_exams_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'final_exams' }, () => onChange())
      .subscribe()
    return () => {
      void supabase.removeChannel(ch)
    }
  }, [onChange])
}
