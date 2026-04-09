import { jsxs, jsx } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { s as supabase } from "./router-Cgpt3s8a.js";
import { g as generateRegularCertificate } from "./generateRegularCertificate-BF53t3EU.js";
import { g as generateApprovedSubjects } from "./generateApprovedSubjects-Zemh8r0S.js";
import "@tanstack/react-router";
import "lucide-react";
import "@supabase/supabase-js";
import "chart.js";
import "jspdf";
function CertificatesPage() {
  const [student, setStudent] = useState(null);
  const [subjects, setSubjects] = useState([]);
  useEffect(() => {
    load();
  }, []);
  async function load() {
    const {
      data: userData
    } = await supabase.auth.getUser();
    const {
      data: studentData
    } = await supabase.from("students").select(`
    *,
    program:programs(name)
  `).eq("user_id", userData.user?.id).single();
    setStudent(studentData);
    if (!studentData?.id) {
      setSubjects([]);
      return;
    }
    const {
      data
    } = await supabase.from("grades").select(`
    final_grade,
    enrollment:enrollments(
      subject:subjects(name)
    )
  `).eq("enrollment.student_id", studentData.id);
    const formatted = data?.map((g) => ({
      name: g.enrollment?.subject?.name,
      final_grade: g.final_grade
    })).filter((x) => x.name != null);
    setSubjects(formatted || []);
  }
  if (!student) {
    return /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
      /* @__PURE__ */ jsx("h1", { className: "text-2xl font-bold", children: "Certificados" }),
      /* @__PURE__ */ jsx("p", { className: "text-gray-600 text-sm", children: "No se encontró tu ficha de estudiante. Contactá a secretaría." })
    ] });
  }
  return /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsx("h1", { className: "text-2xl font-bold", children: "Certificados" }),
    /* @__PURE__ */ jsxs("div", { className: "bg-white p-6 rounded-lg shadow space-y-4", children: [
      /* @__PURE__ */ jsx("button", { type: "button", onClick: () => generateRegularCertificate(student, student.program), className: "inline-flex items-center justify-center rounded-sm border border-emerald-900 bg-emerald-700 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-800", children: "Descargar Certificado Alumno Regular" }),
      /* @__PURE__ */ jsx("button", { type: "button", onClick: () => generateApprovedSubjects(student, subjects), className: "btn-primary px-4 py-2", children: "Descargar Certificado Materias Aprobadas" })
    ] })
  ] });
}
export {
  CertificatesPage as component
};
