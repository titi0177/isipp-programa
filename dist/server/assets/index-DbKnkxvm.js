import { jsxs, jsx } from "react/jsx-runtime";
import { Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { s as supabase } from "./router-Cgpt3s8a.js";
import { BookOpen, Users, Star, ClipboardCheck } from "lucide-react";
import { S as StatCard } from "./StatCard-fdzWNmjS.js";
import "@supabase/supabase-js";
import "chart.js";
function ProfessorHome() {
  const [professorId, setProfessorId] = useState(null);
  const [subjectCount, setSubjectCount] = useState(0);
  const [enrollmentCount, setEnrollmentCount] = useState(0);
  useEffect(() => {
    void load();
  }, []);
  async function load() {
    const {
      data: {
        user
      }
    } = await supabase.auth.getUser();
    if (!user) return;
    const {
      data: prof
    } = await supabase.from("professors").select("id").eq("user_id", user.id).maybeSingle();
    if (!prof?.id) {
      setProfessorId(null);
      return;
    }
    setProfessorId(prof.id);
    const {
      data: subjects
    } = await supabase.from("subjects").select("id").eq("professor_id", prof.id);
    const ids = subjects?.map((s) => s.id) ?? [];
    setSubjectCount(ids.length);
    if (ids.length === 0) {
      setEnrollmentCount(0);
      return;
    }
    const {
      count
    } = await supabase.from("enrollments").select("id", {
      count: "exact",
      head: true
    }).in("subject_id", ids);
    setEnrollmentCount(count ?? 0);
  }
  if (!professorId) {
    return /* @__PURE__ */ jsxs("div", { className: "card space-y-4 p-6", children: [
      /* @__PURE__ */ jsx("h1", { className: "text-2xl font-bold", children: "Portal docente" }),
      /* @__PURE__ */ jsxs("p", { className: "text-slate-600", children: [
        "Tu usuario aún no está vinculado a un registro de docente. Un administrador debe asignar tu ",
        /* @__PURE__ */ jsx("strong", { children: "user_id" }),
        " en la tabla ",
        /* @__PURE__ */ jsx("code", { className: "rounded bg-slate-100 px-1", children: "professors" }),
        ", o vincular el docente desde administración."
      ] }),
      /* @__PURE__ */ jsx(Link, { to: "/dashboard", className: "btn-primary inline-block w-fit", children: "Volver al inicio" })
    ] });
  }
  return /* @__PURE__ */ jsxs("div", { className: "space-y-8", children: [
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx("h1", { className: "text-2xl font-bold text-slate-900", children: "Portal docente" }),
      /* @__PURE__ */ jsx("p", { className: "mt-1 text-slate-600", children: "Resumen de tus asignaturas a cargo" })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "grid gap-4 sm:grid-cols-2 lg:grid-cols-3", children: [
      /* @__PURE__ */ jsx(StatCard, { title: "Asignaturas", value: subjectCount, icon: BookOpen }),
      /* @__PURE__ */ jsx(StatCard, { title: "Inscriptos (total)", value: enrollmentCount, icon: Users })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "grid gap-4 md:grid-cols-3", children: [
      /* @__PURE__ */ jsxs(Link, { to: "/professor/subjects", className: "card siu-hover-card flex items-center gap-3 p-4", children: [
        /* @__PURE__ */ jsx(BookOpen, { className: "h-8 w-8 text-[var(--siu-burgundy)]" }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("div", { className: "font-semibold", children: "Mis asignaturas" }),
          /* @__PURE__ */ jsx("div", { className: "text-sm text-slate-500", children: "Listado y detalle" })
        ] })
      ] }),
      /* @__PURE__ */ jsxs(Link, { to: "/professor/grades", className: "card siu-hover-card flex items-center gap-3 p-4", children: [
        /* @__PURE__ */ jsx(Star, { className: "h-8 w-8 text-[var(--siu-burgundy)]" }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("div", { className: "font-semibold", children: "Calificaciones" }),
          /* @__PURE__ */ jsx("div", { className: "text-sm text-slate-500", children: "Carga de notas" })
        ] })
      ] }),
      /* @__PURE__ */ jsxs(Link, { to: "/professor/attendance", className: "card siu-hover-card flex items-center gap-3 p-4", children: [
        /* @__PURE__ */ jsx(ClipboardCheck, { className: "h-8 w-8 text-[var(--siu-burgundy)]" }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("div", { className: "font-semibold", children: "Asistencia" }),
          /* @__PURE__ */ jsx("div", { className: "text-sm text-slate-500", children: "Por cursada" })
        ] })
      ] })
    ] })
  ] });
}
export {
  ProfessorHome as component
};
