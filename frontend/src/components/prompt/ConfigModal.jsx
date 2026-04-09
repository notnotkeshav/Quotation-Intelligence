import { useState, useEffect } from 'react'
import {
  DndContext, closestCenter, PointerSensor, KeyboardSensor, useSensor, useSensors, DragOverlay,
} from '@dnd-kit/core'
import {
  SortableContext, useSortable, sortableKeyboardCoordinates,
  verticalListSortingStrategy, arrayMove,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical, Plus, X, Check } from 'lucide-react'
import { Modal, Field, ColorPicker, Spinner, SectionBadge } from '../shared/ui'
import LucideIcon from '../shared/LucideIcon'
import { SECTION_BLOCKS, TONE_OPTIONS, PALETTE_PRESETS, FOCUS_AREAS } from '../../config/industries'

// ─── Sortable section row ──────────────────────────────────────────────────────
function SortableRow({ block, onRemove }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: block.id })
  return (
    <div ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.4 : 1 }}
      className="flex items-center gap-2.5 p-2.5 card rounded-lg group">
      <button {...listeners} {...attributes}
        className="cursor-grab active:cursor-grabbing text-gray-300 dark:text-gray-600 hover:text-gray-500 shrink-0">
        <GripVertical size={16} />
      </button>
      <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0
                       bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400`}>
        <LucideIcon name={block.icon} size={14} />
      </div>
      <span className="text-sm font-medium text-gray-800 dark:text-gray-200 flex-1 truncate">{block.label}</span>
      {block.required
        ? <span className="badge bg-[#1591AB]/10 text-[#0c6478] dark:text-[#22b5d4] text-[10px] shrink-0">Required</span>
        : <button onClick={() => onRemove(block.id)}
            className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-300 hover:text-red-500 transition-all shrink-0">
            <X size={13} />
          </button>
      }
    </div>
  )
}

const TABS = ['Sections', 'Style', 'Instructions']

export default function ConfigModal({ config, onClose, onSave }) {
  const [form,   setForm]   = useState(null)
  const [tab,    setTab]    = useState(0)
  const [saving, setSaving] = useState(false)
  const [activeId, setActiveId] = useState(null)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  useEffect(() => {
    if (!config) return
    // Parse JSON fields from Frappe string storage
    function parseArr(v) {
      if (Array.isArray(v)) return v
      try { return JSON.parse(v || '[]') } catch { return [] }
    }
    setForm({
      ...config,
      enabled_sections: parseArr(config.enabled_sections),
      section_order:    parseArr(config.section_order),
      focus_areas:      parseArr(config.focus_areas),
      restrictions:     parseArr(config.restrictions),
    })
    setTab(0)
  }, [config])

  if (!form) return null

  const p = (patch) => setForm(f => ({ ...f, ...patch }))

  const orderedBlocks = (form.section_order || [])
    .map(id => SECTION_BLOCKS.find(b => b.id === id))
    .filter(Boolean)

  const availableBlocks = SECTION_BLOCKS.filter(b => !(form.section_order || []).includes(b.id))

  function addSection(block) {
    p({
      section_order:    [...(form.section_order || []), block.id],
      enabled_sections: [...(form.enabled_sections || []), block.id],
    })
  }
  function removeSection(id) {
    p({
      section_order:    (form.section_order    || []).filter(s => s !== id),
      enabled_sections: (form.enabled_sections || []).filter(s => s !== id),
    })
  }
  function handleDragEnd({ active, over }) {
    setActiveId(null)
    if (!over || active.id === over.id) return
    const order = form.section_order || []
    p({ section_order: arrayMove(order, order.indexOf(active.id), order.indexOf(over.id)) })
  }

  function toggleFocus(area) {
    const cur = form.focus_areas || []
    p({ focus_areas: cur.includes(area) ? cur.filter(a => a !== area) : [...cur, area] })
  }

  function setPalette(preset) {
    if (preset.id !== 'custom') p({ primary_color: preset.primary, accent_color: preset.accent })
  }

  async function save() {
    setSaving(true)
    // Serialize arrays back to JSON strings for Frappe storage
    const doc = {
      ...form,
      enabled_sections: JSON.stringify(form.enabled_sections || []),
      section_order:    JSON.stringify(form.section_order    || []),
      focus_areas:      JSON.stringify(form.focus_areas      || []),
      restrictions:     JSON.stringify(form.restrictions     || []),
    }
    try { await onSave(doc) } catch {}
    setSaving(false)
  }

  const draggedBlock = activeId ? SECTION_BLOCKS.find(b => b.id === activeId) : null

  return (
    <Modal isOpen={!!config} onClose={onClose} title={`${form.version_label || 'Prompt Config'} — ${form.industry_id}`} width="max-w-4xl">
      <div className="space-y-5">

        {/* Version + default */}
        <div className="grid grid-cols-2 gap-4">
          <Field label="Version Label" required>
            <input value={form.version_label || ''} onChange={e => p({ version_label: e.target.value })} className="input" />
          </Field>
          <Field label=" ">
            <label className="flex items-center gap-2 cursor-pointer mt-1 h-9">
              <input type="checkbox" checked={!!form.is_default} onChange={e => p({ is_default: e.target.checked ? 1 : 0 })}
                className="w-4 h-4 rounded accent-[#1591AB]" />
              <span className="text-sm text-gray-700 dark:text-gray-300">Set as default for {form.industry_id}</span>
            </label>
          </Field>
        </div>

        {/* Tab bar */}
        <div className="flex gap-1 p-1 bg-gray-100 dark:bg-gray-800/60 rounded-xl">
          {TABS.map((t, i) => (
            <button key={t} onClick={() => setTab(i)}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                tab === i
                  ? 'bg-white dark:bg-gray-900 text-[#1591AB] shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}>{t}
            </button>
          ))}
        </div>

        {/* ── Tab 0: Sections ───────────────────────────────────────────────── */}
        {tab === 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Available palette */}
            <div>
              <p className="label mb-2">Available Blocks</p>
              <div className="space-y-1.5 max-h-96 overflow-y-auto pr-1">
                {availableBlocks.map(block => (
                  <button key={block.id} onClick={() => addSection(block)}
                    className="flex items-center gap-2.5 w-full p-2.5 rounded-lg border border-gray-200 dark:border-gray-800
                               bg-white dark:bg-gray-900 hover:border-[#1591AB]/50 hover:shadow-sm text-left transition-all">
                    <div className="w-7 h-7 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center shrink-0 text-gray-400">
                      <LucideIcon name={block.icon} size={14} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">{block.label}</div>
                      <div className="text-xs text-gray-400 truncate">{block.description}</div>
                    </div>
                    <SectionBadge category={block.category} />
                    <Plus size={14} className="text-gray-400 shrink-0" />
                  </button>
                ))}
                {availableBlocks.length === 0 && (
                  <p className="text-xs text-gray-400 text-center py-6">All blocks added</p>
                )}
              </div>
            </div>

            {/* Active order (sortable) */}
            <div>
              <p className="label mb-2">Proposal Sections <span className="normal-case font-normal text-gray-400">(drag to reorder)</span></p>
              <DndContext sensors={sensors} collisionDetection={closestCenter}
                onDragStart={({ active }) => setActiveId(active.id)}
                onDragEnd={handleDragEnd}>
                <SortableContext items={form.section_order || []} strategy={verticalListSortingStrategy}>
                  <div className="space-y-1.5 max-h-96 overflow-y-auto pr-1">
                    {orderedBlocks.length === 0 && (
                      <div className="border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-xl p-8 text-center text-sm text-gray-400">
                        Add sections from the left panel
                      </div>
                    )}
                    {orderedBlocks.map(block => (
                      <SortableRow key={block.id} block={block} onRemove={removeSection} />
                    ))}
                  </div>
                </SortableContext>
                <DragOverlay>
                  {draggedBlock && (
                    <div className="flex items-center gap-2.5 p-2.5 card rounded-lg shadow-xl ring-2 ring-[#1591AB] opacity-90">
                      <LucideIcon name={draggedBlock.icon} size={14} className="text-gray-500" />
                      <span className="text-sm font-medium text-gray-800 dark:text-gray-200">{draggedBlock.label}</span>
                    </div>
                  )}
                </DragOverlay>
              </DndContext>
            </div>
          </div>
        )}

        {/* ── Tab 1: Style ─────────────────────────────────────────────────── */}
        {tab === 1 && (
          <div className="space-y-5">
            {/* Tone */}
            <div>
              <p className="label mb-2">Proposal Tone</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
                {TONE_OPTIONS.map(t => (
                  <button key={t.id} onClick={() => p({ tone: t.id })}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      form.tone === t.id
                        ? 'border-[#1591AB] bg-[#1591AB]/5 dark:bg-[#1591AB]/10'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}>
                    <div className="text-sm font-medium text-gray-900 dark:text-white">{t.label}</div>
                    <div className="text-xs text-gray-400 mt-0.5 leading-tight">{t.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Palette presets */}
            <div>
              <p className="label mb-2">Colour Palette</p>
              <div className="flex flex-wrap gap-2 mb-3">
                {PALETTE_PRESETS.map(preset => (
                  <button key={preset.id} onClick={() => setPalette(preset)}
                    className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-all ${
                      form.primary_color === preset.primary && preset.id !== 'custom'
                        ? 'border-[#1591AB] shadow-sm'
                        : 'border-gray-200 dark:border-gray-700'
                    }`}>
                    <div className="flex gap-1">
                      <div className="w-5 h-5 rounded-full shadow-sm" style={{ backgroundColor: preset.primary }} />
                      <div className="w-5 h-5 rounded-full shadow-sm" style={{ backgroundColor: preset.accent }} />
                    </div>
                    <span className="text-xs text-gray-600 dark:text-gray-400">{preset.label}</span>
                  </button>
                ))}
              </div>
              <div className="card p-4 rounded-xl space-y-3">
                <ColorPicker label="Primary" value={form.primary_color || '#1591AB'} onChange={v => p({ primary_color: v })} />
                <ColorPicker label="Accent"  value={form.accent_color  || '#22b5d4'} onChange={v => p({ accent_color: v })} />
              </div>
            </div>

            {/* Focus areas */}
            <div>
              <p className="label mb-2">Focus Areas</p>
              <div className="flex flex-wrap gap-2">
                {FOCUS_AREAS.map(area => {
                  const active = (form.focus_areas || []).includes(area)
                  return (
                    <button key={area} onClick={() => toggleFocus(area)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                        active
                          ? 'border-[#1591AB] bg-[#1591AB]/10 text-[#0c6478] dark:text-[#22b5d4]'
                          : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-600'
                      }`}>
                      {active && <Check size={11} />}
                      {area}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        )}

        {/* ── Tab 2: Instructions ───────────────────────────────────────────── */}
        {tab === 2 && (
          <div className="space-y-4">
            <Field label="Master AI Instructions (System Prompt)">
              <p className="text-xs text-gray-400 dark:text-gray-500 mb-2">
                Variables injected automatically: client_name, industry, product, modules, country.
              </p>
              <textarea value={form.custom_instructions || ''} onChange={e => p({ custom_instructions: e.target.value })}
                rows={10} className="input font-mono text-xs leading-relaxed resize-none" />
            </Field>
            <Field label="Restrictions (one per line)">
              <textarea
                value={Array.isArray(form.restrictions) ? form.restrictions.join('\n') : (form.restrictions || '')}
                onChange={e => p({ restrictions: e.target.value.split('\n').filter(Boolean) })}
                rows={5} className="input text-sm leading-relaxed resize-none"
                placeholder="Avoid jargon without explanation&#10;Do not mention competitor names&#10;Keep pricing factual" />
            </Field>
          </div>
        )}

        {/* Footer actions */}
        <div className="flex gap-3 pt-2 border-t border-gray-200 dark:border-gray-800">
          <button onClick={onClose} className="btn-ghost flex-1">Cancel</button>
          <button onClick={save} disabled={saving} className="btn-primary flex-1">
            {saving && <Spinner size="sm" />}
            Save Configuration
          </button>
        </div>
      </div>
    </Modal>
  )
}
