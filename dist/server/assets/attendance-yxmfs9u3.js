import { jsxs, jsx, Fragment } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { u as useToast, s as supabase } from "./router-Cgpt3s8a.js";
import "@tanstack/react-router";
import "lucide-react";
import "@supabase/supabase-js";
import "chart.js";
function ProfessorAttendancePage() {
  const [subjects, setSubjects] = useState([]);
  const [rows, setRows] = useState([]);
  const [selected, setSelected] = useState("");
  const {
    showToast
  } = useToast();
  useEffect(() => {
    void loadSubjects();
  }, []);
  async function loadSubjects() {
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
      setSubjects([]);
      return;
    }
    const {
      data
    } = await supabase.from("subjects").select("*").eq("professor_id", prof.id).order("name");
    setSubjects(data ?? []);
  }
  async function loadStudents(id) {
    const {
      data
    } = await supabase.from("enrollments").select(`
        id,
        student:students(first_name,last_name),
        attendance:attendance(*)
      `).eq("subject_id", id);
    const normalized = (data || []).map((r) => ({
      ...r,
      percentage: r.percentage ?? r.attendance?.[0]?.percentage ?? ""
    }));
    setRows(normalized);
  }
  function update(i, val) {
    const copy = [...rows];
    copy[i].percentage = val;
    setRows(copy);
  }
  async function save() {
    for (const r of rows) {
      const pct = typeof r.percentage === "number" ? r.percentage : Number(r.percentage);
      if (Number.isNaN(pct)) continue;
      const existing = r.attendance?.[0];
      if (existing) {
        await supabase.from("attendance").update({
          percentage: pct
        }).eq("id", existing.id);
      } else {
        await supabase.from("attendance").insert({
          enrollment_id: r.id,
          percentage: pct
        });
      }
    }
    showToast("Asistencia guardada");
  }
  return /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsx("h1", { className: "text-2xl font-bold", children: "Asistencia por materia" }),
    /* @__PURE__ */ jsx("p", { className: "text-sm text-slate-600", children: "Solo tus asignaturas a cargo." }),
    /* @__PURE__ */ jsxs("select", { className: "form-input max-w-md", value: selected, onChange: (e) => {
      const v = e.target.value;
      setSelected(v);
      if (v) void loadStudents(v);
      else setRows([]);
    }, children: [
      /* @__PURE__ */ jsx("option", { value: "", children: "Seleccionar materia" }),
      subjects.map((s) => /* @__PURE__ */ jsx("option", { value: s.id, children: s.name }, s.id))
    ] }),
    rows.length > 0 && /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsxs("table", { className: "w-full text-sm", children: [
        /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsxs("tr", { className: "table-header", children: [
          /* @__PURE__ */ jsx("th", { children: "Alumno" }),
          /* @__PURE__ */ jsx("th", { children: "%" })
        ] }) }),
        /* @__PURE__ */ jsx("tbody", { children: rows.map((r, i) => /* @__PURE__ */ jsxs("tr", { className: "border-b", children: [
          /* @__PURE__ */ jsxs("td", { children: [
            r.student?.last_name,
            ", ",
            r.student?.first_name
          ] }),
          /* @__PURE__ */ jsx("td", { children: /* @__PURE__ */ jsx("input", { type: "number", className: "form-input", value: r.percentage ?? "", onChange: (e) => update(i, +e.target.value) }) })
        ] }, r.id)) })
      ] }),
      /* @__PURE__ */ jsx("button", { type: "button", className: "btn-primary", onClick: () => void save(), children: "Guardar" })
    ] })
  ] });
}
export {
  ProfessorAttendancePage as component
};
