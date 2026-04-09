import { jsxs, jsx, Fragment } from "react/jsx-runtime";
import { useState } from "react";
import { Mail, Lock, EyeOff, Eye } from "lucide-react";
import { s as supabase } from "./router-Cgpt3s8a.js";
import { useNavigate } from "@tanstack/react-router";
import "@supabase/supabase-js";
import "chart.js";
function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [forgotMode, setForgotMode] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const {
      error: err
    } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    if (err) {
      setError("Usuario o contraseña incorrectos. Verifique los datos ingresados.");
      setLoading(false);
      return;
    }
    navigate({
      to: "/"
    });
  };
  const handleReset = async (e) => {
    e.preventDefault();
    setLoading(true);
    await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`
    });
    setResetSent(true);
    setLoading(false);
  };
  return /* @__PURE__ */ jsxs("div", { className: "siu-login-page relative flex items-center justify-center p-4", children: [
    /* @__PURE__ */ jsx("div", { className: "pointer-events-none absolute inset-0 opacity-[0.35]", style: {
      backgroundImage: `linear-gradient(90deg, var(--siu-border) 1px, transparent 1px),
            linear-gradient(var(--siu-border) 1px, transparent 1px)`,
      backgroundSize: "24px 24px"
    } }),
    /* @__PURE__ */ jsxs("div", { className: "relative w-full max-w-md", children: [
      /* @__PURE__ */ jsxs("div", { className: "siu-login-card bg-white", children: [
        /* @__PURE__ */ jsxs("div", { className: "siu-login-banner", children: [
          /* @__PURE__ */ jsx("div", { className: "siu-login-logo-wrap", children: /* @__PURE__ */ jsx("img", { src: "/logo-isipp.png", alt: "Instituto Superior de Informática Puerto Piray", className: "siu-login-logo", width: 280, height: 140 }) }),
          /* @__PURE__ */ jsx("p", { className: "mt-2 text-sm font-semibold text-white/95", children: "Sistema de Gestión Académica" }),
          /* @__PURE__ */ jsx("p", { className: "mt-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/80", children: "Acceso seguro · Autogestión" })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "border-b border-[var(--siu-border-light)] bg-[var(--isipp-bordo-soft)] px-6 py-2 text-center text-xs font-semibold text-[var(--isipp-bordo-dark)]", children: "Ingrese con el correo institucional asignado" }),
        /* @__PURE__ */ jsx("div", { className: "px-8 py-7", children: !forgotMode ? /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsx("h2", { className: "siu-page-title mb-1 text-lg", children: "Inicio de sesión" }),
          /* @__PURE__ */ jsx("p", { className: "siu-page-subtitle mb-5", children: "Autenticación segura del sistema" }),
          error && /* @__PURE__ */ jsx("div", { className: "mb-4 border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-800", style: {
            borderRadius: "2px"
          }, children: error }),
          /* @__PURE__ */ jsxs("form", { onSubmit: handleLogin, className: "space-y-4", children: [
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("label", { className: "form-label", htmlFor: "login-email", children: "Usuario (e-mail)" }),
              /* @__PURE__ */ jsxs("div", { className: "relative", children: [
                /* @__PURE__ */ jsx(Mail, { size: 16, className: "pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--siu-text-muted)]" }),
                /* @__PURE__ */ jsx("input", { id: "login-email", type: "email", value: email, onChange: (e) => setEmail(e.target.value), required: true, autoComplete: "username", className: "form-input pl-9", placeholder: "nombre.apellido@institucion.edu.ar" })
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("label", { className: "form-label", htmlFor: "login-pass", children: "Contraseña" }),
              /* @__PURE__ */ jsxs("div", { className: "relative", children: [
                /* @__PURE__ */ jsx(Lock, { size: 16, className: "pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--siu-text-muted)]" }),
                /* @__PURE__ */ jsx("input", { id: "login-pass", type: showPass ? "text" : "password", value: password, onChange: (e) => setPassword(e.target.value), required: true, autoComplete: "current-password", className: "form-input pl-9 pr-10", placeholder: "••••••••" }),
                /* @__PURE__ */ jsx("button", { type: "button", onClick: () => setShowPass(!showPass), className: "absolute right-3 top-1/2 -translate-y-1/2 text-[var(--siu-text-muted)] hover:text-[var(--siu-navy)]", "aria-label": showPass ? "Ocultar contraseña" : "Mostrar contraseña", children: showPass ? /* @__PURE__ */ jsx(EyeOff, { size: 16 }) : /* @__PURE__ */ jsx(Eye, { size: 16 }) })
              ] })
            ] }),
            /* @__PURE__ */ jsx("button", { type: "submit", disabled: loading, className: "btn-primary w-full py-3 font-bold", children: loading ? "Verificando…" : "Ingresar" })
          ] }),
          /* @__PURE__ */ jsx("button", { type: "button", onClick: () => setForgotMode(true), className: "mt-4 w-full text-center text-sm font-semibold text-[var(--siu-blue)] hover:underline", children: "¿Olvidó o bloqueó su contraseña?" })
        ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsx("h2", { className: "siu-page-title mb-1 text-lg", children: "Recuperar acceso" }),
          /* @__PURE__ */ jsx("p", { className: "siu-page-subtitle mb-5", children: "Se enviará un enlace al correo registrado en el sistema." }),
          resetSent ? /* @__PURE__ */ jsx("div", { className: "border border-emerald-200 bg-emerald-50 px-4 py-3 text-center text-sm text-emerald-900", style: {
            borderRadius: "2px"
          }, children: "Se enviaron las instrucciones a su casilla de correo." }) : /* @__PURE__ */ jsxs("form", { onSubmit: handleReset, className: "space-y-4", children: [
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("label", { className: "form-label", htmlFor: "reset-email", children: "Correo electrónico" }),
              /* @__PURE__ */ jsx("input", { id: "reset-email", type: "email", value: email, onChange: (e) => setEmail(e.target.value), required: true, className: "form-input", placeholder: "usuario@institucion.edu.ar" })
            ] }),
            /* @__PURE__ */ jsx("button", { type: "submit", disabled: loading, className: "btn-primary w-full py-3 font-bold", children: loading ? "Enviando…" : "Enviar instrucciones" })
          ] }),
          /* @__PURE__ */ jsx("button", { type: "button", onClick: () => {
            setForgotMode(false);
            setResetSent(false);
          }, className: "mt-4 w-full text-center text-sm font-medium text-[var(--siu-text-muted)] hover:text-[var(--siu-navy)]", children: "← Volver al inicio de sesión" })
        ] }) })
      ] }),
      /* @__PURE__ */ jsxs("p", { className: "mt-6 text-center text-xs font-medium text-[var(--siu-text-muted)]", children: [
        "© ",
        (/* @__PURE__ */ new Date()).getFullYear(),
        " Instituto Superior de Informática Puerto Piray"
      ] })
    ] })
  ] });
}
export {
  LoginPage as component
};
