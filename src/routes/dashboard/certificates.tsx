import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { generateRegularCertificate } from '@/utils/generateRegularCertificate'
import { generateApprovedSubjects } from '@/utils/generateApprovedSubjects'

export const Route = createFileRoute('/dashboard/certificates')({
component: CertificatesPage,
})

function CertificatesPage(){

const [student,setStudent] = useState<any>(null)
const [subjects,setSubjects] = useState<any[]>([])

useEffect(()=>{
load()
},[])

async function load(){

const { data:userData } = await supabase.auth.getUser()

const { data: studentData } = await supabase
  .from('students')
  .select(`
    *,
    program:programs(name)
  `)
  .eq('user_id', userData.user?.id)
  .single()

setStudent(studentData)

if (!studentData?.id) {
  setSubjects([])
  return
}

const { data } = await supabase
  .from('grades')
  .select(`
    final_grade,
    enrollment:enrollments(
      subject:subjects(name)
    )
  `)
  .eq('enrollment.student_id', studentData.id)

const formatted = data?.map((g:any)=>({
  name:g.enrollment?.subject?.name,
  final_grade:g.final_grade
})).filter((x: any) => x.name != null)

setSubjects(formatted || [])

}

if (!student) {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Certificados</h1>
      <p className="text-gray-600 text-sm">No se encontró tu ficha de estudiante. Contactá a secretaría.</p>
    </div>
  )
}

return(

<div className="space-y-6">

  <h1 className="text-2xl font-bold">
    Certificados
  </h1>

  <div className="bg-white p-6 rounded-lg shadow space-y-4">

    <button
      type="button"
      onClick={()=>generateRegularCertificate(student,student.program)}
      className="inline-flex items-center justify-center rounded-sm border border-emerald-900 bg-emerald-700 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-800"
    >
      Descargar Certificado Alumno Regular
    </button>

    <button
      type="button"
      onClick={()=>generateApprovedSubjects(student,subjects)}
      className="btn-primary px-4 py-2"
    >
      Descargar Certificado Materias Aprobadas
    </button>

  </div>

</div>

)
}
