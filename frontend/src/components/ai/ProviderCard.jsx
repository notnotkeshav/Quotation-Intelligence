import { CheckCircle, Circle, Edit2, Trash2, ExternalLink } from 'lucide-react'
import { AI_PROVIDERS } from '../../config/aiProviders'

export default function ProviderCard({ provider, onEdit, onDelete, onSetActive }) {
  const def      = AI_PROVIDERS[provider.provider_id] || {}
  const isActive = !!provider.is_active

  return (
    <div className={`card p-5 rounded-xl transition-all ${isActive ? 'ring-2 ring-[#1591AB]' : ''}`}>
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-gray-900 dark:text-white">
              {def.label || provider.provider_id}
            </span>
            {isActive ? (
              <span className="badge bg-[#1591AB]/10 text-[#0c6478] dark:text-[#22b5d4] flex items-center gap-1">
                <CheckCircle size={11} /> Active
              </span>
            ) : (
              <span className="badge bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400">
                Inactive
              </span>
            )}
          </div>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
            {provider.model_id || def.default_model_id || 'No model set'}
          </p>
          {def.docs_url && (
            <a href={def.docs_url} target="_blank" rel="noreferrer"
              className="text-xs text-[#1591AB] hover:underline flex items-center gap-1 mt-0.5">
              API keys <ExternalLink size={10} />
            </a>
          )}
        </div>

        <div className="flex gap-1.5">
          {!isActive && (
            <button onClick={() => onSetActive?.(provider)}
              className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg
                         bg-[#1591AB]/10 text-[#0c6478] dark:text-[#22b5d4]
                         hover:bg-[#1591AB]/20 transition-colors font-medium">
              <Circle size={12} /> Set Active
            </button>
          )}
          <button onClick={() => onEdit(provider)}
            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors">
            <Edit2 size={15} />
          </button>
          <button onClick={() => onDelete?.(provider)}
            className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-400 hover:text-red-500 transition-colors">
            <Trash2 size={15} />
          </button>
        </div>
      </div>

      {provider.base_url && (
        <p className="text-xs font-mono text-gray-400 dark:text-gray-500 truncate mt-1">
          {provider.base_url}
        </p>
      )}
    </div>
  )
}
