import { useState } from 'react'
import { Sparkles, RefreshCw, ExternalLink, CheckCircle, AlertCircle, FileText, Clock, DollarSign, Layers } from 'lucide-react'
import { AIProviderAPI, ProposalAPI } from '../../utils/frappeApi'
import { SECTION_BLOCKS, getDefaultPromptConfig } from '../../config/industries'
import { callAI } from '../../config/aiProviders'
import { Spinner } from '../shared/ui'

export default function StepGenerate({ data, onChange }) {
  const [status,   setStatus]   = useState('idle')   // idle | generating | done | error
  const [progress, setProgress] = useState('')
  const [error,    setError]    = useState('')
  const [proposal, setProposal] = useState(null)

  const pricingItems  = data.pricing_items || []
  const totalValue    = pricingItems.reduce((s, it) => s + (it.qty||0)*(it.unit_price||0)*(1-(it.discount||0)/100), 0)

  const summaryCards = [
    { Icon: FileText,    label: 'Client',    value: data.client_name   || '—' },
    { Icon: Layers,      label: 'Product',   value: data.product       || '—' },
    { Icon: Clock,       label: 'Timeline',  value: data.total_weeks   ? `${data.total_weeks} weeks` : '—' },
    { Icon: DollarSign,  label: 'Value',     value: pricingItems.length ? `${data.currency} ${Math.round(totalValue).toLocaleString()}` : 'TBD' },
  ]

  async function generate() {
    setStatus('generating'); setError('')
    try {
      setProgress('Loading active AI provider…')
      const providerConfig = await AIProviderAPI.get_active()
      if (!providerConfig?.api_key) throw new Error('No active AI provider configured. Go to Settings → AI Providers.')

      setProgress('Building prompt from form data…')
      const promptCfg     = data.prompt_config || getDefaultPromptConfig(data.industry || 'manufacturing')
      const enabledRaw    = data.sections_override || (promptCfg.enabled_sections ? JSON.parse(promptCfg.enabled_sections||'[]') : [])
      const sectionLabels = enabledRaw.map(id => SECTION_BLOCKS.find(b => b.id === id)?.label || id)

      const systemPrompt = `${promptCfg.custom_instructions || `You are generating a professional business proposal.`}

Generate ONLY valid JSON. No markdown. No explanation. No text outside the JSON object.

Tone: ${data.tone_override || promptCfg.tone || 'consultative'}
Sections required: ${sectionLabels.join(', ')}
${data.extra_instructions ? `Extra instructions: ${data.extra_instructions}` : ''}

Output schema:
{
  "id": "QI-XXXXXX",
  "generated_at": "ISO timestamp",
  "client_name": "string",
  "proposal_title": "string",
  "prepared_by": "string",
  "valid_until": "YYYY-MM-DD",
  "currency": "string",
  "total_value": 0,
  "primary_color": "${promptCfg.primary_color || '#1591AB'}",
  "accent_color": "${promptCfg.accent_color || '#22b5d4'}",
  "sections": [
    {
      "id": "section_id",
      "title": "Section Title",
      "type": null,
      "editable": true,
      "content": "Rich text content for text sections",
      "regenerated": false
    }
  ]
}`

      const userPrompt = `Generate a complete proposal for:

CLIENT: ${data.client_name || '—'}
CONTACT: ${data.contact_name || ''} | ${data.contact_email || ''} | ${data.contact_phone || ''}
INDUSTRY: ${data.industry || '—'}
COUNTRY: ${data.country || '—'}
PROPOSAL TITLE: ${data.proposal_title || 'ERP Implementation Proposal'}
PRODUCT: ${data.product || 'Frappe ERPNext'}
HOSTING: ${data.hosting || '—'}
USERS: ${data.user_count || '—'}
MODULES: ${(data.erpnext_modules || []).join(', ') || '—'}
MIGRATION: ${data.migration_source || 'Not required'}${data.migration_complexity ? ` (${data.migration_complexity})` : ''}
TRAINING: ${data.include_training ? `${data.training_users} users, ${data.training_days} days, ${data.training_mode}` : 'Not included'}
SCOPE NOTES: ${data.scope_notes || '—'}

PRICING:
${pricingItems.map(it => `  - ${it.description} (${it.category}): ${it.qty} × ${data.currency}${it.unit_price} = ${Math.round(it.qty*it.unit_price*(1-it.discount/100)).toLocaleString()}`).join('\n') || '  TBD'}
TOTAL: ${data.currency} ${Math.round(totalValue).toLocaleString()}
TAX: ${data.tax_applicable ? `${data.tax_rate||18}%` : 'Not applicable'}
PAYMENT: ${data.payment_structure || data.payment_notes || 'Standard'}

TIMELINE: ${data.total_weeks || '—'} weeks, go-live ${data.go_live_date || 'TBD'}
PHASES: ${(data.phases||[]).map(p => `${p.name} (${p.weeks}w)`).join(', ') || '—'}
METHODOLOGY: ${data.methodology || 'Agile'}

STRENGTHS: ${data.ai_highlights || '—'}
CLIENT PAIN POINTS: ${data.ai_pain_points || '—'}
DIFFERENTIATORS: ${data.ai_differentiators || '—'}
CRM NOTES: ${data.crm_notes || '—'}

Generate the JSON proposal now.`

      setProgress('Calling AI — this may take 15–30 seconds…')
      const rawText = await callAI({ provider_config: providerConfig, system_prompt: systemPrompt, user_prompt: userPrompt, max_tokens: 6000 })

      setProgress('Parsing response…')
      let parsed
      try {
        const clean = rawText.replace(/```json|```/g, '').trim()
        const s = clean.indexOf('{'), e = clean.lastIndexOf('}')
        if (s === -1) throw new Error('No JSON object found in AI response')
        parsed = JSON.parse(clean.slice(s, e + 1))
      } catch {
        throw new Error('AI returned invalid JSON. Try regenerating or check your provider configuration.')
      }

      // Inject structured sections
      if (pricingItems.length > 0) {
        const ci = parsed.sections?.findIndex(s => ['commercials_section','commercials','pricing'].includes(s.id))
        const cs = {
          id: 'commercials_section', title: 'Commercial Proposal', type: 'pricing', editable: false,
          pricing_items: pricingItems, currency: data.currency, payment_terms: data.payment_notes || data.payment_structure,
          tax_applicable: !!data.tax_applicable, tax_rate: data.tax_rate,
          subtotal: totalValue, total: totalValue * (data.tax_applicable ? 1 + (data.tax_rate||18)/100 : 1),
        }
        if (ci >= 0) parsed.sections[ci] = { ...parsed.sections[ci], ...cs }
        else parsed.sections = [...(parsed.sections||[]), cs]
      }
      if ((data.phases||[]).length > 0) {
        const ti = parsed.sections?.findIndex(s => s.type === 'timeline' || s.id === 'timeline')
        const ts = {
          id: 'timeline', title: 'Project Timeline', type: 'timeline', editable: false,
          phases: data.phases, total_weeks: data.total_weeks, go_live: data.go_live_date,
        }
        if (ti >= 0) parsed.sections[ti] = { ...parsed.sections[ti], ...ts }
        else parsed.sections = [ts, ...(parsed.sections||[])]
      }

      setProgress('Saving to Frappe…')
      const saved = await ProposalAPI.save({
        ...parsed,
        form_data: JSON.stringify(data),
        status: 'Draft',
      }).catch(() => null)
      if (saved?.name) parsed.frappe_name = saved.name

      setProposal(parsed)
      onChange({ generated_proposal: parsed })
      setStatus('done')
    } catch (e) {
      setError(e.message)
      setStatus('error')
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">Generate Proposal</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">Review the summary, then generate your AI-powered proposal.</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {summaryCards.map(({ Icon, label, value }) => (
          <div key={label} className="card p-4 rounded-xl">
            <div className="flex items-center gap-2 mb-1">
              <Icon size={14} className="text-[#1591AB]" />
              <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">{label}</span>
            </div>
            <div className="font-semibold text-gray-900 dark:text-white text-sm truncate">{value}</div>
          </div>
        ))}
      </div>

      {/* Generate / status */}
      {status === 'idle' && (
        <div className="card p-10 rounded-2xl text-center">
          <div className="w-16 h-16 rounded-2xl brand-gradient flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Sparkles size={28} className="text-white" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Ready to Generate</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto">
            The AI will build a complete structured proposal using the master prompt configured for this industry.
          </p>
          <button onClick={generate} className="btn-primary px-8 py-3 text-base">
            <Sparkles size={16} /> Generate Proposal
          </button>
        </div>
      )}

      {status === 'generating' && (
        <div className="card p-10 rounded-2xl text-center">
          <Spinner size="lg" className="mx-auto mb-4" />
          <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Generating…</h3>
          <p className="text-sm text-[#1591AB] animate-pulse">{progress}</p>
        </div>
      )}

      {status === 'error' && (
        <div className="card p-6 rounded-2xl">
          <div className="flex items-start gap-3">
            <AlertCircle size={20} className="text-red-500 shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-red-700 dark:text-red-400 mb-1">Generation Failed</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{error}</p>
              <button onClick={generate} className="btn-primary"><RefreshCw size={14} /> Try Again</button>
            </div>
          </div>
        </div>
      )}

      {status === 'done' && proposal && (
        <div className="space-y-4">
          <div className="card p-5 rounded-2xl border-l-4 border-green-500">
            <div className="flex items-center gap-3 mb-3">
              <CheckCircle size={20} className="text-green-500 shrink-0" />
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 dark:text-white">Proposal Generated</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {proposal.id}{proposal.frappe_name ? ` · Saved: ${proposal.frappe_name}` : ''}
                </p>
              </div>
              <div className="flex gap-2">
                {proposal.frappe_name && (
                  <a href={`/qi/proposal/${proposal.frappe_name}`} target="_blank" rel="noreferrer"
                    className="btn-primary text-xs py-1.5 px-3">
                    <ExternalLink size={13} /> Open
                  </a>
                )}
                <button onClick={generate} className="btn-ghost text-xs py-1.5 px-3">
                  <RefreshCw size={13} /> Regenerate
                </button>
              </div>
            </div>
          </div>

          <div className="card p-5 rounded-2xl">
            <p className="label mb-3">Generated Sections</p>
            <div className="space-y-2">
              {(proposal.sections||[]).map((s, i) => (
                <div key={i} className="flex items-center gap-3 p-2.5 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                  <CheckCircle size={14} className="text-green-500 shrink-0" />
                  <span className="text-sm font-medium text-gray-900 dark:text-white flex-1">{s.title}</span>
                  {s.type && (
                    <span className="badge bg-teal-100 text-teal-700 dark:bg-teal-900/20 dark:text-teal-400">{s.type}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
