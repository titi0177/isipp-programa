import { jsxs, jsx } from "react/jsx-runtime";
import { Link } from "@tanstack/react-router";
import { useEffect, useState, useCallback } from "react";
import { s as supabase } from "./router-Cgpt3s8a.js";
import { g as generateRegularCertificate } from "./generateRegularCertificate-BF53t3EU.js";
import { TrendingUp, GraduationCap, CalendarCheck, BookOpen, Calendar } from "lucide-react";
import { S as StatCard } from "./StatCard-fdzWNmjS.js";
import { u as useRealtimeAnnouncements } from "./useRealtimeAnnouncements-DZUz7Ti-.js";
import "@supabase/supabase-js";
import "chart.js";
import "jspdf";
function CareerProgressBar({
  careerName,
  porcentaje,
  aprobadas,
  enCurso,
  pendientes,
  totalMaterias
}) {
  const pct = Math.min(100, Math.max(0, porcentaje));
  return /* @__PURE__ */ jsxs("section", { className: "card overflow-hidden p-0", children: [
    /* @__PURE__ */ jsxs("div", { className: "border-b border-[var(--siu-border-light)] bg-[var(--isipp-bordo-soft)] px-5 py-3", children: [
      /* @__PURE__ */ jsx("h2", { className: "text-base font-bold text-[var(--isipp-bordo-dark)]", children: "Progreso de carrera" }),
      /* @__PURE__ */ jsx("p", { className: "text-sm text-slate-700", children: careerName })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "space-y-4 p-5", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsxs("div", { className: "mb-1 flex justify-between text-sm font-semibold text-slate-800", children: [
          /* @__PURE__ */ jsx("span", { children: "Avance curricular" }),
          /* @__PURE__ */ jsxs("span", { className: "tabular-nums text-[var(--isipp-bordo-deep)]", children: [
            pct,
            "%"
          ] })
        ] }),
        /* @__PURE__ */ jsx(
          "div",
          {
            className: "h-3 w-full overflow-hidden rounded-full bg-slate-200",
            role: "progressbar",
            "aria-valuenow": pct,
            "aria-valuemin": 0,
            "aria-valuemax": 100,
            children: /* @__PURE__ */ jsx(
              "div",
              {
                className: "h-full rounded-full bg-gradient-to-r from-[#582c31] to-[#7a1e2c] transition-[width] duration-500",
                style: { width: `${pct}%` }
              }
            )
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-3 sm:grid-cols-4", children: [
        /* @__PURE__ */ jsx(StatPill, { label: "Materias plan", value: totalMaterias, tone: "slate" }),
        /* @__PURE__ */ jsx(StatPill, { label: "Aprobadas", value: aprobadas, tone: "emerald" }),
        /* @__PURE__ */ jsx(StatPill, { label: "En curso", value: enCurso, tone: "sky" }),
        /* @__PURE__ */ jsx(StatPill, { label: "Pendientes", value: pendientes, tone: "amber" })
      ] }),
      /* @__PURE__ */ jsx("p", { className: "text-xs text-slate-500", children: "El porcentaje se calcula sobre materias del plan de tu carrera en el sistema (ISIPP 1206 · Puerto Piray)." })
    ] })
  ] });
}
function StatPill({
  label,
  value,
  tone
}) {
  const tones = {
    slate: "bg-slate-50 text-slate-800 border-slate-200",
    emerald: "bg-emerald-50 text-emerald-900 border-emerald-200",
    sky: "bg-sky-50 text-sky-900 border-sky-200",
    amber: "bg-amber-50 text-amber-950 border-amber-200"
  };
  return /* @__PURE__ */ jsxs("div", { className: `rounded-lg border px-3 py-2.5 ${tones[tone]}`, children: [
    /* @__PURE__ */ jsx("div", { className: "text-[10px] font-bold uppercase tracking-wide opacity-80", children: label }),
    /* @__PURE__ */ jsx("div", { className: "text-xl font-bold tabular-nums", children: value })
  ] });
}
function useRealtimeGrades(onChange) {
  useEffect(() => {
    if (!onChange) return;
    const ch = supabase.channel("grades_changes").on("postgres_changes", { event: "*", schema: "public", table: "grades" }, () => onChange()).subscribe();
    return () => {
      void supabase.removeChannel(ch);
    };
  }, [onChange]);
}
function useRealtimeFinalExams(onChange) {
  useEffect(() => {
    if (!onChange) return;
    const ch = supabase.channel("final_exams_changes").on("postgres_changes", { event: "*", schema: "public", table: "final_exams" }, () => onChange()).subscribe();
    return () => {
      void supabase.removeChannel(ch);
    };
  }, [onChange]);
}
function DashboardPage() {
  const [student, setStudent] = useState(null);
  const [rows, setRows] = useState([]);
  const [attendancePercent, setAttendancePercent] = useState(0);
  const [gpa, setGpa] = useState(null);
  const [progress, setProgress] = useState({
    total_materias: 0,
    aprobadas: 0,
    en_curso: 0,
    pendientes: 0,
    porcentaje: 0
  });
  const [upcomingExams, setUpcomingExams] = useState([]);
  const loadData = useCallback(async () => {
    const {
      data: {
        user
      }
    } = await supabase.auth.getUser();
    if (!user) return;
    const {
      data: studentData
    } = await supabase.from("students").select("*, program:programs(name)").eq("user_id", user.id).single();
    if (!studentData) return;
    setStudent(studentData);
    const {
      data: gpaData
    } = await supabase.rpc("calcular_promedio_alumno", {
      p_estudiante: studentData.id
    });
    setGpa(typeof gpaData === "number" ? gpaData : null);
    const {
      data: progData
    } = await supabase.rpc("calcular_progreso_carrera", {
      p_estudiante: studentData.id
    });
    const p0 = progData?.[0];
    if (p0) {
      setProgress({
        total_materias: p0.total_materias,
        aprobadas: p0.aprobadas,
        en_curso: p0.en_curso,
        pendientes: p0.pendientes,
        porcentaje: Number(p0.porcentaje)
      });
    }
    const {
      data: enr
    } = await supabase.from("enrollments").select(`
        subject:subjects(name, code),
        grades:grades(final_grade, partial_grade, final_exam_grade, status)
      `).eq("student_id", studentData.id);
    const mapped = enr?.map((e) => {
      const g = Array.isArray(e.grades) ? e.grades[0] : e.grades;
      return {
        subject: e.subject,
        final_grade: g?.final_grade,
        partial_grade: g?.partial_grade,
        final_exam_grade: g?.final_exam_grade,
        status: g?.status
      };
    }) ?? [];
    setRows(mapped);
    const {
      data: enrollmentsWithAttendance
    } = await supabase.from("enrollments").select("attendance:attendance(percentage)").eq("student_id", studentData.id);
    if (enrollmentsWithAttendance?.length) {
      let sum = 0;
      let n = 0;
      for (const e of enrollmentsWithAttendance) {
        const p = e.attendance?.[0]?.percentage;
        if (p != null) {
          sum += p;
          n++;
        }
      }
      setAttendancePercent(n ? Math.round(sum / n) : 0);
    } else {
      setAttendancePercent(0);
    }
    const {
      data: exams
    } = await supabase.from("final_exams").select("id, exam_date, location, subject:subjects(name)").gte("exam_date", (/* @__PURE__ */ new Date()).toISOString()).order("exam_date", {
      ascending: true
    }).limit(6);
    setUpcomingExams(exams ?? []);
  }, []);
  useEffect(() => {
    void loadData();
  }, [loadData]);
  useRealtimeGrades(loadData);
  useRealtimeFinalExams(loadData);
  useRealtimeAnnouncements(loadData);
  if (!student) return null;
  const approved = rows.filter((s) => s.final_grade != null && s.final_grade >= 4 && s.status && ["promoted", "passed", "regular"].includes(s.status)).length;
  return /* @__PURE__ */ jsxs("div", { className: "space-y-8", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex flex-col justify-between gap-2 sm:flex-row sm:items-center", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("h1", { className: "text-2xl font-bold text-gray-900 sm:text-3xl", children: "Panel del alumno" }),
        /* @__PURE__ */ jsxs("p", { className: "text-sm text-gray-500", children: [
          student.first_name,
          " ",
          student.last_name,
          " · ",
          student.program?.name ?? "Carrera"
        ] })
      ] }),
      /* @__PURE__ */ jsx(Link, { to: "/dashboard/roadmap", className: "btn-primary w-fit text-sm", children: "Ver plan de estudios" })
    ] }),
    /* @__PURE__ */ jsx(CareerProgressBar, { careerName: student.program?.name ?? "Tu carrera", porcentaje: progress.porcentaje, aprobadas: progress.aprobadas, enCurso: progress.en_curso, pendientes: progress.pendientes, totalMaterias: progress.total_materias }),
    /* @__PURE__ */ jsxs("div", { className: "grid gap-4 sm:grid-cols-2 lg:grid-cols-4", children: [
      /* @__PURE__ */ jsx(StatCard, { icon: TrendingUp, title: "Promedio general", value: gpa != null ? gpa.toFixed(2) : "—", color: "bg-amber-50 text-amber-900 border border-amber-200/80" }),
      /* @__PURE__ */ jsx(StatCard, { icon: GraduationCap, title: "Materias aprobadas", value: approved, color: "bg-blue-100 text-blue-600" }),
      /* @__PURE__ */ jsx(StatCard, { icon: CalendarCheck, title: "Asistencia prom.", value: `${attendancePercent}%`, color: "bg-green-100 text-green-600" }),
      /* @__PURE__ */ jsx(StatCard, { icon: BookOpen, title: "Inscripciones activas", value: rows.length, color: "bg-purple-100 text-purple-600" })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "card p-5", children: [
      /* @__PURE__ */ jsxs("div", { className: "mb-3 flex items-center gap-2", children: [
        /* @__PURE__ */ jsx(Calendar, { className: "h-5 w-5 text-[var(--siu-blue)]" }),
        /* @__PURE__ */ jsx("h2", { className: "text-lg font-semibold", children: "Próximas mesas de examen" })
      ] }),
      upcomingExams.length === 0 ? /* @__PURE__ */ jsx("p", { className: "text-sm text-slate-600", children: "No hay mesas programadas a futuro." }) : /* @__PURE__ */ jsx("ul", { className: "divide-y divide-slate-100 text-sm", children: upcomingExams.map((ex) => /* @__PURE__ */ jsxs("li", { className: "flex flex-col gap-0.5 py-2 sm:flex-row sm:items-center sm:justify-between", children: [
        /* @__PURE__ */ jsx("span", { className: "font-medium text-slate-900", children: ex.subject?.name ?? "Materia" }),
        /* @__PURE__ */ jsxs("span", { className: "text-slate-600", children: [
          new Date(ex.exam_date).toLocaleString("es-AR", {
            dateStyle: "short",
            timeStyle: "short"
          }),
          " ",
          "· ",
          ex.location || "—"
        ] })
      ] }, ex.id)) }),
      /* @__PURE__ */ jsx(Link, { to: "/dashboard/exams", className: "mt-3 inline-block text-sm font-semibold text-[var(--siu-blue)] hover:underline", children: "Gestionar inscripción a finales" })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "card overflow-hidden p-0", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-2 border-b border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between", children: [
        /* @__PURE__ */ jsx("h2", { className: "text-lg font-semibold", children: "Mis calificaciones recientes" }),
        /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap gap-2", children: [
          /* @__PURE__ */ jsx("button", { type: "button", onClick: () => generateRegularCertificate(student, student.program), className: "btn-primary text-xs px-3 py-1.5", children: "Certificado alumno regular" }),
          /* @__PURE__ */ jsx(Link, { to: "/dashboard/certificates", className: "text-xs font-semibold text-blue-600 hover:underline", children: "Más certificados" })
        ] })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxs("table", { className: "w-full min-w-[520px] text-sm", children: [
        /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsxs("tr", { className: "border-b bg-slate-50 text-left text-gray-600", children: [
          /* @__PURE__ */ jsx("th", { className: "px-4 py-3", children: "Materia" }),
          /* @__PURE__ */ jsx("th", { className: "px-4 py-3", children: "Parcial" }),
          /* @__PURE__ */ jsx("th", { className: "px-4 py-3", children: "Final" }),
          /* @__PURE__ */ jsx("th", { className: "px-4 py-3", children: "Nota" }),
          /* @__PURE__ */ jsx("th", { className: "px-4 py-3", children: "Estado" })
        ] }) }),
        /* @__PURE__ */ jsx("tbody", { children: rows.map((s, i) => {
          const fg = s.final_grade;
          let status = "En curso";
          let color = "bg-slate-100 text-slate-700";
          if (fg != null && fg >= 7) {
            status = "Promocionado";
            color = "bg-green-100 text-green-700";
          } else if (fg != null && fg >= 4) {
            status = "Aprobado";
            color = "bg-blue-100 text-blue-700";
          } else if (fg != null && fg < 4) {
            status = "Desaprobado";
            color = "bg-red-100 text-red-700";
          }
          return /* @__PURE__ */ jsxs("tr", { className: "border-b hover:bg-gray-50", children: [
            /* @__PURE__ */ jsx("td", { className: "px-4 py-3", children: s.subject?.name }),
            /* @__PURE__ */ jsx("td", { className: "px-4 py-3 tabular-nums", children: s.partial_grade ?? "—" }),
            /* @__PURE__ */ jsx("td", { className: "px-4 py-3 tabular-nums", children: s.final_exam_grade ?? "—" }),
            /* @__PURE__ */ jsx("td", { className: "px-4 py-3 tabular-nums", children: fg ?? "—" }),
            /* @__PURE__ */ jsx("td", { className: "px-4 py-3", children: /* @__PURE__ */ jsx("span", { className: `rounded px-2 py-1 text-xs ${color}`, children: status }) })
          ] }, i);
        }) })
      ] }) })
    ] })
  ] });
}
export {
  DashboardPage as component
};
