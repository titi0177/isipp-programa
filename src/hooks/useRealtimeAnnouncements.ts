import { useEffect } from 'react'
import type { RealtimeChannel } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'

/**
 * Subscribe to new or updated rows in `announcements`.
 * Pass `null` for onEvent to only subscribe without a callback (testing / future use).
 */
export function useRealtimeAnnouncements(onEvent?: (() => void) | null) {
  useEffect(() => {
    if (onEvent == null) return
    let ch: RealtimeChannel | null = supabase
      .channel('announcements_public')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'announcements' },
        () => onEvent(),
      )
      .subscribe()
    return () => {
      if (ch) void supabase.removeChannel(ch)
    }
  }, [onEvent])
}
