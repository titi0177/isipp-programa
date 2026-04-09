import { jsxs, jsx } from "react/jsx-runtime";
import { useState } from "react";
import { u as useToast, s as supabase } from "./router-Cgpt3s8a.js";
import { Settings, Lock } from "lucide-react";
import "@tanstack/react-router";
import "@supabase/supabase-js";
import "chart.js";
function ProfessorSettingsPage() {
  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [saving, setSaving] = useState(false);
  const {
    showToast
  } = useToast();
  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (newPass !== confirmPass) {
      showToast("Las contraseñas no coinciden.", "error");
      return;
    }
    if (newPass.length < 6) {
      showToast("La contraseña debe tener al menos 6 caracteres.", "error");
      return;
    }
    setSaving(true);
    const {
      error
    } = await supabase.auth.updateUser({
      password: newPass
    });
    if (error) showToast("Error al cambiar contraseña.", "error");
    else {
      showToast("Contraseña actualizada.");
      setNewPass("");
      setConfirmPass("");
    }
    setSaving(false);
  };
  return /* @__PURE__ */ jsxs("div", { className: "max-w-2xl space-y-6", children: [
    /* @__PURE__ */ jsxs("h1", { className: "flex items-center gap-2 text-2xl font-bold text-gray-900", children: [
      /* @__PURE__ */ jsx(Settings, { size: 24, className: "text-[var(--siu-blue)]" }),
      " Configuración docente"
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "card", children: [
      /* @__PURE__ */ jsxs("h2", { className: "mb-4 flex items-center gap-2 text-base font-semibold text-gray-900", children: [
        /* @__PURE__ */ jsx(Lock, { size: 16, className: "text-[var(--siu-blue)]" }),
        " Cambiar contraseña"
      ] }),
      /* @__PURE__ */ jsxs("form", { onSubmit: handleChangePassword, className: "space-y-4", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "form-label", children: "Nueva contraseña" }),
          /* @__PURE__ */ jsx("input", { type: "password", value: newPass, onChange: (e) => setNewPass(e.target.value), required: true, className: "form-input", placeholder: "••••••••" })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "form-label", children: "Confirmar" }),
          /* @__PURE__ */ jsx("input", { type: "password", value: confirmPass, onChange: (e) => setConfirmPass(e.target.value), required: true, className: "form-input", placeholder: "••••••••" })
        ] }),
        /* @__PURE__ */ jsx("button", { type: "submit", disabled: saving, className: "btn-primary", children: saving ? "Guardando…" : "Actualizar contraseña" })
      ] })
    ] })
  ] });
}
export {
  ProfessorSettingsPage as component
};
