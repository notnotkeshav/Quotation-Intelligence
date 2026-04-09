import { useState, useEffect } from 'react'
import { Bot, Zap, Sliders, ListChecks } from 'lucide-react'
import { PromptConfigAPI } from '../../utils/frappeApi'
import { SECTION_BLOCKS, TONE_OPTIONS, FOCUS_AREAS } from '../../config/industries'
import { Field, Spinner } from '../shared/ui'

export default function StepAIConfig({ data, onChange }) {
  const [promptConfig, setPromptConfig] = useState(null)
  const [loading, setLoading]           = useState(false)

  useEffect(() => {
    if (!data.industry) return
    setLoading(true)
    PromptConfigAPI.list(data.industry)
      .then(list => {
        const def = list?.find(v => v.is_default) || list?.[0]
        if (def) { setPromptConfig(def); onChange({ prompt_config: def }) }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [data.industry])

  const activeSections = data.sections_override
    || (promptConfig?.enabled_sections ? JSON.parse(promptConfig.enabled_sections || '[]') : [])

  function toggleSection(id) {
    const cur = [...activeSections]
    const next = cur.includes(id) ? cur.filter(x => x !== id) : [...cur, id]
    onChange({ sections_override: next })
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">AI Configuration</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">Customize tone, focus, and sections for this specific proposal.</p>
      </div>

      {/* Auto-loaded prompt */}
      {loading ? (
        <div className="card p-5 rounded-2xl flex items-center gap-3">
          <Spinner size="sm" /> <span className="text-sm text-gray-500">Loading industry prompt config…</span>
        </div>
      ) : promptConfig ? (
        <div className="card p-5 rounded-2xl border-l-4 border-[#1591AB]">
          <div className="flex items-center gap-2 flex-wrap">
            <Bot size={16} className="text-[#1591AB]" />
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Auto-selected prompt:</span>
            <span className="badge bg-[#1591AB]/10 text-[#0c6478] dark:text-[#22b5d4]">{promptConfig.version_label}</span>
            {data.industry && <span className="text-xs text-gray-400">for {data.industry}</span>}
          </div>
          {promptConfig.tone && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              Tone: <strong>{promptConfig.tone}</strong>
            </p>
          )}
        </div>
      ) : !data.industry ? (
        <div className="card p-5 rounded-2xl text-sm text-amber-600 dark:text-amber-400 border-l-4 border-amber-400">
          Select an industry in Step 1 to auto-load a prompt template.
        </div>
      ) : null}

      {/* Tone override */}
      <div className="card p-5 rounded-2xl">
        <p className="label mb-3"><Sliders size={13} className="inline mr-1" />Tone Override</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
          {TONE_OPTIONS.map(t => (
            <button key={t.id} onClick={() => onChange({ tone_override: t.id })}
              className={`p-3 rounded-xl border text-left transition-all ${
                data.tone_override === t.id
                  ? 'border-[#1591AB] bg-[#1591AB]/5 dark:bg-[#1591AB]/10'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
              }`}>
              <div className="text-sm font-medium text-gray-900 dark:text-white">{t.label}</div>
              <div className="text-xs text-gray-400 mt-0.5 leading-tight">{t.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* AI context hints */}
      <div className="card p-5 rounded-2xl space-y-4">
        <p className="label"><Bot size={13} className="inline mr-1" />AI Context Hints</p>
        {[
          ['ai_highlights',      'Key Strengths to Highlight', 'Fast implementation, local support team, Frappe certified partner'],
          ['ai_pain_points',     'Client Pain Points',         'No real-time inventory visibility, manual month-end close'],
          ['ai_differentiators', 'Our Differentiators',        '50+ ERPNext implementations, Arabic UI, dedicated account manager'],
        ].map(([k, l, p]) => (
          <Field key={k} label={l}>
            <textarea value={data[k]||''} onChange={e => onChange({ [k]: e.target.value })}
              placeholder={p} rows={2} className="input resize-none text-sm leading-relaxed" />
          </Field>
        ))}
      </div>

      {/* Extra instructions */}
      <div className="card p-5 rounded-2xl">
        <Field label="Additional Instructions for this Proposal">
          <textarea value={data.extra_instructions||''} onChange={e => onChange({ extra_instructions: e.target.value })}
            placeholder="e.g. Emphasise ROI for CFO audience. Do not mention competitors by name. Use formal tone."
            rows={3} className="input resize-none text-sm leading-relaxed" />
        </Field>
      </div>

      {/* Section override */}
      <div className="card p-5 rounded-2xl">
        <p className="label mb-3"><ListChecks size={13} className="inline mr-1" />Sections to Generate</p>
        <p className="text-xs text-gray-400 dark:text-gray-500 mb-4">
          These override the template. Leave unchanged to use the industry default.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {SECTION_BLOCKS.map(b => {
            const active = activeSections.includes(b.id)
            return (
              <label key={b.id} className="flex items-center gap-2.5 cursor-pointer group p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                <input type="checkbox" checked={active} onChange={() => toggleSection(b.id)}
                  className="w-4 h-4 rounded accent-[#1591AB] shrink-0" />
                <span className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
                  {b.label}
                </span>
                {b.required && <span className="badge bg-[#1591AB]/10 text-[#1591AB] text-[10px] ml-auto">Required</span>}
              </label>
            )
          })}
        </div>
      </div>
    </div>
  )
}
