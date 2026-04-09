import { jsx, jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { s as supabase } from "./router-Cgpt3s8a.js";
import "@tanstack/react-router";
import "lucide-react";
import "@supabase/supabase-js";
import "chart.js";
function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirm) {
      setError("Las contraseñas no coinciden.");
      return;
    }
    setLoading(true);
    const {
      error: err
    } = await supabase.auth.updateUser({
      password
    });
    if (err) setError("No se pudo actualizar la contraseña. Intente nuevamente.");
    else setDone(true);
    setLoading(false);
  };
  return /* @__PURE__ */ jsx("div", { className: "siu-login-page flex items-center justify-center p-4", children: /* @__PURE__ */ jsxs("div", { className: "siu-login-card w-full max-w-md bg-white", children: [
    /* @__PURE__ */ jsxs("div", { className: "siu-login-banner py-5", children: [
      /* @__PURE__ */ jsx("div", { className: "siu-login-logo-wrap max-w-[200px] py-3", children: /* @__PURE__ */ jsx("img", { src: "/logo-isipp.png", alt: "", className: "siu-login-logo max-h-[72px]", width: 200, height: 100 }) }),
      /* @__PURE__ */ jsx("h1", { className: "text-base font-bold", children: "Nueva contraseña" }),
      /* @__PURE__ */ jsx("p", { className: "mt-1 text-xs text-white/85", children: "Instituto Superior de Informática Puerto Piray" })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "p-8", children: done ? /* @__PURE__ */ jsxs("div", { className: "text-center", children: [
      /* @__PURE__ */ jsx("p", { className: "mb-4 font-semibold text-emerald-700", children: "Contraseña actualizada correctamente." }),
      /* @__PURE__ */ jsx("a", { href: "/login", className: "btn-primary inline-block px-6", children: "Ir al inicio de sesión" })
    ] }) : /* @__PURE__ */ jsxs("form", { onSubmit: handleSubmit, className: "space-y-4", children: [
      error && /* @__PURE__ */ jsx("div", { className: "border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800", style: {
        borderRadius: "2px"
      }, children: error }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("label", { className: "form-label", htmlFor: "np", children: "Nueva contraseña" }),
        /* @__PURE__ */ jsx("input", { id: "np", type: "password", value: password, onChange: (e) => setPassword(e.target.value), required: true, className: "form-input", placeholder: "••••••••" })
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("label", { className: "form-label", htmlFor: "npc", children: "Confirmar" }),
        /* @__PURE__ */ jsx("input", { id: "npc", type: "password", value: confirm, onChange: (e) => setConfirm(e.target.value), required: true, className: "form-input", placeholder: "••••••••" })
      ] }),
      /* @__PURE__ */ jsx("button", { type: "submit", disabled: loading, className: "btn-primary w-full py-3 font-bold", children: loading ? "Guardando…" : "Guardar contraseña" })
    ] }) })
  ] }) });
}
export {
  ResetPasswordPage as component
};
