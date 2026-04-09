import { jsxs, jsx } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { u as useToast, s as supabase } from "./router-Cgpt3s8a.js";
import { D as DataTable, M as Modal } from "./Modal-DTmqZnz1.js";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { a as provisionProfessorWithAuth } from "./provisionAuthUsers-DwantXmb.js";
import "@tanstack/react-router";
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
function ProfessorsPage() {
  const [professors, setProfessors] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState({});
  const [createWithAuth, setCreateWithAuth] = useState(true);
  const [saving, setSaving] = useState(false);
  const {
    showToast
  } = useToast();
  useEffect(() => {
    void load();
  }, []);
  const load = async () => {
    const {
      data
    } = await supabase.from("professors").select("*").order("name");
    setProfessors(data || []);
  };
  const openNew = () => {
    setEditing({});
    setCreateWithAuth(true);
    setModalOpen(true);
  };
  const handleSave = async (e) => {
    e.preventDefault();
    const {
      id,
      created_at,
      dni,
      ...data
    } = editing;
    if (id) {
      const {
        error: error2
      } = await supabase.from("professors").update({
        name: data.name,
        email: data.email,
        department: data.department
      }).eq("id", id);
      if (error2) {
        showToast(error2.message, "error");
        return;
      }
      showToast("Profesor guardado.");
      setModalOpen(false);
      void load();
      return;
    }
    if (createWithAuth) {
      if (!dni?.trim()) {
        showToast("Ingresá el DNI para generar la contraseña inicial.", "error");
        return;
      }
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
      const res = await provisionProfessorWithAuth({
        data: {
          accessToken: token,
          email: data.email,
          dni: String(dni).trim(),
          name: data.name,
          department: data.department
        }
      });
      setSaving(false);
      if (!res.ok) {
        showToast(res.message, "error");
        return;
      }
      showToast("Profesor creado con acceso al portal docente. Usuario: correo · Contraseña inicial: DNI (solo números).", "info");
      setModalOpen(false);
      void load();
      return;
    }
    const {
      error
    } = await supabase.from("professors").insert(data);
    if (error) {
      showToast(error.message, "error");
      return;
    }
    showToast("Profesor guardado (sin cuenta de acceso).");
    setModalOpen(false);
    void load();
  };
  const handleDelete = async (id) => {
    if (!confirm("¿Eliminar este profesor?")) return;
    await supabase.from("professors").delete().eq("id", id);
    showToast("Profesor eliminado.", "info");
    void load();
  };
  return /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("h1", { className: "text-2xl font-bold text-gray-900", children: "Profesores" }),
        /* @__PURE__ */ jsx("p", { className: "mt-1 text-sm text-gray-500", children: "Docentes y acceso al módulo /professor" })
      ] }),
      /* @__PURE__ */ jsxs("button", { type: "button", onClick: openNew, className: "btn-primary flex items-center gap-2", children: [
        /* @__PURE__ */ jsx(Plus, { size: 16 }),
        " Nuevo profesor"
      ] })
    ] }),
    /* @__PURE__ */ jsx(DataTable, { columns: [{
      key: "name",
      label: "Nombre"
    }, {
      key: "email",
      label: "Email"
    }, {
      key: "department",
      label: "Departamento"
    }, {
      key: "user_id",
      label: "Portal",
      render: (r) => r.user_id ? /* @__PURE__ */ jsx("span", { className: "rounded bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-800", children: "Vinculado" }) : /* @__PURE__ */ jsx("span", { className: "text-xs text-slate-400", children: "Sin cuenta" })
    }], data: professors, actions: (row) => /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-end gap-2", children: [
      /* @__PURE__ */ jsx("button", { type: "button", onClick: () => {
        setEditing(row);
        setModalOpen(true);
      }, className: "siu-table-action", children: /* @__PURE__ */ jsx(Pencil, { size: 15 }) }),
      /* @__PURE__ */ jsx("button", { type: "button", onClick: () => void handleDelete(row.id), className: "rounded-lg p-1.5 text-gray-500 hover:bg-red-50 hover:text-red-600", children: /* @__PURE__ */ jsx(Trash2, { size: 15 }) })
    ] }) }),
    /* @__PURE__ */ jsx(Modal, { open: modalOpen, onClose: () => setModalOpen(false), title: editing.id ? "Editar profesor" : "Nuevo profesor", children: /* @__PURE__ */ jsxs("form", { onSubmit: (e) => void handleSave(e), className: "space-y-4", children: [
      !editing.id && /* @__PURE__ */ jsx("div", { className: "rounded-lg border border-amber-200 bg-amber-50/80 p-3 text-sm text-amber-950", children: /* @__PURE__ */ jsxs("label", { className: "flex cursor-pointer items-start gap-2", children: [
        /* @__PURE__ */ jsx("input", { type: "checkbox", className: "mt-1", checked: createWithAuth, onChange: (e) => setCreateWithAuth(e.target.checked) }),
        /* @__PURE__ */ jsxs("span", { children: [
          /* @__PURE__ */ jsx("strong", { children: "Crear cuenta en Supabase Auth" }),
          " para el portal docente.",
          " ",
          /* @__PURE__ */ jsx("strong", { children: "Correo" }),
          " = usuario · ",
          /* @__PURE__ */ jsx("strong", { children: "DNI (números)" }),
          " = contraseña inicial (mín. 6 dígitos)."
        ] })
      ] }) }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("label", { className: "form-label", children: "Nombre completo *" }),
        /* @__PURE__ */ jsx("input", { className: "form-input", required: true, value: editing.name || "", onChange: (e) => setEditing((p) => ({
          ...p,
          name: e.target.value
        })) })
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsxs("label", { className: "form-label", children: [
          "Email * ",
          !editing.id && createWithAuth && "(usuario de acceso)"
        ] }),
        /* @__PURE__ */ jsx("input", { type: "email", className: "form-input", required: true, value: editing.email || "", onChange: (e) => setEditing((p) => ({
          ...p,
          email: e.target.value
        })) })
      ] }),
      !editing.id && createWithAuth && /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("label", { className: "form-label", children: "DNI * (contraseña inicial)" }),
        /* @__PURE__ */ jsx("input", { className: "form-input", required: createWithAuth, value: editing.dni || "", onChange: (e) => setEditing((p) => ({
          ...p,
          dni: e.target.value
        })), placeholder: "Solo números, mínimo 6" })
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("label", { className: "form-label", children: "Departamento *" }),
        /* @__PURE__ */ jsx("input", { className: "form-input", required: true, value: editing.department || "", onChange: (e) => setEditing((p) => ({
          ...p,
          department: e.target.value
        })) })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex gap-3 pt-2", children: [
        /* @__PURE__ */ jsx("button", { type: "submit", className: "btn-primary flex-1", disabled: saving, children: saving ? "Creando…" : "Guardar" }),
        /* @__PURE__ */ jsx("button", { type: "button", onClick: () => setModalOpen(false), className: "btn-secondary flex-1", children: "Cancelar" })
      ] })
    ] }) })
  ] });
}
export {
  ProfessorsPage as component
};
