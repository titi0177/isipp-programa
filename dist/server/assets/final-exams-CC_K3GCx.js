import { jsxs, jsx } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { u as useToast, s as supabase } from "./router-Cgpt3s8a.js";
import { D as DataTable, M as Modal } from "./Modal-DTmqZnz1.js";
import { Plus, Pencil, Trash2 } from "lucide-react";
import "@tanstack/react-router";
import "@supabase/supabase-js";
import "chart.js";
function FinalExamsPage() {
  const [exams, setExams] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [professors, setProfessors] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState({});
  const {
    showToast
  } = useToast();
  useEffect(() => {
    load();
  }, []);
  async function load() {
    try {
      const examsQuery = supabase.from("final_exams").select(`
          *,
          subject:subjects(name, code),
          professor:professors(name)
        `).order("exam_date", {
        ascending: false
      });
      const subjectsQuery = supabase.from("subjects").select("id, name, code").order("name");
      const professorsQuery = supabase.from("professors").select("id, name").order("name");
      const [{
        data: examsData,
        error: examsError
      }, {
        data: subjectsData
      }, {
        data: professorsData
      }] = await Promise.all([examsQuery, subjectsQuery, professorsQuery]);
      if (examsError) {
        console.error(examsError);
        showToast(examsError.message, "error");
        return;
      }
      setExams(examsData || []);
      setSubjects(subjectsData || []);
      setProfessors(professorsData || []);
    } catch (err) {
      console.error(err);
    }
  }
  const handleSave = async (e) => {
    e.preventDefault();
    const {
      id,
      created_at,
      subject,
      professor,
      date,
      exam_date,
      ...rest
    } = editing;
    const when = exam_date ?? date;
    const payload = {
      ...rest,
      exam_date: when
    };
    delete payload.date;
    let res;
    if (id) {
      res = await supabase.from("final_exams").update(payload).eq("id", id);
    } else {
      res = await supabase.from("final_exams").insert(payload);
    }
    if (res.error) {
      console.error(res.error);
      showToast(res.error.message, "error");
      return;
    }
    showToast("Mesa de examen guardada.");
    setModalOpen(false);
    setEditing({});
    await load();
  };
  const handleDelete = async (id) => {
    if (!confirm("¿Eliminar esta mesa de examen?")) return;
    const {
      error
    } = await supabase.from("final_exams").delete().eq("id", id);
    if (error) {
      showToast(error.message, "error");
      return;
    }
    showToast("Mesa eliminada.", "info");
    load();
  };
  return /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsx("h1", { className: "text-2xl font-bold text-gray-900", children: "Exámenes Finales" }),
      /* @__PURE__ */ jsxs("button", { onClick: () => {
        setEditing({
          location: ""
        });
        setModalOpen(true);
      }, className: "btn-primary flex items-center gap-2", children: [
        /* @__PURE__ */ jsx(Plus, { size: 16 }),
        "Nueva Mesa"
      ] })
    ] }),
    /* @__PURE__ */ jsx(DataTable, { columns: [{
      key: "subject",
      label: "Materia",
      render: (r) => r.subject?.name
    }, {
      key: "code",
      label: "Código",
      render: (r) => r.subject?.code
    }, {
      key: "exam_date",
      label: "Fecha",
      render: (r) => {
        const d = r.exam_date ?? r.date;
        return d ? new Date(d).toLocaleDateString("es-AR") : "-";
      }
    }, {
      key: "professor",
      label: "Profesor",
      render: (r) => r.professor?.name || "-"
    }, {
      key: "location",
      label: "Lugar"
    }], data: exams, actions: (row) => /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 justify-end", children: [
      /* @__PURE__ */ jsx("button", { onClick: () => {
        setEditing(row);
        setModalOpen(true);
      }, className: "siu-table-action", children: /* @__PURE__ */ jsx(Pencil, { size: 15 }) }),
      /* @__PURE__ */ jsx("button", { onClick: () => handleDelete(row.id), className: "p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg", children: /* @__PURE__ */ jsx(Trash2, { size: 15 }) })
    ] }) }),
    /* @__PURE__ */ jsx(Modal, { open: modalOpen, onClose: () => setModalOpen(false), title: editing.id ? "Editar Mesa" : "Nueva Mesa de Examen", children: /* @__PURE__ */ jsxs("form", { onSubmit: handleSave, className: "space-y-4", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("label", { className: "form-label", children: "Materia *" }),
        /* @__PURE__ */ jsxs("select", { className: "form-input", required: true, value: editing.subject_id || "", onChange: (e) => setEditing((p) => ({
          ...p,
          subject_id: e.target.value
        })), children: [
          /* @__PURE__ */ jsx("option", { value: "", children: "Seleccionar..." }),
          subjects.map((s) => /* @__PURE__ */ jsxs("option", { value: s.id, children: [
            s.name,
            " (",
            s.code,
            ")"
          ] }, s.id))
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "form-label", children: "Fecha *" }),
          /* @__PURE__ */ jsx("input", { type: "date", className: "form-input", required: true, value: editing.date ?? editing.exam_date ?? "", onChange: (e) => setEditing((p) => ({
            ...p,
            date: e.target.value,
            exam_date: e.target.value
          })) })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "form-label", children: "Lugar *" }),
          /* @__PURE__ */ jsx("input", { className: "form-input", required: true, value: editing.location || "", onChange: (e) => setEditing((p) => ({
            ...p,
            location: e.target.value
          })) })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("label", { className: "form-label", children: "Profesor" }),
        /* @__PURE__ */ jsxs("select", { className: "form-input", value: editing.professor_id || "", onChange: (e) => setEditing((p) => ({
          ...p,
          professor_id: e.target.value
        })), children: [
          /* @__PURE__ */ jsx("option", { value: "", children: "Sin asignar" }),
          professors.map((p) => /* @__PURE__ */ jsx("option", { value: p.id, children: p.name }, p.id))
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex gap-3 pt-2", children: [
        /* @__PURE__ */ jsx("button", { type: "submit", className: "btn-primary flex-1", children: "Guardar" }),
        /* @__PURE__ */ jsx("button", { type: "button", onClick: () => setModalOpen(false), className: "btn-secondary flex-1", children: "Cancelar" })
      ] })
    ] }) })
  ] });
}
export {
  FinalExamsPage as component
};
