import { jsx, jsxs } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { s as supabase } from "./router-Cgpt3s8a.js";
import "@tanstack/react-router";
import "lucide-react";
import "@supabase/supabase-js";
import "chart.js";
function ProfessorSubjectsPage() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
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
      setRows([]);
      setLoading(false);
      return;
    }
    const {
      data: prof
    } = await supabase.from("professors").select("id").eq("user_id", user.id).maybeSingle();
    if (!prof?.id) {
      setRows([]);
      setLoading(false);
      return;
    }
    const {
      data
    } = await supabase.from("subjects").select("*, program:programs(name)").eq("professor_id", prof.id).order("name");
    setRows(data ?? []);
    setLoading(false);
  }
  if (loading) {
    return /* @__PURE__ */ jsx("p", { className: "text-slate-600", children: "Cargando…" });
  }
  return /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsx("h1", { className: "text-2xl font-bold", children: "Mis asignaturas" }),
    /* @__PURE__ */ jsxs("div", { className: "card overflow-hidden p-0", children: [
      /* @__PURE__ */ jsxs("table", { className: "w-full text-sm", children: [
        /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsxs("tr", { className: "table-header", children: [
          /* @__PURE__ */ jsx("th", { className: "px-4 py-2 text-left", children: "Código" }),
          /* @__PURE__ */ jsx("th", { className: "px-4 py-2 text-left", children: "Nombre" }),
          /* @__PURE__ */ jsx("th", { className: "px-4 py-2 text-left", children: "Programa" }),
          /* @__PURE__ */ jsx("th", { className: "px-4 py-2 text-left", children: "Año" }),
          /* @__PURE__ */ jsx("th", { className: "px-4 py-2 text-left", children: "Créditos" })
        ] }) }),
        /* @__PURE__ */ jsx("tbody", { children: rows.map((s) => /* @__PURE__ */ jsxs("tr", { className: "border-b border-slate-100", children: [
          /* @__PURE__ */ jsx("td", { className: "px-4 py-2 font-mono text-xs", children: s.code }),
          /* @__PURE__ */ jsx("td", { className: "px-4 py-2", children: s.name }),
          /* @__PURE__ */ jsx("td", { className: "px-4 py-2 text-slate-600", children: s.program?.name ?? "—" }),
          /* @__PURE__ */ jsx("td", { className: "px-4 py-2", children: s.year }),
          /* @__PURE__ */ jsx("td", { className: "px-4 py-2", children: s.credits })
        ] }, s.id)) })
      ] }),
      rows.length === 0 && /* @__PURE__ */ jsx("p", { className: "p-6 text-slate-600", children: "No tenés asignaturas asignadas." })
    ] })
  ] });
}
export {
  ProfessorSubjectsPage as component
};
