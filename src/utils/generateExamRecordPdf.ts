import jsPDF from 'jspdf'

export type ExamRecordStudentRow = {
  legajo: string
  nombre: string
  nota: string | number | null
}

export function generateExamRecordPdf(params: {
  title: string
  institution: string
  career?: string
  subjectName: string
  subjectCode?: string
  examDate: string
  professorName?: string
  students: ExamRecordStudentRow[]
}) {
  const doc = new jsPDF()
  let y = 22

  doc.setFontSize(16)
  doc.text(params.institution, 105, y, { align: 'center' })
  y += 10
  doc.setFontSize(14)
  doc.text(params.title, 105, y, { align: 'center' })
  y += 12
  doc.setFontSize(10)
  doc.text(`Materia: ${params.subjectName}${params.subjectCode ? ` (${params.subjectCode})` : ''}`, 14, y)
  y += 6
  if (params.career) {
    doc.text(`Carrera / plan: ${params.career}`, 14, y)
    y += 6
  }
  doc.text(`Fecha y hora: ${params.examDate}`, 14, y)
  y += 6
  doc.text(`Docente responsable: ${params.professorName ?? '—'}`, 14, y)
  y += 10

  doc.setFontSize(9)
  doc.text('Alumnos inscriptos y calificación final registrada', 14, y)
  y += 6

  doc.setFillColor(240, 240, 240)
  doc.rect(14, y - 4, 182, 7, 'F')
  doc.text('Legajo', 16, y)
  doc.text('Apellido y nombre', 40, y)
  doc.text('Nota final', 170, y)
  y += 8

  for (const s of params.students) {
    if (y > 270) {
      doc.addPage()
      y = 20
    }
    doc.text(String(s.legajo), 16, y)
    const name = doc.splitTextToSize(s.nombre, 120)
    doc.text(name, 40, y)
    doc.text(s.nota != null && s.nota !== '' ? String(s.nota) : '—', 170, y)
    y += Math.max(6, name.length * 5)
  }

  y += 14
  doc.setFontSize(9)
  doc.text('Firma del docente: _______________________________', 14, y)
  y += 10
  doc.text('Firma y sello institucional: _______________________________', 14, y)
  y += 10
  doc.setFontSize(8)
  doc.text(
    'Documento generado desde el sistema académico ISIPP. Validez sujeta a registro en Secretaría.',
    14,
    y,
    { maxWidth: 180 },
  )

  doc.save(`acta_examen_${params.subjectCode ?? 'materia'}.pdf`)
}
