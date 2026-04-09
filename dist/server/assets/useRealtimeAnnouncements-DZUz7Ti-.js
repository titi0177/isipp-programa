import { useEffect } from "react";
import { s as supabase } from "./router-Cgpt3s8a.js";
function useRealtimeAnnouncements(onEvent) {
  useEffect(() => {
    if (onEvent == null) return;
    let ch = supabase.channel("announcements_public").on(
      "postgres_changes",
      { event: "*", schema: "public", table: "announcements" },
      () => onEvent()
    ).subscribe();
    return () => {
      if (ch) void supabase.removeChannel(ch);
    };
  }, [onEvent]);
}
export {
  useRealtimeAnnouncements as u
};
