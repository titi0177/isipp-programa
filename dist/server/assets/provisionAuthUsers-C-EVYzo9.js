import { T as TSS_SERVER_FUNCTION, c as createServerFn } from "../server.js";
import { z } from "zod";
import { createClient } from "@supabase/supabase-js";
import "node:async_hooks";
import "h3-v2";
import "@tanstack/router-core";
import "seroval";
import "@tanstack/history";
import "@tanstack/router-core/ssr/client";
import "@tanstack/router-core/ssr/server";
import "react";
import "@tanstack/react-router";
import "react/jsx-runtime";
import "@tanstack/react-router/ssr/server";
var createServerRpc = (serverFnMeta, splitImportFn) => {
  const url = "/_serverFn/" + serverFnMeta.id;
  return Object.assign(splitImportFn, {
    url,
    serverFnMeta,
    [TSS_SERVER_FUNCTION]: true
  });
};
function serviceUrl() {
  const u = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  if (!u) throw new Error("Falta SUPABASE_URL o VITE_SUPABASE_URL en el servidor");
  return u;
}
function serviceKey() {
  const k = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!k) throw new Error("Falta SUPABASE_SERVICE_ROLE_KEY (solo servidor, nunca en VITE_)");
  return k;
}
function getServiceSupabase() {
  return createClient(serviceUrl(), serviceKey(), {
    auth: { autoRefreshToken: false, persistSession: false }
  });
}
async function assertStaffFromAccessToken(accessToken) {
  if (!accessToken?.trim()) {
    throw new Error("No autenticado.");
  }
  const admin = getServiceSupabase();
  const { data: authData, error: authErr } = await admin.auth.getUser(accessToken);
  if (authErr || !authData.user) {
    throw new Error("Sesión inválida o expirada.");
  }
  const { data: profile, error: pErr } = await admin.from("profiles").select("role").eq("id", authData.user.id).single();
  if (pErr || !profile) {
    throw new Error("No se encontró el perfil del operador.");
  }
  const r = profile.role;
  if (r !== "admin" && r !== "operador") {
    throw new Error("No tenés permisos para crear usuarios.");
  }
  return authData.user;
}
function passwordFromDni(dni) {
  const digits = dni.replace(/\D/g, "");
  if (digits.length < 6) {
    throw new Error(
      "El DNI debe tener al menos 6 dígitos para usarlo como contraseña inicial (requisito de seguridad)."
    );
  }
  return digits;
}
const base = z.object({
  accessToken: z.string().min(10)
});
const studentPayload = base.extend({
  email: z.string().email(),
  dni: z.string().min(1),
  first_name: z.string().min(1),
  last_name: z.string().min(1),
  legajo: z.string().min(1),
  program_id: z.string().optional(),
  year: z.number().int().min(1).max(10).optional(),
  status: z.enum(["active", "inactive", "graduated", "suspended"]).optional()
});
const professorPayload = base.extend({
  email: z.string().email(),
  dni: z.string().min(1),
  name: z.string().min(1),
  department: z.string().min(1)
});
const provisionStudentWithAuth_createServerFn_handler = createServerRpc({
  id: "07ff256b42a2a359f26dcd111a6a3a8177caa98be4eba7eef5a1ff88f40aa76d",
  name: "provisionStudentWithAuth",
  filename: "src/server/provisionAuthUsers.ts"
}, (opts) => provisionStudentWithAuth.__executeServer(opts));
const provisionStudentWithAuth = createServerFn({
  method: "POST"
}).inputValidator((raw) => studentPayload.parse(raw)).handler(provisionStudentWithAuth_createServerFn_handler, async ({
  data
}) => {
  try {
    await assertStaffFromAccessToken(data.accessToken);
    const password = passwordFromDni(data.dni);
    const admin = getServiceSupabase();
    const email = data.email.trim().toLowerCase();
    const full_name = `${data.first_name.trim()} ${data.last_name.trim()}`.trim();
    let programId = null;
    const rawPid = data.program_id?.trim();
    if (rawPid) {
      const uuidRe = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      if (!uuidRe.test(rawPid)) {
        return {
          ok: false,
          message: "El identificador de carrera no es válido."
        };
      }
      programId = rawPid;
    }
    const {
      data: created,
      error: cErr
    } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name,
        role: "alumno"
      }
    });
    if (cErr || !created.user) {
      return {
        ok: false,
        message: cErr?.message ?? "No se pudo crear el usuario en autenticación."
      };
    }
    const userId = created.user.id;
    const {
      error: pErr
    } = await admin.from("profiles").upsert({
      id: userId,
      email,
      full_name,
      role: "alumno"
    }, {
      onConflict: "id"
    });
    if (pErr) {
      await admin.auth.admin.deleteUser(userId);
      return {
        ok: false,
        message: `Perfil: ${pErr.message}`
      };
    }
    const {
      data: stRow,
      error: sErr
    } = await admin.from("students").insert({
      user_id: userId,
      first_name: data.first_name.trim(),
      last_name: data.last_name.trim(),
      dni: data.dni.trim(),
      legajo: data.legajo.trim(),
      email,
      program_id: programId,
      year: data.year ?? 1,
      status: data.status ?? "active"
    }).select("id").single();
    if (sErr || !stRow) {
      await admin.auth.admin.deleteUser(userId);
      return {
        ok: false,
        message: sErr?.message ?? "No se pudo crear el estudiante."
      };
    }
    return {
      ok: true,
      userId,
      studentId: stRow.id
    };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Error desconocido";
    return {
      ok: false,
      message: msg
    };
  }
});
const provisionProfessorWithAuth_createServerFn_handler = createServerRpc({
  id: "d2ead39847eb66636da878225740b906e0221eb58dfa9d882867ae0986b94475",
  name: "provisionProfessorWithAuth",
  filename: "src/server/provisionAuthUsers.ts"
}, (opts) => provisionProfessorWithAuth.__executeServer(opts));
const provisionProfessorWithAuth = createServerFn({
  method: "POST"
}).inputValidator((raw) => professorPayload.parse(raw)).handler(provisionProfessorWithAuth_createServerFn_handler, async ({
  data
}) => {
  try {
    await assertStaffFromAccessToken(data.accessToken);
    const password = passwordFromDni(data.dni);
    const admin = getServiceSupabase();
    const email = data.email.trim().toLowerCase();
    const full_name = data.name.trim();
    const {
      data: created,
      error: cErr
    } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name,
        role: "profesor"
      }
    });
    if (cErr || !created.user) {
      return {
        ok: false,
        message: cErr?.message ?? "No se pudo crear el usuario en autenticación."
      };
    }
    const userId = created.user.id;
    const {
      error: pErr
    } = await admin.from("profiles").upsert({
      id: userId,
      email,
      full_name,
      role: "profesor"
    }, {
      onConflict: "id"
    });
    if (pErr) {
      await admin.auth.admin.deleteUser(userId);
      return {
        ok: false,
        message: `Perfil: ${pErr.message}`
      };
    }
    const {
      data: prRow,
      error: prErr
    } = await admin.from("professors").insert({
      user_id: userId,
      name: full_name,
      email,
      department: data.department.trim()
    }).select("id").single();
    if (prErr || !prRow) {
      await admin.auth.admin.deleteUser(userId);
      return {
        ok: false,
        message: prErr?.message ?? "No se pudo crear el profesor."
      };
    }
    return {
      ok: true,
      userId,
      professorId: prRow.id
    };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Error desconocido";
    return {
      ok: false,
      message: msg
    };
  }
});
export {
  provisionProfessorWithAuth_createServerFn_handler,
  provisionStudentWithAuth_createServerFn_handler
};
