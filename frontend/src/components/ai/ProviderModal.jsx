import { useState, useEffect } from 'react'
import { Eye, EyeOff, ExternalLink } from 'lucide-react'
import { Modal, Field, Spinner } from '../shared/ui'
import { AI_PROVIDERS, PROVIDER_IDS } from '../../config/aiProviders'

const EMPTY = {
  provider_id: 'openrouter',
  api_key: '',
  model_id: '',
  base_url: '',
  model_endpoint: '',
  auth_header: '',
  is_active: 0,
  notes: '',
}

export default function ProviderModal({ open, onClose, provider, onSave }) {
  const [form,    setForm]    = useState(EMPTY)
  const [showKey, setShowKey] = useState(false)
  const [saving,  setSaving]  = useState(false)

  useEffect(() => {
    if (open) setForm(provider ? { ...EMPTY, ...provider } : EMPTY)
  }, [open, provider])

  const def     = AI_PROVIDERS[form.provider_id] || {}
  const models  = def.models || []

  // Auto-fill defaults when provider changes
  function changeProvider(id) {
    const d = AI_PROVIDERS[id] || {}
    setForm(f => ({
      ...f,
      provider_id:      id,
      model_id:         f.model_id || d.default_model_id  || '',
      base_url:         f.base_url || d.default_base_url   || '',
      model_endpoint:   f.model_endpoint || d.default_model_endpoint || '',
      auth_header:      f.auth_header    || d.default_auth_header    || 'Authorization',
    }))
  }

  async function handleSave() {
    if (!form.provider_id || !form.api_key) return
    setSaving(true)
    try { await onSave(form) } catch {}
    setSaving(false)
  }

  return (
    <Modal isOpen={open} onClose={onClose}
      title={provider ? `Edit ${def.label || provider.provider_id}` : 'Add AI Provider'}>
      <div className="space-y-4">

        {/* Provider select */}
        <Field label="Provider">
          <select value={form.provider_id} onChange={e => changeProvider(e.target.value)} className="input">
            {PROVIDER_IDS.map(id => (
              <option key={id} value={id}>{AI_PROVIDERS[id]?.label || id}</option>
            ))}
          </select>
        </Field>

        {def.docs_url && (
          <a href={def.docs_url} target="_blank" rel="noreferrer"
            className="inline-flex items-center gap-1.5 text-xs text-[#1591AB] hover:underline">
            Get your API key <ExternalLink size={11} />
          </a>
        )}

        {/* API Key */}
        <Field label="API Key" required>
          <div className="relative">
            <input
              type={showKey ? 'text' : 'password'}
              value={form.api_key}
              onChange={e => setForm(f => ({ ...f, api_key: e.target.value }))}
              placeholder="sk-… or your provider key"
              className="input pr-10"
            />
            <button type="button" onClick={() => setShowKey(s => !s)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
              {showKey ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
        </Field>

        {/* Model */}
        <Field label="Model">
          {models.length > 0 ? (
            <select value={form.model_id} onChange={e => setForm(f => ({ ...f, model_id: e.target.value }))} className="input">
              <option value="">Select model</option>
              {models.map(m => <option key={m.id} value={m.id}>{m.label}</option>)}
            </select>
          ) : (
            <input value={form.model_id} onChange={e => setForm(f => ({ ...f, model_id: e.target.value }))}
              placeholder="e.g. gpt-4o or custom-model-id" className="input" />
          )}
        </Field>

        {/* Advanced — base URL, endpoint, auth header */}
        <details className="group">
          <summary className="cursor-pointer text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide select-none">
            Advanced / Custom Endpoint
          </summary>
          <div className="mt-3 space-y-3 pl-2 border-l-2 border-gray-200 dark:border-gray-700">
            <Field label="Base URL">
              <input value={form.base_url} onChange={e => setForm(f => ({ ...f, base_url: e.target.value }))}
                placeholder={def.default_base_url || 'https://api.provider.com/v1/chat/completions'}
                className="input font-mono text-xs" />
            </Field>
            <Field label="Auth Header">
              <input value={form.auth_header} onChange={e => setForm(f => ({ ...f, auth_header: e.target.value }))}
                placeholder={def.default_auth_header || 'Authorization'}
                className="input font-mono text-xs" />
              <p className="text-[10px] text-gray-400 mt-1">
                Use <code>Authorization</code> for Bearer tokens, <code>x-api-key</code> for Anthropic direct.
              </p>
            </Field>
            <Field label="Model Endpoint (path only)">
              <input value={form.model_endpoint} onChange={e => setForm(f => ({ ...f, model_endpoint: e.target.value }))}
                placeholder="/chat/completions" className="input font-mono text-xs" />
            </Field>
          </div>
        </details>

        {/* Active toggle */}
        <label className="flex items-center gap-3 cursor-pointer p-3 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
          <input type="checkbox" checked={!!form.is_active}
            onChange={e => setForm(f => ({ ...f, is_active: e.target.checked ? 1 : 0 }))}
            className="w-4 h-4 rounded accent-[#1591AB]" />
          <div>
            <div className="text-sm font-medium text-gray-900 dark:text-white">Set as Active Provider</div>
            <div className="text-xs text-gray-400">Only one provider can be active at a time</div>
          </div>
        </label>

        {/* Notes */}
        <Field label="Notes (optional)">
          <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
            rows={2} placeholder="Usage notes or reminders" className="input resize-none text-sm" />
        </Field>

        <div className="flex gap-3 pt-2">
          <button onClick={onClose} className="btn-ghost flex-1">Cancel</button>
          <button onClick={handleSave} disabled={!form.api_key || saving} className="btn-primary flex-1">
            {saving && <Spinner size="sm" />}
            {provider ? 'Update Provider' : 'Add Provider'}
          </button>
        </div>
      </div>
    </Modal>
  )
}
