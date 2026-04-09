import { supabase } from '@/lib/supabase'

export async function logAuditEvent(params: {
  action: string
  resourceType: string
  resourceId?: string | null
  oldRecord?: Record<string, unknown> | null
  newRecord?: Record<string, unknown> | null
  institutionId?: string | null
}) {
  const { data: { user } } = await supabase.auth.getUser()
  await supabase.from('audit_logs').insert({
    action: params.action,
    resource_type: params.resourceType,
    resource_id: params.resourceId ?? undefined,
    old_record: params.oldRecord ?? undefined,
    new_record: params.newRecord ?? undefined,
    institution_id: params.institutionId ?? undefined,
    actor_id: user?.id,
  })
}
