import { jsx, jsxs } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { u as useToast, s as supabase } from "./router-Cgpt3s8a.js";
import { Upload } from "lucide-react";
import "@tanstack/react-router";
import "@supabase/supabase-js";
import "chart.js";
function ProfessorMaterialsPage() {
  const [professorId, setProfessorId] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [subjectId, setSubjectId] = useState("");
  const [title, setTitle] = useState("");
  const [file, setFile] = useState(null);
  const [list, setList] = useState([]);
  const {
    showToast
  } = useToast();
  useEffect(() => {
    void init();
  }, []);
  async function init() {
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
      setProfessorId(null);
      return;
    }
    setProfessorId(prof.id);
    const {
      data: subs
    } = await supabase.from("subjects").select("id, name, code").eq("professor_id", prof.id).order("name");
    setSubjects(subs ?? []);
    await loadMaterials(prof.id);
  }
  async function loadMaterials(pid) {
    const {
      data
    } = await supabase.from("materials").select("*, subject:subjects(name, code), files:material_files(file_name, storage_path)").eq("professor_id", pid).order("created_at", {
      ascending: false
    });
    setList(data ?? []);
  }
  async function handleUpload(e) {
    e.preventDefault();
    if (!professorId || !subjectId || !title.trim() || !file) {
      showToast("Completá materia, título y archivo.", "error");
      return;
    }
    const path = `${professorId}/${subjectId}/${Date.now()}_${file.name.replace(/\s+/g, "_")}`;
    const {
      error: upErr
    } = await supabase.storage.from("materials").upload(path, file, {
      cacheControl: "3600",
      upsert: false
    });
    if (upErr) {
      showToast(upErr.message, "error");
      return;
    }
    const {
      data: mat,
      error: mErr
    } = await supabase.from("materials").insert({
      subject_id: subjectId,
      professor_id: professorId,
      title: title.trim(),
      description: null
    }).select("id").single();
    if (mErr || !mat) {
      showToast(mErr?.message ?? "Error creando material", "error");
      return;
    }
    const {
      error: fErr
    } = await supabase.from("material_files").insert({
      material_id: mat.id,
      storage_path: path,
      file_name: file.name,
      mime_type: file.type || null,
      bytes: file.size
    });
    if (fErr) {
      showToast(fErr.message, "error");
      return;
    }
    showToast("Material publicado.");
    setTitle("");
    setFile(null);
    void loadMaterials(professorId);
  }
  if (!professorId) {
    return /* @__PURE__ */ jsx("div", { className: "card p-6 text-slate-600", children: "No hay docente vinculado a tu usuario. Pedí a secretaría que asocien tu cuenta en la tabla de docentes." });
  }
  return /* @__PURE__ */ jsxs("div", { className: "space-y-8", children: [
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx("h1", { className: "text-2xl font-bold", children: "Materiales educativos" }),
      /* @__PURE__ */ jsx("p", { className: "text-sm text-slate-600", children: "Subí archivos al bucket seguro de Supabase Storage (carpeta materials)." })
    ] }),
    /* @__PURE__ */ jsxs("form", { onSubmit: handleUpload, className: "card space-y-4 p-5", children: [
      /* @__PURE__ */ jsx("h2", { className: "font-semibold", children: "Nuevo material" }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("label", { className: "form-label", children: "Asignatura" }),
        /* @__PURE__ */ jsxs("select", { className: "form-input w-full max-w-md", value: subjectId, onChange: (e) => setSubjectId(e.target.value), required: true, children: [
          /* @__PURE__ */ jsx("option", { value: "", children: "Seleccionar…" }),
          subjects.map((s) => /* @__PURE__ */ jsxs("option", { value: s.id, children: [
            s.code,
            " — ",
            s.name
          ] }, s.id))
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("label", { className: "form-label", children: "Título" }),
        /* @__PURE__ */ jsx("input", { className: "form-input max-w-md", value: title, onChange: (e) => setTitle(e.target.value), required: true })
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("label", { className: "form-label", children: "Archivo" }),
        /* @__PURE__ */ jsx("input", { type: "file", className: "form-input max-w-md", onChange: (e) => setFile(e.target.files?.[0] ?? null), required: true })
      ] }),
      /* @__PURE__ */ jsxs("button", { type: "submit", className: "btn-primary inline-flex items-center gap-2", children: [
        /* @__PURE__ */ jsx(Upload, { size: 18 }),
        "Subir"
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "card overflow-hidden p-0", children: [
      /* @__PURE__ */ jsx("div", { className: "border-b px-5 py-3 font-semibold", children: "Publicados" }),
      /* @__PURE__ */ jsx("ul", { className: "divide-y", children: list.map((m) => /* @__PURE__ */ jsxs("li", { className: "px-5 py-3 text-sm", children: [
        /* @__PURE__ */ jsx("div", { className: "font-semibold", children: m.title }),
        /* @__PURE__ */ jsxs("div", { className: "text-slate-600", children: [
          m.subject?.code,
          " · ",
          m.subject?.name
        ] }),
        /* @__PURE__ */ jsx("div", { className: "mt-1 text-xs text-slate-500", children: m.files?.map((f) => f.file_name).join(", ") || "Sin archivos" })
      ] }, m.id)) }),
      list.length === 0 && /* @__PURE__ */ jsx("p", { className: "p-6 text-slate-600", children: "Aún no cargaste materiales." })
    ] })
  ] });
}
export {
  ProfessorMaterialsPage as component
};
