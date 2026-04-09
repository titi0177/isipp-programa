import { jsxs, jsx } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { u as useToast, s as supabase } from "./router-Cgpt3s8a.js";
import "@tanstack/react-router";
import "lucide-react";
import "@supabase/supabase-js";
import "chart.js";
function AttendancePage() {
  const [subjects, setSubjects] = useState([]);
  const [rows, setRows] = useState([]);
  const [selected, setSelected] = useState("");
  const {
    showToast
  } = useToast();
  useEffect(() => {
    loadSubjects();
  }, []);
  async function loadSubjects() {
    const {
      data
    } = await supabase.from("subjects").select("*");
    setSubjects(data || []);
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
    /* @__PURE__ */ jsx("h1", { className: "text-2xl font-bold", children: "Asistencia por Materia" }),
    /* @__PURE__ */ jsxs("select", { className: "form-input", value: selected, onChange: (e) => {
      setSelected(e.target.value);
      loadStudents(e.target.value);
    }, children: [
      /* @__PURE__ */ jsx("option", { value: "", children: "Seleccionar materia" }),
      subjects.map((s) => /* @__PURE__ */ jsx("option", { value: s.id, children: s.name }, s.id))
    ] }),
    rows.length > 0 && /* @__PURE__ */ jsxs("table", { className: "w-full", children: [
      /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsxs("tr", { className: "table-header", children: [
        /* @__PURE__ */ jsx("th", { children: "Alumno" }),
        /* @__PURE__ */ jsx("th", { children: "%" })
      ] }) }),
      /* @__PURE__ */ jsx("tbody", { children: rows.map((r, i) => /* @__PURE__ */ jsxs("tr", { children: [
        /* @__PURE__ */ jsxs("td", { children: [
          r.student?.last_name,
          ", ",
          r.student?.first_name
        ] }),
        /* @__PURE__ */ jsx("td", { children: /* @__PURE__ */ jsx("input", { type: "number", className: "form-input", value: r.percentage ?? "", onChange: (e) => update(i, +e.target.value) }) })
      ] }, r.id)) })
    ] }),
    /* @__PURE__ */ jsx("button", { onClick: save, className: "btn-primary", children: "Guardar" })
  ] });
}
export {
  AttendancePage as component
};
