import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useToast } from '@/components/Toast'
import { Upload } from 'lucide-react'

export const Route = createFileRoute('/professor/materials')({
  component: ProfessorMaterialsPage,
})

function ProfessorMaterialsPage() {
  const [professorId, setProfessorId] = useState<string | null>(null)
  const [subjects, setSubjects] = useState<any[]>([])
  const [subjectId, setSubjectId] = useState('')
  const [title, setTitle] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [list, setList] = useState<any[]>([])
  const { showToast } = useToast()

  useEffect(() => {
    void init()
  }, [])

  async function init() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data: prof } = await supabase.from('professors').select('id').eq('user_id', user.id).maybeSingle()
    if (!prof?.id) {
      setProfessorId(null)
      return
    }
    setProfessorId(prof.id)
    const { data: subs } = await supabase.from('subjects').select('id, name, code').eq('professor_id', prof.id).order('name')
    setSubjects(subs ?? [])
    await loadMaterials(prof.id)
  }

  async function loadMaterials(pid: string) {
    const { data } = await supabase
      .from('materials')
      .select('*, subject:subjects(name, code), files:material_files(file_name, storage_path)')
      .eq('professor_id', pid)
      .order('created_at', { ascending: false })
    setList(data ?? [])
  }

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault()
    if (!professorId || !subjectId || !title.trim() || !file) {
      showToast('Completá materia, título y archivo.', 'error')
      return
    }

    const path = `${professorId}/${subjectId}/${Date.now()}_${file.name.replace(/\s+/g, '_')}`

    const { error: upErr } = await supabase.storage.from('materials').upload(path, file, {
      cacheControl: '3600',
      upsert: false,
    })
    if (upErr) {
      showToast(upErr.message, 'error')
      return
    }

    const { data: mat, error: mErr } = await supabase
      .from('materials')
      .insert({
        subject_id: subjectId,
        professor_id: professorId,
        title: title.trim(),
        description: null,
      })
      .select('id')
      .single()

    if (mErr || !mat) {
      showToast(mErr?.message ?? 'Error creando material', 'error')
      return
    }

    const { error: fErr } = await supabase.from('material_files').insert({
      material_id: mat.id,
      storage_path: path,
      file_name: file.name,
      mime_type: file.type || null,
      bytes: file.size,
    })

    if (fErr) {
      showToast(fErr.message, 'error')
      return
    }

    showToast('Material publicado.')
    setTitle('')
    setFile(null)
    void loadMaterials(professorId)
  }

  if (!professorId) {
    return (
      <div className="card p-6 text-slate-600">
        No hay docente vinculado a tu usuario. Pedí a secretaría que asocien tu cuenta en la tabla de docentes.
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Materiales educativos</h1>
        <p className="text-sm text-slate-600">Subí archivos al bucket seguro de Supabase Storage (carpeta materials).</p>
      </div>

      <form onSubmit={handleUpload} className="card space-y-4 p-5">
        <h2 className="font-semibold">Nuevo material</h2>
        <div>
          <label className="form-label">Asignatura</label>
          <select className="form-input w-full max-w-md" value={subjectId} onChange={(e) => setSubjectId(e.target.value)} required>
            <option value="">Seleccionar…</option>
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>
                {s.code} — {s.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="form-label">Título</label>
          <input className="form-input max-w-md" value={title} onChange={(e) => setTitle(e.target.value)} required />
        </div>
        <div>
          <label className="form-label">Archivo</label>
          <input
            type="file"
            className="form-input max-w-md"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            required
          />
        </div>
        <button type="submit" className="btn-primary inline-flex items-center gap-2">
          <Upload size={18} />
          Subir
        </button>
      </form>

      <div className="card overflow-hidden p-0">
        <div className="border-b px-5 py-3 font-semibold">Publicados</div>
        <ul className="divide-y">
          {list.map((m) => (
            <li key={m.id} className="px-5 py-3 text-sm">
              <div className="font-semibold">{m.title}</div>
              <div className="text-slate-600">
                {m.subject?.code} · {m.subject?.name}
              </div>
              <div className="mt-1 text-xs text-slate-500">
                {(m.files as any[])?.map((f: any) => f.file_name).join(', ') || 'Sin archivos'}
              </div>
            </li>
          ))}
        </ul>
        {list.length === 0 && <p className="p-6 text-slate-600">Aún no cargaste materiales.</p>}
      </div>
    </div>
  )
}
