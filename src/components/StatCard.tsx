interface StatCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon: React.ReactNode
  color?: 'bordeaux' | 'green' | 'blue' | 'orange' | 'purple'
}

const colorMap = {
  bordeaux: { bg: 'bg-[#7A1E2C]', light: 'bg-red-50', text: 'text-[#7A1E2C]' },
  green: { bg: 'bg-green-600', light: 'bg-green-50', text: 'text-green-700' },
  blue: { bg: 'bg-blue-600', light: 'bg-blue-50', text: 'text-blue-700' },
  orange: { bg: 'bg-orange-500', light: 'bg-orange-50', text: 'text-orange-700' },
  purple: { bg: 'bg-purple-600', light: 'bg-purple-50', text: 'text-purple-700' },
}

export function StatCard({ title, value, subtitle, icon, color = 'bordeaux' }: StatCardProps) {
  const c = colorMap[color]
  return (
    <div className="card hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500 font-medium">{title}</p>
          <p className={`text-3xl font-bold mt-1 ${c.text}`}>{value}</p>
          {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
        </div>
        <div className={`${c.light} p-3 rounded-xl`}>
          <div className={c.text}>{icon}</div>
        </div>
      </div>
    </div>
  )
}
