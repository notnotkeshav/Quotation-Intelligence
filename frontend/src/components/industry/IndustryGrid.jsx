import { Settings } from 'lucide-react'
import LucideIcon from '../shared/LucideIcon'
import { INDUSTRY_ICON_MAP } from '../../config/industries'

export default function IndustryGrid({ industries, onSelect, activeIndustry }) {
  if (!industries.length) {
    return (
      <div className="text-sm text-center text-gray-400 py-12">
        No industries found in Frappe — check your Industry Type records.
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
      {industries.map(i => {
        const iconName = INDUSTRY_ICON_MAP[i.name] || 'Building2'
        const isActive = activeIndustry === i.name
        return (
          <button key={i.name} onClick={() => onSelect(i)}
            className={`flex flex-col items-center gap-2.5 p-4 rounded-xl border text-center
                        transition-all hover:-translate-y-0.5 hover:shadow-md group ${
              isActive
                ? 'border-[#1591AB] bg-[#1591AB]/5 dark:bg-[#1591AB]/10 shadow-sm shadow-[#1591AB]/10'
                : 'border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 hover:border-[#1591AB]/40'
            }`}>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
              isActive
                ? 'bg-[#1591AB] text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 group-hover:bg-[#1591AB]/10 group-hover:text-[#1591AB]'
            }`}>
              <LucideIcon name={iconName} size={20} />
            </div>
            <span className={`text-xs font-medium leading-tight ${
              isActive ? 'text-[#1591AB]' : 'text-gray-700 dark:text-gray-300'
            }`}>{i.name}</span>
          </button>
        )
      })}
    </div>
  )
}
