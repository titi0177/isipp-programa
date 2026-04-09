import { jsxs, jsx } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { u as useToast, s as supabase } from "./router-Cgpt3s8a.js";
import "@tanstack/react-router";
import "lucide-react";
import "@supabase/supabase-js";
import "chart.js";
function ProfessorGradesPage() {
  const [subjects, setSubjects] = useState([]);
  const [selected, setSelected] = useState("");
  const [rows, setRows] = useState([]);
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
  async function loadStudents(subjectId) {
    const {
      data
    } = await supabase.from("enrollments").select(`
        id,
        student:students(first_name,last_name),
        grade:grades(*)
      `).eq("subject_id", subjectId);
    setRows(data ?? []);
  }
  function updateValue(i, key, val) {
    const copy = [...rows];
    copy[i] = {
      ...copy[i],
      [key]: val === "" ? void 0 : val
    };
    setRows(copy);
  }
  async function saveAll() {
    for (const r of rows) {
      const existing = Array.isArray(r.grade) ? r.grade[0] : r.grade;
      const partial = r.partial_grade ?? existing?.partial_grade;
      const fx = r.final_exam_grade ?? existing?.final_exam_grade;
      const final = fx ?? partial;
      const status = final == null || Number.isNaN(final) ? "in_progress" : final >= 7 ? "promoted" : final >= 4 ? "passed" : "failed";
      if (existing?.id) {
        await supabase.from("grades").update({
          partial_grade: r.partial_grade ?? existing.partial_grade,
          final_exam_grade: r.final_exam_grade ?? existing.final_exam_grade,
          final_grade: final ?? void 0,
          status
        }).eq("id", existing.id);
      } else {
        await supabase.from("grades").insert({
          enrollment_id: r.id,
          partial_grade: r.partial_grade,
          final_exam_grade: r.final_exam_grade,
          final_grade: final ?? void 0,
          status
        });
      }
    }
    showToast("Notas guardadas correctamente");
    if (selected) await loadStudents(selected);
  }
  return /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsx("h1", { className: "text-2xl font-bold", children: "Carga de notas" }),
    /* @__PURE__ */ jsx("p", { className: "text-sm text-slate-600", children: "Solo materias donde figurás como docente a cargo." }),
    /* @__PURE__ */ jsxs("select", { className: "form-input max-w-md", value: selected, onChange: (e) => {
      const v = e.target.value;
      setSelected(v);
      if (v) void loadStudents(v);
      else setRows([]);
    }, children: [
      /* @__PURE__ */ jsx("option", { value: "", children: "Seleccionar materia" }),
      subjects.map((s) => /* @__PURE__ */ jsx("option", { value: s.id, children: s.name }, s.id))
    ] }),
    rows.length > 0 && /* @__PURE__ */ jsxs("div", { className: "card p-4", children: [
      /* @__PURE__ */ jsxs("table", { className: "w-full text-sm", children: [
        /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsxs("tr", { className: "table-header", children: [
          /* @__PURE__ */ jsx("th", { children: "Alumno" }),
          /* @__PURE__ */ jsx("th", { children: "Parcial" }),
          /* @__PURE__ */ jsx("th", { children: "Final" }),
          /* @__PURE__ */ jsx("th", { children: "Nota" })
        ] }) }),
        /* @__PURE__ */ jsx("tbody", { children: rows.map((r, i) => {
          const g0 = Array.isArray(r.grade) ? r.grade[0] : r.grade;
          const partial = r.partial_grade ?? g0?.partial_grade;
          const finalEx = r.final_exam_grade ?? g0?.final_exam_grade;
          const final = finalEx ?? partial;
          return /* @__PURE__ */ jsxs("tr", { className: "border-b", children: [
            /* @__PURE__ */ jsxs("td", { children: [
              r.student?.last_name,
              ", ",
              r.student?.first_name
            ] }),
            /* @__PURE__ */ jsx("td", { children: /* @__PURE__ */ jsx("input", { type: "number", className: "form-input", value: partial ?? "", onChange: (e) => updateValue(i, "partial_grade", e.target.value === "" ? "" : +e.target.value) }) }),
            /* @__PURE__ */ jsx("td", { children: /* @__PURE__ */ jsx("input", { type: "number", className: "form-input", value: finalEx ?? "", onChange: (e) => updateValue(i, "final_exam_grade", e.target.value === "" ? "" : +e.target.value) }) }),
            /* @__PURE__ */ jsx("td", { children: final ?? "-" })
          ] }, r.id);
        }) })
      ] }),
      /* @__PURE__ */ jsx("button", { type: "button", onClick: () => void saveAll(), className: "btn-primary mt-4", children: "Guardar todo" })
    ] })
  ] });
}
export {
  ProfessorGradesPage as component
};
