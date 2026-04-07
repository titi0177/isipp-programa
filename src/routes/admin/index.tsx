import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { StatCard } from '@/components/StatCard'
import { Users, BookOpen, GraduationCap, UserCheck, TrendingUp } from 'lucide-react'
import { Bar, Doughnut } from 'react-chartjs-2'
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement,
  ArcElement, Title, Tooltip, Legend
} from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend)

export const Route = createFileRoute('/admin/')({
  component: AdminDashboard,
})

function AdminDashboard() {
  const [stats, setStats] = useState({ students: 0, subjects: 0, programs: 0, professors: 0, enrollments: 0 })
  const [gradeData, setGradeData] = useState<any>(null)
  const [statusData, setStatusData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => { loadData() }, [])

  async function loadData() {
    const [
      { count: students },
      { count: subjects },
      { count: programs },
      { count: professors },
      { count: enrollments },
      { data: grades },
    ] = await Promise.all([
      supabase.from('students').select('*', { count: 'exact', head: true }),
      supabase.from('subjects').select('*', { count: 'exact', head: true }),
      supabase.from('programs').select('*', { count: 'exact', head: true }),
      supabase.from('professors').select('*', { count: 'exact', head: true }),
      supabase.from('enrollments').select('*', { count: 'exact', head: true }),
      supabase.from('grades').select('status, final_grade'),
    ])

    setStats({
      students: students || 0,
      subjects: subjects || 0,
      programs: programs || 0,
      professors: professors || 0,
      enrollments: enrollments || 0,
    })

    if (grades) {
      const statusCounts: Record<string, number> = {}
      grades.forEach((g: any) => { statusCounts[g.status] = (statusCounts[g.status] || 0) + 1 })
      setStatusData({
        labels: ['Promocionado', 'Regular', 'En Curso', 'Libre', 'Desaprobado', 'Aprobado'],
        datasets: [{
          data: [
            statusCounts['promoted'] || 0,
            statusCounts['regular'] || 0,
            statusCounts['in_progress'] || 0,
            statusCounts['free'] || 0,
            statusCounts['failed'] || 0,
            statusCounts['passed'] || 0,
          ],
          backgroundColor: ['#16a34a', '#2563eb', '#d97706', '#9333ea', '#dc2626', '#059669'],
        }],
      })

      const finalGrades = grades.filter((g: any) => g.final_grade != null).map((g: any) => g.final_grade)
      const dist = Array(10).fill(0)
      finalGrades.forEach((g: number) => { const idx = Math.min(Math.floor(g) - 1, 9); if (idx >= 0) dist[idx]++ })
      setGradeData({
        labels: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'],
        datasets: [{
          label: 'Cantidad de alumnos',
          data: dist,
          backgroundColor: '#7A1E2C',
          borderRadius: 4,
        }],
      })
    }

    setLoading(false)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Panel de Administración</h1>
        <p className="text-gray-500 text-sm mt-1">Resumen del sistema académico ISIPP</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard title="Estudiantes" value={stats.students} icon={<Users size={22} />} color="bordeaux" />
        <StatCard title="Materias" value={stats.subjects} icon={<BookOpen size={22} />} color="blue" />
        <StatCard title="Carreras" value={stats.programs} icon={<GraduationCap size={22} />} color="green" />
        <StatCard title="Profesores" value={stats.professors} icon={<UserCheck size={22} />} color="orange" />
        <StatCard title="Inscripciones" value={stats.enrollments} icon={<TrendingUp size={22} />} color="purple" />
      </div>

      {!loading && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card">
            <h2 className="text-base font-semibold text-gray-900 mb-4">Distribución de Notas Finales</h2>
            {gradeData ? <Bar data={gradeData} options={{ responsive: true, plugins: { legend: { display: false } } }} /> : <p className="text-gray-400 text-sm text-center py-8">Sin datos</p>}
          </div>
          <div className="card">
            <h2 className="text-base font-semibold text-gray-900 mb-4">Estado Académico de Alumnos</h2>
            {statusData ? <Doughnut data={statusData} options={{ responsive: true, plugins: { legend: { position: 'bottom' } } }} /> : <p className="text-gray-400 text-sm text-center py-8">Sin datos</p>}
          </div>
        </div>
      )}
    </div>
  )
}
