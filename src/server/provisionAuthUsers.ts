import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import {
  assertStaffFromAccessToken,
  getServiceSupabase,
  passwordFromDni,
} from './supabase-service'

const base = z.object({
  accessToken: z.string().min(10),
})

const studentPayload = base.extend({
  email: z.string().email(),
  dni: z.string().min(1),
  first_name: z.string().min(1),
  last_name: z.string().min(1),
  legajo: z.string().min(1),
  program_id: z.string().optional(),
  year: z.number().int().min(1).max(10).optional(),
  status: z.enum(['active', 'inactive', 'graduated', 'suspended']).optional(),
})

const professorPayload = base.extend({
  email: z.string().email(),
  dni: z.string().min(1),
  name: z.string().min(1),
  department: z.string().min(1),
})

export type ProvisionStudentResult =
  | { ok: true; userId: string; studentId: string }
  | { ok: false; message: string }

export type ProvisionProfessorResult =
  | { ok: true; userId: string; professorId: string }
  | { ok: false; message: string }

export const provisionStudentWithAuth = createServerFn({ method: 'POST' })
  .inputValidator((raw: unknown) => studentPayload.parse(raw))
  .handler(async ({ data }): Promise<ProvisionStudentResult> => {
    try {
      await assertStaffFromAccessToken(data.accessToken)
      const password = passwordFromDni(data.dni)
      const admin = getServiceSupabase()
      const email = data.email.trim().toLowerCase()
      const full_name = `${data.first_name.trim()} ${data.last_name.trim()}`.trim()

      let programId: string | null = null
      const rawPid = data.program_id?.trim()
      if (rawPid) {
        const uuidRe =
          /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
        if (!uuidRe.test(rawPid)) {
          return { ok: false, message: 'El identificador de carrera no es válido.' }
        }
        programId = rawPid
      }

      const { data: created, error: cErr } = await admin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: {
          full_name,
          role: 'alumno',
        },
      })

      if (cErr || !created.user) {
        return {
          ok: false,
          message: cErr?.message ?? 'No se pudo crear el usuario en autenticación.',
        }
      }

      const userId = created.user.id

      const { error: pErr } = await admin.from('profiles').upsert(
        {
          id: userId,
          email,
          full_name,
          role: 'alumno',
        },
        { onConflict: 'id' },
      )

      if (pErr) {
        await admin.auth.admin.deleteUser(userId)
        return { ok: false, message: `Perfil: ${pErr.message}` }
      }

      const { data: stRow, error: sErr } = await admin
        .from('students')
        .insert({
          user_id: userId,
          first_name: data.first_name.trim(),
          last_name: data.last_name.trim(),
          dni: data.dni.trim(),
          legajo: data.legajo.trim(),
          email,
          program_id: programId,
          year: data.year ?? 1,
          status: data.status ?? 'active',
        })
        .select('id')
        .single()

      if (sErr || !stRow) {
        await admin.auth.admin.deleteUser(userId)
        return { ok: false, message: sErr?.message ?? 'No se pudo crear el estudiante.' }
      }

      return { ok: true, userId, studentId: stRow.id }
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Error desconocido'
      return { ok: false, message: msg }
    }
  })

export const provisionProfessorWithAuth = createServerFn({ method: 'POST' })
  .inputValidator((raw: unknown) => professorPayload.parse(raw))
  .handler(async ({ data }): Promise<ProvisionProfessorResult> => {
    try {
      await assertStaffFromAccessToken(data.accessToken)
      const password = passwordFromDni(data.dni)
      const admin = getServiceSupabase()
      const email = data.email.trim().toLowerCase()
      const full_name = data.name.trim()

      const { data: created, error: cErr } = await admin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: {
          full_name,
          role: 'profesor',
        },
      })

      if (cErr || !created.user) {
        return {
          ok: false,
          message: cErr?.message ?? 'No se pudo crear el usuario en autenticación.',
        }
      }

      const userId = created.user.id

      const { error: pErr } = await admin.from('profiles').upsert(
        {
          id: userId,
          email,
          full_name,
          role: 'profesor',
        },
        { onConflict: 'id' },
      )

      if (pErr) {
        await admin.auth.admin.deleteUser(userId)
        return { ok: false, message: `Perfil: ${pErr.message}` }
      }

      const { data: prRow, error: prErr } = await admin
        .from('professors')
        .insert({
          user_id: userId,
          name: full_name,
          email,
          department: data.department.trim(),
        })
        .select('id')
        .single()

      if (prErr || !prRow) {
        await admin.auth.admin.deleteUser(userId)
        return { ok: false, message: prErr?.message ?? 'No se pudo crear el profesor.' }
      }

      return { ok: true, userId, professorId: prRow.id }
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Error desconocido'
      return { ok: false, message: msg }
    }
  })
