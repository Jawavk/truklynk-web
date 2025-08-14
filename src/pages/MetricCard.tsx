import type React from "react"
import { ArrowUpRight } from "lucide-react"

interface MetricCardProps {
  title: string
  value: string | number
  icon: React.ReactNode
  trend: number
  color: "indigo" | "emerald" | "amber" | "purple" | "rose"
  onClick?: () => void 
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, icon, trend, color, onClick }) => {
  const getColorClasses = (color: string): string => {
    switch (color) {
      case "indigo":
        return "bg-indigo-500/10 text-indigo-400 border-indigo-500/20"
      case "emerald":
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
      case "amber":
        return "bg-amber-500/10 text-amber-400 border-amber-500/20"
      case "purple":
        return "bg-purple-500/10 text-purple-400 border-purple-500/20"
      case "rose":
        return "bg-rose-500/10 text-rose-400 border-rose-500/20"
      default:
        return "bg-slate-500/10 text-slate-400 border-slate-500/20"
    }
  }

  return (
    <div
      className={`bg-slate-900 border border-slate-800 rounded-lg hover:border-slate-700 transition-all duration-200 cursor-pointer ${onClick ? 'hover:bg-slate-800/30' : ''}`}
      onClick={onClick}
    >      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${getColorClasses(color)}`}>
            {icon}
          </div>
          <div
            className={`px-2 py-1 rounded-md text-xs font-medium flex items-center ${
              trend > 0 ? "bg-emerald-500/10 text-emerald-400" : "bg-rose-500/10 text-rose-400"
            }`}
          >
            {trend > 0 ? (
              <ArrowUpRight className="w-3 h-3 mr-1" />
            ) : (
              <ArrowUpRight className="w-3 h-3 mr-1 rotate-90" />
            )}
            {Math.abs(trend)}%
          </div>
        </div>
        <div>
          <p className="text-sm font-medium text-slate-400 mb-1">{title}</p>
          <p className="text-2xl font-bold text-white">{value}</p>
        </div>
      </div>
    </div>
  )
}

export default MetricCard
