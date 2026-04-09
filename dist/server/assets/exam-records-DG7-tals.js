import { jsxs, jsx } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { u as useToast, s as supabase } from "./router-Cgpt3s8a.js";
import jsPDF from "jspdf";
import { Plus, FileDown } from "lucide-react";
import "@tanstack/react-router";
import "@supabase/supabase-js";
import "chart.js";
function generateExamRecordPdf(params) {
  const doc = new jsPDF();
  let y = 22;
  doc.setFontSize(16);
  doc.text(params.institution, 105, y, { align: "center" });
  y += 10;
  doc.setFontSize(14);
  doc.text(params.title, 105, y, { align: "center" });
  y += 12;
  doc.setFontSize(10);
  doc.text(`Materia: ${params.subjectName}${params.subjectCode ? ` (${params.subjectCode})` : ""}`, 14, y);
  y += 6;
  if (params.career) {
    doc.text(`Carrera / plan: ${params.career}`, 14, y);
    y += 6;
  }
  doc.text(`Fecha y hora: ${params.examDate}`, 14, y);
  y += 6;
  doc.text(`Docente responsable: ${params.professorName ?? "—"}`, 14, y);
  y += 10;
  doc.setFontSize(9);
  doc.text("Alumnos inscriptos y calificación final registrada", 14, y);
  y += 6;
  doc.setFillColor(240, 240, 240);
  doc.rect(14, y - 4, 182, 7, "F");
  doc.text("Legajo", 16, y);
  doc.text("Apellido y nombre", 40, y);
  doc.text("Nota final", 170, y);
  y += 8;
  for (const s of params.students) {
    if (y > 270) {
      doc.addPage();
      y = 20;
    }
    doc.text(String(s.legajo), 16, y);
    const name = doc.splitTextToSize(s.nombre, 120);
    doc.text(name, 40, y);
    doc.text(s.nota != null && s.nota !== "" ? String(s.nota) : "—", 170, y);
    y += Math.max(6, name.length * 5);
  }
  y += 14;
  doc.setFontSize(9);
  doc.text("Firma del docente: _______________________________", 14, y);
  y += 10;
  doc.text("Firma y sello institucional: _______________________________", 14, y);
  y += 10;
  doc.setFontSize(8);
  doc.text(
    "Documento generado desde el sistema académico ISIPP. Validez sujeta a registro en Secretaría.",
    14,
    y,
    { maxWidth: 180 }
  );
  doc.save(`acta_examen_${params.subjectCode ?? "materia"}.pdf`);
}
const INSTITUTION = "Instituto Superior de Informática Puerto Piray (ISIPP 1206)";
function ExamRecordsAdminPage() {
  const [records, setRecords] = useState([]);
  const [mesas, setMesas] = useState([]);
  const [mesaId, setMesaId] = useState("");
  const {
    showToast
  } = useToast();
  useEffect(() => {
    void load();
  }, []);
  async function load() {
    const [r1, r2] = await Promise.all([supabase.from("exam_records").select("*, subject:subjects(name, code), professor:professors(name)").order("created_at", {
      ascending: false
    }), supabase.from("final_exams").select("*, subject:subjects(name, code, program:programs(name)), professor:professors(name)").order("exam_date", {
      ascending: false
    })]);
    setRecords(r1.data ?? []);
    setMesas(r2.data ?? []);
  }
  async function buildRowsForMesa(exam) {
    const {
      data: regs
    } = await supabase.from("exam_enrollments").select("student:students(id, legajo, first_name, last_name)").eq("final_exam_id", exam.id);
    const rows = [];
    for (const r of regs ?? []) {
      const st = r.student;
      if (!st?.id) continue;
      const {
        data: enr
      } = await supabase.from("enrollments").select("grades:grades(final_grade)").eq("student_id", st.id).eq("subject_id", exam.subject_id).maybeSingle();
      const g = Array.isArray(enr?.grades) ? enr?.grades[0] : enr?.grades;
      rows.push({
        legajo: st.legajo,
        nombre: `${st.last_name}, ${st.first_name}`,
        nota: g?.final_grade ?? null
      });
    }
    return rows;
  }
  async function crearActaDesdeMesa() {
    if (!mesaId) {
      showToast("Seleccioná una mesa de examen.", "error");
      return;
    }
    const exam = mesas.find((m) => m.id === mesaId);
    if (!exam) return;
    const students = await buildRowsForMesa(exam);
    const examDateIso = exam.exam_date;
    const {
      data: inserted,
      error
    } = await supabase.from("exam_records").insert({
      subject_id: exam.subject_id,
      professor_id: exam.professor_id,
      final_exam_id: exam.id,
      exam_date: examDateIso,
      title: "ACTA DE EXAMEN FINAL",
      students_grades: students,
      estado_acta: "borrador",
      institution_id: exam.institution_id ?? void 0
    }).select("id").single();
    if (error) {
      showToast(error.message, "error");
      return;
    }
    showToast("Acta creada en estado borrador.");
    void load();
    if (inserted?.id) {
      descargarPdf({
        id: inserted.id,
        exam_date: examDateIso,
        title: "ACTA DE EXAMEN FINAL",
        subject: exam.subject,
        professor: exam.professor,
        students_grades: students
      });
    }
  }
  function descargarPdf(rec) {
    const students = Array.isArray(rec.students_grades) ? rec.students_grades : typeof rec.students_grades === "string" ? JSON.parse(rec.students_grades) : [];
    generateExamRecordPdf({
      title: rec.title ?? "ACTA DE EXAMEN FINAL",
      institution: INSTITUTION,
      career: rec.subject?.program?.name,
      subjectName: rec.subject?.name ?? "Materia",
      subjectCode: rec.subject?.code,
      examDate: new Date(rec.exam_date).toLocaleString("es-AR"),
      professorName: rec.professor?.name,
      students
    });
  }
  return /* @__PURE__ */ jsxs("div", { className: "space-y-8", children: [
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx("h1", { className: "text-2xl font-bold", children: "Actas de examen final" }),
      /* @__PURE__ */ jsx("p", { className: "mt-1 text-sm text-slate-600", children: "Generá actas oficiales con alumnos inscriptos a la mesa y notas del cursado. Podés imprimir o guardar PDF." })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "card space-y-4 p-5", children: [
      /* @__PURE__ */ jsx("h2", { className: "font-semibold", children: "Nueva acta desde mesa" }),
      /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-3 sm:flex-row sm:items-end", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex-1", children: [
          /* @__PURE__ */ jsx("label", { className: "form-label", children: "Mesa de examen" }),
          /* @__PURE__ */ jsxs("select", { className: "form-input w-full", value: mesaId, onChange: (e) => setMesaId(e.target.value), children: [
            /* @__PURE__ */ jsx("option", { value: "", children: "Seleccionar…" }),
            mesas.map((m) => /* @__PURE__ */ jsxs("option", { value: m.id, children: [
              m.subject?.name ?? "Materia",
              " · ",
              new Date(m.exam_date).toLocaleString("es-AR")
            ] }, m.id))
          ] })
        ] }),
        /* @__PURE__ */ jsxs("button", { type: "button", className: "btn-primary flex items-center gap-2", onClick: () => void crearActaDesdeMesa(), children: [
          /* @__PURE__ */ jsx(Plus, { size: 18 }),
          "Crear acta y PDF"
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "card overflow-hidden p-0", children: [
      /* @__PURE__ */ jsx("div", { className: "border-b border-slate-100 px-5 py-3 font-semibold", children: "Actas registradas" }),
      /* @__PURE__ */ jsxs("div", { className: "overflow-x-auto", children: [
        /* @__PURE__ */ jsxs("table", { className: "w-full min-w-[640px] text-sm", children: [
          /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsxs("tr", { className: "table-header", children: [
            /* @__PURE__ */ jsx("th", { className: "px-4 py-2 text-left", children: "Materia" }),
            /* @__PURE__ */ jsx("th", { className: "px-4 py-2 text-left", children: "Fecha" }),
            /* @__PURE__ */ jsx("th", { className: "px-4 py-2 text-left", children: "Estado" }),
            /* @__PURE__ */ jsx("th", { className: "px-4 py-2 text-left", children: "Acciones" })
          ] }) }),
          /* @__PURE__ */ jsx("tbody", { children: records.map((rec) => /* @__PURE__ */ jsxs("tr", { className: "border-b", children: [
            /* @__PURE__ */ jsx("td", { className: "px-4 py-2", children: rec.subject?.name }),
            /* @__PURE__ */ jsx("td", { className: "px-4 py-2", children: new Date(rec.exam_date).toLocaleString("es-AR") }),
            /* @__PURE__ */ jsx("td", { className: "px-4 py-2 capitalize", children: rec.estado_acta }),
            /* @__PURE__ */ jsx("td", { className: "px-4 py-2", children: /* @__PURE__ */ jsxs("button", { type: "button", className: "inline-flex items-center gap-1 text-sm font-semibold text-[var(--siu-blue)] hover:underline", onClick: () => descargarPdf(rec), children: [
              /* @__PURE__ */ jsx(FileDown, { size: 16 }),
              "PDF / imprimir"
            ] }) })
          ] }, rec.id)) })
        ] }),
        records.length === 0 && /* @__PURE__ */ jsx("p", { className: "p-6 text-slate-600", children: "No hay actas cargadas." })
      ] })
    ] })
  ] });
}
export {
  ExamRecordsAdminPage as component
};
