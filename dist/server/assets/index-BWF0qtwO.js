import { jsxs, jsx } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { s as supabase } from "./router-Cgpt3s8a.js";
import { S as StatCard } from "./StatCard-fdzWNmjS.js";
import { Users, BookOpen, GraduationCap, UserCheck, TrendingUp, Award } from "lucide-react";
import { Bar, Doughnut } from "react-chartjs-2";
import "@tanstack/react-router";
import "@supabase/supabase-js";
import "chart.js";
function AdminDashboard() {
  const [stats, setStats] = useState({});
  const [gradeData, setGradeData] = useState(null);
  const [statusData, setStatusData] = useState(null);
  const [topSubjects, setTopSubjects] = useState([]);
  const [recentEnrollments, setRecentEnrollments] = useState([]);
  const [recentGrades, setRecentGrades] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    loadData();
  }, []);
  async function loadData() {
    const [{
      count: students
    }, {
      count: subjects
    }, {
      count: programs
    }, {
      count: professors
    }, {
      count: enrollments
    }, {
      data: grades
    }] = await Promise.all([supabase.from("students").select("*", {
      count: "exact",
      head: true
    }), supabase.from("subjects").select("*", {
      count: "exact",
      head: true
    }), supabase.from("programs").select("*", {
      count: "exact",
      head: true
    }), supabase.from("professors").select("*", {
      count: "exact",
      head: true
    }), supabase.from("enrollments").select("*", {
      count: "exact",
      head: true
    }), supabase.from("grades").select("final_grade,status")]);
    setStats({
      students: students || 0,
      subjects: subjects || 0,
      programs: programs || 0,
      professors: professors || 0,
      enrollments: enrollments || 0
    });
    let avg = 0;
    if (grades?.length) {
      avg = grades.reduce((a, b) => a + (b.final_grade || 0), 0) / grades.length;
    }
    setStats((s) => ({
      ...s,
      avg: avg.toFixed(2)
    }));
    if (grades) {
      const statusCounts = {};
      grades.forEach((g) => {
        statusCounts[g.status] = (statusCounts[g.status] || 0) + 1;
      });
      setStatusData({
        labels: ["Promocionado", "Aprobado", "Desaprobado", "En Curso"],
        datasets: [{
          data: [statusCounts["promoted"] || 0, statusCounts["passed"] || 0, statusCounts["failed"] || 0, statusCounts["in_progress"] || 0],
          backgroundColor: ["#16a34a", "#2563eb", "#dc2626", "#d97706"]
        }]
      });
    }
    if (grades) {
      const dist = Array(10).fill(0);
      grades.forEach((g) => {
        if (g.final_grade) {
          const i = Math.min(Math.floor(g.final_grade) - 1, 9);
          if (i >= 0) dist[i]++;
        }
      });
      setGradeData({
        labels: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"],
        datasets: [{
          label: "Cantidad de alumnos",
          data: dist,
          backgroundColor: "#582c31",
          borderRadius: 4
        }]
      });
    }
    const {
      data: top
    } = await supabase.from("enrollments").select(`
subject:subjects(name)
`);
    limit(50);
    if (top) {
      const count = {};
      top.forEach((e) => {
        const n = e.subject?.name;
        count[n] = (count[n] || 0) + 1;
      });
      const sorted = Object.entries(count).sort((a, b) => b[1] - a[1]).slice(0, 5);
      setTopSubjects(sorted);
    }
    const {
      data: recent
    } = await supabase.from("enrollments").select(`
id,
created_at,
student:students(first_name,last_name),
subject:subjects(name)
`).order("created_at", {
      ascending: false
    }).limit(5);
    setRecentEnrollments(recent || []);
    const {
      data: recentG
    } = await supabase.from("grades").select(`
final_grade,
student:enrollments(
student:students(first_name,last_name)
),
subject:enrollments(
subject:subjects(name)
)
`).order("created_at", {
      ascending: false
    }).limit(5);
    setRecentGrades(recentG || []);
    setLoading(false);
  }
  return /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx("h1", { className: "siu-page-title text-2xl", children: "Panel de administración" }),
      /* @__PURE__ */ jsx("p", { className: "siu-page-subtitle mt-1", children: "Resumen operativo del sistema (estilo autogestión)" })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 lg:grid-cols-6 gap-4", children: [
      /* @__PURE__ */ jsx(StatCard, { title: "Estudiantes", value: stats.students, icon: /* @__PURE__ */ jsx(Users, { size: 22 }), color: "bordeaux" }),
      /* @__PURE__ */ jsx(StatCard, { title: "Materias", value: stats.subjects, icon: /* @__PURE__ */ jsx(BookOpen, { size: 22 }), color: "blue" }),
      /* @__PURE__ */ jsx(StatCard, { title: "Carreras", value: stats.programs, icon: /* @__PURE__ */ jsx(GraduationCap, { size: 22 }), color: "green" }),
      /* @__PURE__ */ jsx(StatCard, { title: "Profesores", value: stats.professors, icon: /* @__PURE__ */ jsx(UserCheck, { size: 22 }), color: "orange" }),
      /* @__PURE__ */ jsx(StatCard, { title: "Inscripciones", value: stats.enrollments, icon: /* @__PURE__ */ jsx(TrendingUp, { size: 22 }), color: "purple" }),
      /* @__PURE__ */ jsx(StatCard, { title: "Promedio", value: stats.avg, icon: /* @__PURE__ */ jsx(Award, { size: 22 }), color: "bordeaux" })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-6", children: [
      /* @__PURE__ */ jsxs("div", { className: "card", children: [
        /* @__PURE__ */ jsx("h2", { className: "font-semibold mb-4", children: "Distribución de Notas" }),
        gradeData ? /* @__PURE__ */ jsx(Bar, { data: gradeData }) : /* @__PURE__ */ jsx("p", { className: "text-gray-400", children: "Sin datos" })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "card", children: [
        /* @__PURE__ */ jsx("h2", { className: "font-semibold mb-4", children: "Estado Académico" }),
        statusData ? /* @__PURE__ */ jsx(Doughnut, { data: statusData }) : /* @__PURE__ */ jsx("p", { className: "text-gray-400", children: "Sin datos" })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "card", children: [
      /* @__PURE__ */ jsx("h2", { className: "font-semibold mb-4", children: "Materias con más alumnos" }),
      /* @__PURE__ */ jsx("ul", { className: "space-y-2", children: topSubjects.map((s, i) => /* @__PURE__ */ jsxs("li", { className: "flex justify-between", children: [
        /* @__PURE__ */ jsx("span", { children: s[0] }),
        /* @__PURE__ */ jsx("span", { className: "font-semibold", children: s[1] })
      ] }, i)) })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "card", children: [
      /* @__PURE__ */ jsx("h2", { className: "font-semibold mb-4", children: "Últimas Inscripciones" }),
      /* @__PURE__ */ jsx("ul", { className: "space-y-2", children: recentEnrollments.map((e) => /* @__PURE__ */ jsxs("li", { children: [
        e.student?.first_name,
        " ",
        e.student?.last_name,
        " → ",
        e.subject?.name
      ] }, e.id)) })
    ] })
  ] });
}
export {
  AdminDashboard as component
};
