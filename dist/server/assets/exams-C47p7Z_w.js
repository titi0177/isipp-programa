import { jsx, jsxs } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { u as useToast, s as supabase } from "./router-Cgpt3s8a.js";
import { Calendar, MapPin, User } from "lucide-react";
import "@tanstack/react-router";
import "@supabase/supabase-js";
import "chart.js";
function examDateString(exam) {
  return exam.exam_date ?? exam.date ?? "";
}
function ExamsPage() {
  const [exams, setExams] = useState([]);
  const [student, setStudent] = useState(null);
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const {
    showToast
  } = useToast();
  useEffect(() => {
    loadData();
  }, []);
  async function loadData() {
    try {
      setLoading(true);
      const {
        data: {
          user
        }
      } = await supabase.auth.getUser();
      if (!user) return;
      const {
        data: studentData,
        error: studentError
      } = await supabase.from("students").select("*").eq("user_id", user.id).single();
      if (studentError || !studentData) {
        showToast("No se encontró el estudiante", "error");
        return;
      }
      setStudent(studentData);
      const {
        data: examsData,
        error: examsError
      } = await supabase.from("final_exams").select(`
          *,
          subject:subjects(name),
          professor:professors(name)
        `).order("exam_date", {
        ascending: true
      });
      if (examsError) {
        showToast(examsError.message, "error");
        setExams([]);
      } else {
        setExams(examsData || []);
      }
      const {
        data: regData,
        error: regError
      } = await supabase.from("exam_enrollments").select("*").eq("student_id", studentData.id);
      if (regError) {
        showToast(regError.message, "error");
        setRegistrations([]);
      } else {
        setRegistrations(regData || []);
      }
    } catch {
      showToast("Error cargando mesas", "error");
    } finally {
      setLoading(false);
    }
  }
  function isRegistered(examId) {
    return registrations.some((r) => r.final_exam_id === examId);
  }
  async function seatsTaken(examId) {
    const {
      count
    } = await supabase.from("exam_enrollments").select("*", {
      count: "exact",
      head: true
    }).eq("final_exam_id", examId);
    return count || 0;
  }
  function examClosed(dateStr) {
    if (!dateStr) return true;
    const exam = /* @__PURE__ */ new Date(dateStr + (dateStr.length <= 10 ? "T12:00:00" : ""));
    const now = /* @__PURE__ */ new Date();
    const diff = exam.getTime() - now.getTime();
    const hours = diff / (1e3 * 60 * 60);
    return hours < 24;
  }
  async function registerExam(exam) {
    if (!student) return;
    if (isRegistered(exam.id)) {
      showToast("Ya estás inscripto", "info");
      return;
    }
    const when = examDateString(exam);
    if (examClosed(when)) {
      showToast("La inscripción cierra 24 hs antes del examen", "error");
      return;
    }
    const maxStudents = exam.max_students;
    if (maxStudents != null && maxStudents > 0) {
      const taken = await seatsTaken(exam.id);
      if (taken >= maxStudents) {
        showToast("No hay cupos disponibles", "error");
        return;
      }
    }
    const {
      error
    } = await supabase.from("exam_enrollments").insert({
      final_exam_id: exam.id,
      student_id: student.id
    });
    if (error) {
      showToast(error.message, "error");
      return;
    }
    showToast("Inscripción realizada");
    loadData();
  }
  async function cancelRegistration(examId) {
    if (!student) return;
    const {
      error
    } = await supabase.from("exam_enrollments").delete().eq("final_exam_id", examId).eq("student_id", student.id);
    if (error) {
      showToast("Error cancelando inscripción", "error");
      return;
    }
    showToast("Inscripción cancelada");
    loadData();
  }
  if (loading) {
    return /* @__PURE__ */ jsx("p", { children: "Cargando mesas..." });
  }
  return /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsx("h1", { className: "text-2xl font-bold", children: "Mesas de Examen" }),
    exams.length === 0 && /* @__PURE__ */ jsx("p", { children: "No hay mesas disponibles" }),
    /* @__PURE__ */ jsx("div", { className: "space-y-4", children: exams.map((exam) => {
      const registered = isRegistered(exam.id);
      const when = examDateString(exam);
      const closed = examClosed(when);
      return /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-lg shadow p-6 flex justify-between items-center", children: [
        /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsx("p", { className: "font-semibold text-lg", children: exam.subject?.name }),
          /* @__PURE__ */ jsxs("div", { className: "text-sm text-gray-500 flex gap-4", children: [
            /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-1", children: [
              /* @__PURE__ */ jsx(Calendar, { size: 14 }),
              when || "—"
            ] }),
            /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-1", children: [
              /* @__PURE__ */ jsx(MapPin, { size: 14 }),
              exam.location
            ] })
          ] }),
          /* @__PURE__ */ jsxs("p", { className: "text-sm text-gray-500 flex items-center gap-1", children: [
            /* @__PURE__ */ jsx(User, { size: 14 }),
            exam.professor?.name
          ] })
        ] }),
        registered ? /* @__PURE__ */ jsx("button", { type: "button", onClick: () => cancelRegistration(exam.id), className: "btn-secondary px-4 py-2 text-slate-700", children: "Cancelar inscripción" }) : closed ? /* @__PURE__ */ jsx("span", { className: "text-red-600 font-semibold", children: "Inscripción cerrada" }) : /* @__PURE__ */ jsx("button", { type: "button", onClick: () => registerExam(exam), className: "btn-primary px-4 py-2", children: "Inscribirse" })
      ] }, exam.id);
    }) })
  ] });
}
export {
  ExamsPage as component
};
