import { jsx, jsxs } from "react/jsx-runtime";
import { useState, useEffect, useMemo } from "react";
import { s as supabase } from "./router-Cgpt3s8a.js";
import { CheckCircle2, BookOpen, Lock } from "lucide-react";
import "@tanstack/react-router";
import "@supabase/supabase-js";
import "chart.js";
function RoadmapPage() {
  const [loading, setLoading] = useState(true);
  const [programName, setProgramName] = useState("");
  const [subjects, setSubjects] = useState([]);
  useEffect(() => {
    void load();
  }, []);
  async function load() {
    setLoading(true);
    const {
      data: {
        user
      }
    } = await supabase.auth.getUser();
    if (!user) {
      setLoading(false);
      return;
    }
    const {
      data: student
    } = await supabase.from("students").select("id, year, program_id, program:programs(name)").eq("user_id", user.id).single();
    if (!student) {
      setLoading(false);
      return;
    }
    setProgramName(student.program?.name ?? "");
    const programId = student.program_id;
    const studentYear = student.year;
    let catalog = [];
    if (programId) {
      const {
        data: subs
      } = await supabase.from("subjects").select("id, name, code, year").eq("program_id", programId).order("year").order("code");
      catalog = subs ?? [];
    }
    const {
      data: enrollments
    } = await supabase.from("enrollments").select("subject_id, year, grades(*)").eq("student_id", student.id);
    const enrolledIds = new Set((enrollments ?? []).map((e) => e.subject_id));
    const passedIds = new Set((enrollments ?? []).filter((e) => {
      const g = Array.isArray(e.grades) ? e.grades[0] : e.grades;
      return g && ["promoted", "passed", "regular"].includes(g.status);
    }).map((e) => e.subject_id));
    const {
      data: corrs
    } = await supabase.from("subject_correlatives").select("subject_id, requires_subject_id");
    const requiresMap = /* @__PURE__ */ new Map();
    for (const c of corrs ?? []) {
      const arr = requiresMap.get(c.subject_id) ?? [];
      arr.push(c.requires_subject_id);
      requiresMap.set(c.subject_id, arr);
    }
    const computed = catalog.map((s) => {
      const reqs = requiresMap.get(s.id) ?? [];
      const correlatives_ok = reqs.length === 0 || reqs.every((rid) => passedIds.has(rid));
      let state = "locked";
      if (passedIds.has(s.id)) state = "done";
      else if (enrolledIds.has(s.id)) state = "current";
      else if (correlatives_ok && s.year <= studentYear + 1) state = "available";
      else state = "locked";
      return {
        id: s.id,
        name: s.name,
        code: s.code,
        year: s.year,
        correlatives_ok,
        state
      };
    });
    setSubjects(computed);
    setLoading(false);
  }
  const byYear = useMemo(() => {
    const m = /* @__PURE__ */ new Map();
    for (const s of subjects) {
      const arr = m.get(s.year) ?? [];
      arr.push(s);
      m.set(s.year, arr);
    }
    return [...m.entries()].sort((a, b) => a[0] - b[0]);
  }, [subjects]);
  if (loading) return /* @__PURE__ */ jsx("p", { className: "text-slate-600", children: "Cargando plan de estudios…" });
  return /* @__PURE__ */ jsxs("div", { className: "space-y-8", children: [
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx("h1", { className: "text-2xl font-bold", children: "Plan de estudios" }),
      programName && /* @__PURE__ */ jsxs("p", { className: "mt-1 text-slate-600", children: [
        "Propuesta: ",
        /* @__PURE__ */ jsx("span", { className: "font-semibold text-slate-800", children: programName })
      ] }),
      /* @__PURE__ */ jsx("p", { className: "mt-2 max-w-3xl text-sm text-slate-600", children: "Estados: cursada aprobada, en curso, disponible para inscribir (correlativas aprobadas), o bloqueada." })
    ] }),
    byYear.map(([year, list]) => /* @__PURE__ */ jsxs("section", { className: "space-y-3", children: [
      /* @__PURE__ */ jsxs("h2", { className: "text-lg font-bold text-[var(--siu-navy)]", children: [
        "Año ",
        year
      ] }),
      /* @__PURE__ */ jsx("div", { className: "grid gap-2 md:grid-cols-2 xl:grid-cols-3", children: list.map((s) => /* @__PURE__ */ jsxs("div", { className: `card flex gap-3 border-l-4 p-4 ${s.state === "done" ? "border-l-emerald-600 bg-emerald-50/40" : s.state === "current" ? "border-l-sky-600 bg-sky-50/40" : s.state === "available" ? "border-l-amber-500 bg-amber-50/30" : "border-l-slate-300 bg-slate-50/50"}`, children: [
        /* @__PURE__ */ jsxs("div", { className: "pt-0.5", children: [
          s.state === "done" && /* @__PURE__ */ jsx(CheckCircle2, { className: "h-5 w-5 text-emerald-700" }),
          s.state === "current" && /* @__PURE__ */ jsx(BookOpen, { className: "h-5 w-5 text-sky-700" }),
          s.state === "available" && /* @__PURE__ */ jsx(BookOpen, { className: "h-5 w-5 text-amber-700" }),
          s.state === "locked" && /* @__PURE__ */ jsx(Lock, { className: "h-5 w-5 text-slate-400" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "min-w-0 flex-1", children: [
          /* @__PURE__ */ jsx("div", { className: "font-mono text-[11px] font-semibold text-slate-500", children: s.code }),
          /* @__PURE__ */ jsx("div", { className: "font-semibold leading-snug text-slate-900", children: s.name }),
          /* @__PURE__ */ jsxs("div", { className: "mt-1 text-xs text-slate-600", children: [
            s.state === "done" && "Aprobada",
            s.state === "current" && "En curso",
            s.state === "available" && "Podés inscribirte (según cupos y fechas)",
            s.state === "locked" && !s.correlatives_ok && "Bloqueada por correlativas",
            s.state === "locked" && s.correlatives_ok && "Bloqueada (año / gestión)"
          ] })
        ] })
      ] }, s.id)) })
    ] }, year)),
    subjects.length === 0 && /* @__PURE__ */ jsx("p", { className: "text-slate-600", children: "No hay materias catalogadas para tu programa." })
  ] });
}
export {
  RoadmapPage as component
};
