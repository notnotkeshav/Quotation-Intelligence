import { Star, StarOff, Edit2, Trash2, Plus } from 'lucide-react'

export default function ConfigList({ configs, onEdit, onNew, onDelete, onSetDefault }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
          Prompt Versions <span className="text-gray-400 font-normal">({configs.length})</span>
        </p>
        <button onClick={onNew} className="btn-primary text-xs py-1.5 px-3">
          <Plus size={14} /> New Version
        </button>
      </div>

      {configs.length === 0 ? (
        <div className="border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-xl p-8 text-center">
          <p className="text-sm text-gray-400 mb-3">No prompt configs yet for this industry</p>
          <button onClick={onNew} className="btn-primary text-xs py-1.5 px-4">
            <Plus size={14} /> Create Default
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          {configs.map(c => (
            <div key={c.name}
              className="flex items-center gap-3 p-3.5 card rounded-xl hover:shadow-sm transition-shadow">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-medium text-sm text-gray-900 dark:text-white">{c.version_label}</span>
                  {c.is_default ? (
                    <span className="badge bg-[#1591AB]/10 text-[#0c6478] dark:text-[#22b5d4] text-[10px]">Default</span>
                  ) : null}
                  {c.tone && (
                    <span className="badge bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 text-[10px] capitalize">{c.tone}</span>
                  )}
                </div>
                {(c.primary_color || c.accent_color) && (
                  <div className="flex gap-1.5 mt-1.5">
                    {c.primary_color && <div className="w-3 h-3 rounded-full border border-gray-200 dark:border-gray-700" style={{ backgroundColor: c.primary_color }} />}
                    {c.accent_color  && <div className="w-3 h-3 rounded-full border border-gray-200 dark:border-gray-700" style={{ backgroundColor: c.accent_color  }} />}
                  </div>
                )}
              </div>

              <div className="flex gap-1 shrink-0">
                {!c.is_default && (
                  <button onClick={() => onSetDefault?.(c)}
                    title="Set as default"
                    className="p-1.5 rounded-lg hover:bg-amber-50 dark:hover:bg-amber-900/20 text-gray-400 hover:text-amber-500 transition-colors">
                    <StarOff size={15} />
                  </button>
                )}
                {c.is_default && (
                  <span className="p-1.5 text-amber-400"><Star size={15} /></span>
                )}
                <button onClick={() => onEdit(c)}
                  className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors">
                  <Edit2 size={15} />
                </button>
                {!c.is_default && (
                  <button onClick={() => onDelete?.(c)}
                    className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-400 hover:text-red-500 transition-colors">
                    <Trash2 size={15} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
