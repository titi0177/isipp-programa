import { jsxs, jsx } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { u as useToast, s as supabase } from "./router-Cgpt3s8a.js";
import { D as DataTable, M as Modal } from "./Modal-DTmqZnz1.js";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { p as provisionStudentWithAuth } from "./provisionAuthUsers-DwantXmb.js";
import "@supabase/supabase-js";
import "chart.js";
import "../server.js";
import "node:async_hooks";
import "h3-v2";
import "@tanstack/router-core";
import "seroval";
import "@tanstack/history";
import "@tanstack/router-core/ssr/client";
import "@tanstack/router-core/ssr/server";
import "@tanstack/react-router/ssr/server";
import "zod";
const EMPTY = {
  first_name: "",
  last_name: "",
  dni: "",
  legajo: "",
  email: "",
  year: 1,
  status: "active"
};
function StudentsPage() {
  const [students, setStudents] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(EMPTY);
  const [loading, setLoading] = useState(true);
  const [createWithAuth, setCreateWithAuth] = useState(true);
  const [saving, setSaving] = useState(false);
  const {
    showToast
  } = useToast();
  useEffect(() => {
    void loadData();
  }, []);
  async function loadData() {
    const [{
      data: s
    }, {
      data: p
    }] = await Promise.all([supabase.from("students").select("*, program:programs(name)").order("last_name"), supabase.from("programs").select("*")]);
    setStudents(s || []);
    setPrograms(p || []);
    setLoading(false);
  }
  const openNew = () => {
    setEditing(EMPTY);
    setCreateWithAuth(true);
    setModalOpen(true);
  };
  const openEdit = (s) => {
    setEditing(s);
    setModalOpen(true);
  };
  const handleSave = async (e) => {
    e.preventDefault();
    const {
      id,
      program,
      ...rest
    } = editing;
    if (id) {
      const {
        error: error2
      } = await supabase.from("students").update(rest).eq("id", id);
      if (error2) {
        showToast("Error al actualizar.", "error");
        return;
      }
      showToast("Estudiante actualizado.");
      setModalOpen(false);
      void loadData();
      return;
    }
    if (createWithAuth) {
      setSaving(true);
      const {
        data: sessionData
      } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;
      if (!token) {
        showToast("Sesión expirada. Volvé a iniciar sesión.", "error");
        setSaving(false);
        return;
      }
      const res = await provisionStudentWithAuth({
        data: {
          accessToken: token,
          email: rest.email,
          dni: rest.dni,
          first_name: rest.first_name,
          last_name: rest.last_name,
          legajo: rest.legajo,
          program_id: rest.program_id || void 0,
          year: rest.year ?? 1,
          status: rest.status ?? "active"
        }
      });
      setSaving(false);
      if (!res.ok) {
        showToast(res.message, "error");
        return;
      }
      showToast("Estudiante creado con acceso al portal. Usuario: correo · Contraseña inicial: DNI (solo números, mín. 6 dígitos).", "info");
      setModalOpen(false);
      void loadData();
      return;
    }
    const {
      error
    } = await supabase.from("students").insert(rest);
    if (error) {
      showToast("Error al crear estudiante.", "error");
      return;
    }
    showToast("Estudiante creado (sin cuenta de acceso).");
    setModalOpen(false);
    void loadData();
  };
  const handleDelete = async (id) => {
    if (!confirm("¿Eliminar este estudiante?")) return;
    await supabase.from("students").delete().eq("id", id);
    showToast("Estudiante eliminado.", "info");
    void loadData();
  };
  const columns = [{
    key: "last_name",
    label: "Apellido"
  }, {
    key: "first_name",
    label: "Nombre"
  }, {
    key: "legajo",
    label: "Legajo"
  }, {
    key: "dni",
    label: "DNI"
  }, {
    key: "email",
    label: "Email"
  }, {
    key: "user_id",
    label: "Portal",
    render: (r) => r.user_id ? /* @__PURE__ */ jsx("span", { className: "rounded bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-800", children: "Activo" }) : /* @__PURE__ */ jsx("span", { className: "text-xs text-slate-400", children: "Sin cuenta" })
  }, {
    key: "program",
    label: "Carrera",
    render: (r) => r.program?.name || "-"
  }, {
    key: "year",
    label: "Año"
  }, {
    key: "status",
    label: "Estado",
    render: (r) => /* @__PURE__ */ jsx("span", { className: "capitalize", children: r.status })
  }];
  return /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("h1", { className: "text-2xl font-bold text-gray-900", children: "Estudiantes" }),
        /* @__PURE__ */ jsx("p", { className: "mt-1 text-sm text-gray-500", children: "Gestión del padrón de alumnos" })
      ] }),
      /* @__PURE__ */ jsxs("button", { type: "button", onClick: openNew, className: "btn-primary flex items-center gap-2", children: [
        /* @__PURE__ */ jsx(Plus, { size: 16 }),
        " Nuevo estudiante"
      ] })
    ] }),
    loading ? /* @__PURE__ */ jsx("div", { className: "card h-64 animate-pulse bg-gray-100" }) : /* @__PURE__ */ jsx(DataTable, { columns, data: students, searchPlaceholder: "Buscar por nombre, legajo, DNI...", actions: (row) => /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-end gap-2", children: [
      /* @__PURE__ */ jsx(Link, { to: "/admin/student-record/$id", params: {
        id: row.id
      }, className: "text-blue-600", children: "Historial" }),
      /* @__PURE__ */ jsx("button", { type: "button", onClick: () => openEdit(row), className: "siu-table-action", children: /* @__PURE__ */ jsx(Pencil, { size: 15 }) }),
      /* @__PURE__ */ jsx("button", { type: "button", onClick: () => void handleDelete(row.id), className: "rounded-lg p-1.5 text-gray-500 transition-colors hover:bg-red-50 hover:text-red-600", children: /* @__PURE__ */ jsx(Trash2, { size: 15 }) })
    ] }) }),
    /* @__PURE__ */ jsx(Modal, { open: modalOpen, onClose: () => setModalOpen(false), title: editing.id ? "Editar estudiante" : "Nuevo estudiante", children: /* @__PURE__ */ jsxs("form", { onSubmit: (e) => void handleSave(e), className: "space-y-4", children: [
      !editing.id && /* @__PURE__ */ jsx("div", { className: "rounded-lg border border-amber-200 bg-amber-50/80 p-3 text-sm text-amber-950", children: /* @__PURE__ */ jsxs("label", { className: "flex cursor-pointer items-start gap-2", children: [
        /* @__PURE__ */ jsx("input", { type: "checkbox", className: "mt-1", checked: createWithAuth, onChange: (e) => setCreateWithAuth(e.target.checked) }),
        /* @__PURE__ */ jsxs("span", { children: [
          /* @__PURE__ */ jsx("strong", { children: "Crear cuenta en Supabase Auth" }),
          " para el portal del alumno. Se usará el",
          " ",
          /* @__PURE__ */ jsx("strong", { children: "correo" }),
          " como usuario y el ",
          /* @__PURE__ */ jsx("strong", { children: "DNI (solo números)" }),
          " como contraseña inicial (mínimo 6 dígitos). El alumno podrá cambiarla después desde su perfil."
        ] })
      ] }) }),
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "form-label", children: "Nombre *" }),
          /* @__PURE__ */ jsx("input", { className: "form-input", required: true, value: editing.first_name || "", onChange: (e) => setEditing((p) => ({
            ...p,
            first_name: e.target.value
          })) })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "form-label", children: "Apellido *" }),
          /* @__PURE__ */ jsx("input", { className: "form-input", required: true, value: editing.last_name || "", onChange: (e) => setEditing((p) => ({
            ...p,
            last_name: e.target.value
          })) })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsxs("label", { className: "form-label", children: [
            "DNI * ",
            !editing.id && createWithAuth && "(contraseña inicial)"
          ] }),
          /* @__PURE__ */ jsx("input", { className: "form-input", required: true, value: editing.dni || "", onChange: (e) => setEditing((p) => ({
            ...p,
            dni: e.target.value
          })), placeholder: "Solo números recomendado" })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "form-label", children: "Legajo *" }),
          /* @__PURE__ */ jsx("input", { className: "form-input", required: true, value: editing.legajo || "", onChange: (e) => setEditing((p) => ({
            ...p,
            legajo: e.target.value
          })) })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsxs("label", { className: "form-label", children: [
          "Correo institucional * ",
          !editing.id && createWithAuth && "(usuario de acceso)"
        ] }),
        /* @__PURE__ */ jsx("input", { type: "email", className: "form-input", required: true, value: editing.email || "", onChange: (e) => setEditing((p) => ({
          ...p,
          email: e.target.value
        })) })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "form-label", children: "Carrera" }),
          /* @__PURE__ */ jsxs("select", { className: "form-input", value: editing.program_id || "", onChange: (e) => setEditing((p) => ({
            ...p,
            program_id: e.target.value
          })), children: [
            /* @__PURE__ */ jsx("option", { value: "", children: "Sin asignar" }),
            programs.map((p) => /* @__PURE__ */ jsx("option", { value: p.id, children: p.name }, p.id))
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "form-label", children: "Año" }),
          /* @__PURE__ */ jsx("input", { type: "number", min: 1, max: 6, className: "form-input", value: editing.year || 1, onChange: (e) => setEditing((p) => ({
            ...p,
            year: +e.target.value
          })) })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("label", { className: "form-label", children: "Estado" }),
        /* @__PURE__ */ jsxs("select", { className: "form-input", value: editing.status || "active", onChange: (e) => setEditing((p) => ({
          ...p,
          status: e.target.value
        })), children: [
          /* @__PURE__ */ jsx("option", { value: "active", children: "Activo" }),
          /* @__PURE__ */ jsx("option", { value: "inactive", children: "Inactivo" }),
          /* @__PURE__ */ jsx("option", { value: "graduated", children: "Egresado" }),
          /* @__PURE__ */ jsx("option", { value: "suspended", children: "Suspendido" })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex gap-3 pt-2", children: [
        /* @__PURE__ */ jsx("button", { type: "submit", className: "btn-primary flex-1", disabled: saving, children: saving ? "Creando…" : "Guardar" }),
        /* @__PURE__ */ jsx("button", { type: "button", onClick: () => setModalOpen(false), className: "btn-secondary flex-1", children: "Cancelar" })
      ] })
    ] }) })
  ] });
}
export {
  StudentsPage as component
};
