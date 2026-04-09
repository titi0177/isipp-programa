import { jsxs, jsx } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { R as Route, s as supabase } from "./router-Cgpt3s8a.js";
import { g as generateRegularCertificate } from "./generateRegularCertificate-BF53t3EU.js";
import { g as generateApprovedSubjects } from "./generateApprovedSubjects-Zemh8r0S.js";
import "@tanstack/react-router";
import "lucide-react";
import "@supabase/supabase-js";
import "chart.js";
import "jspdf";
function StudentRecord() {
  const {
    id
  } = Route.useParams();
  const [student, setStudent] = useState(null);
  const [subjects, setSubjects] = useState([]);
  useEffect(() => {
    load();
  }, [id]);
  async function load() {
    const {
      data: studentData
    } = await supabase.from("students").select(`
        *,
        program:programs(name)
      `).eq("id", id).single();
    setStudent(studentData);
    const {
      data
    } = await supabase.from("grades").select(`
        final_grade,
        enrollment:enrollments(
          subject:subjects(name)
        )
      `).eq("enrollment.student_id", id);
    const formatted = data?.map((g) => ({
      name: g.enrollment.subject.name,
      final_grade: g.final_grade
    }));
    setSubjects(formatted || []);
  }
  if (!student) return null;
  return /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsx("h1", { className: "text-2xl font-bold", children: "Historial Académico" }),
    /* @__PURE__ */ jsxs("div", { className: "bg-white p-6 rounded-lg shadow", children: [
      /* @__PURE__ */ jsxs("p", { children: [
        /* @__PURE__ */ jsx("b", { children: "Alumno:" }),
        " ",
        student.first_name,
        " ",
        student.last_name
      ] }),
      /* @__PURE__ */ jsxs("p", { children: [
        /* @__PURE__ */ jsx("b", { children: "DNI:" }),
        " ",
        student.dni
      ] }),
      /* @__PURE__ */ jsxs("p", { children: [
        /* @__PURE__ */ jsx("b", { children: "Carrera:" }),
        " ",
        student.program?.name
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "flex gap-4", children: [
      /* @__PURE__ */ jsx("button", { onClick: () => generateRegularCertificate(student, student.program), className: "btn-primary", children: "Constancia Alumno Regular" }),
      /* @__PURE__ */ jsx("button", { onClick: () => generateApprovedSubjects(student, subjects), className: "btn-secondary", children: "Constancia Materias Aprobadas" })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "bg-white p-6 rounded-lg shadow", children: [
      /* @__PURE__ */ jsx("h2", { className: "text-lg font-semibold mb-4", children: "Materias cursadas" }),
      /* @__PURE__ */ jsxs("table", { className: "w-full", children: [
        /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsxs("tr", { className: "border-b", children: [
          /* @__PURE__ */ jsx("th", { className: "text-left py-2", children: "Materia" }),
          /* @__PURE__ */ jsx("th", { className: "text-left py-2", children: "Nota" }),
          /* @__PURE__ */ jsx("th", { className: "text-left py-2", children: "Estado" })
        ] }) }),
        /* @__PURE__ */ jsx("tbody", { children: subjects.map((s, i) => {
          let estado = "Desaprobado";
          if (s.final_grade >= 7) estado = "Promocionado";
          else if (s.final_grade >= 4) estado = "Aprobado";
          return /* @__PURE__ */ jsxs("tr", { className: "border-b", children: [
            /* @__PURE__ */ jsx("td", { className: "py-2", children: s.name }),
            /* @__PURE__ */ jsx("td", { children: s.final_grade }),
            /* @__PURE__ */ jsx("td", { children: estado })
          ] }, i);
        }) })
      ] })
    ] })
  ] });
}
export {
  StudentRecord as component
};
