import { Plus, X } from 'lucide-react'
import { Field } from '../shared/ui'

const ERPNEXT_MODULES = [
  'Accounts','Stock','Manufacturing','Purchase','Sales','CRM','HR & Payroll',
  'Projects','Assets','Quality','Buying','Selling','Website','POS',
  'Healthcare','Education','Hospitality','Nonprofit','Maintenance',
]

export default function StepScope({ data, onChange }) {
  function toggleModule(m) {
    const cur = data.erpnext_modules || []
    onChange({ erpnext_modules: cur.includes(m) ? cur.filter(x => x !== m) : [...cur, m] })
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">Scope of Work</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">Define what is included in this engagement.</p>
      </div>

      {/* Product */}
      <div className="card p-5 rounded-2xl">
        <p className="label mb-4">Product & Delivery</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Primary Product" required>
            <select value={data.product || ''} onChange={e => onChange({ product: e.target.value })} className="input">
              <option value="">Select product</option>
              {['Frappe ERPNext','Frappe HRMS','Frappe CRM','Frappe LMS','Frappe Helpdesk','Custom Frappe App','Integration Project','Upgrade / Migration'].map(p =>
                <option key={p}>{p}</option>)}
            </select>
          </Field>
          <Field label="Hosting">
            <select value={data.hosting || ''} onChange={e => onChange({ hosting: e.target.value })} className="input">
              <option value="">Select hosting</option>
              {['Frappe Cloud','Self-Hosted (Client Server)','Self-Hosted (Our Server)','AWS','Azure','GCP','Hybrid'].map(h =>
                <option key={h}>{h}</option>)}
            </select>
          </Field>
          <Field label="No. of Users">
            <input type="number" value={data.user_count || ''} onChange={e => onChange({ user_count: e.target.value })}
              placeholder="25" className="input" />
          </Field>
          <Field label="No. of Sites / Companies">
            <input type="number" value={data.sites_count || ''} onChange={e => onChange({ sites_count: e.target.value })}
              placeholder="1" className="input" />
          </Field>
        </div>
      </div>

      {/* ERPNext modules */}
      {(!data.product || data.product.includes('ERPNext')) && (
        <div className="card p-5 rounded-2xl">
          <p className="label mb-3">ERPNext Modules</p>
          <div className="flex flex-wrap gap-2">
            {ERPNEXT_MODULES.map(m => {
              const active = (data.erpnext_modules || []).includes(m)
              return (
                <button key={m} onClick={() => toggleModule(m)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                    active
                      ? 'border-[#1591AB] bg-[#1591AB]/10 text-[#0c6478] dark:text-[#22b5d4]'
                      : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}>{m}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Customisation */}
      <div className="card p-5 rounded-2xl">
        <p className="label mb-4">Customisation & Data</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[['custom_reports','Custom Reports','10'],['print_formats','Print Formats','5'],['workflows','Workflows','3']].map(([k,l,p]) => (
            <Field key={k} label={l}>
              <input type="number" value={data[k] || ''} onChange={e => onChange({ [k]: e.target.value })} placeholder={p} className="input" />
            </Field>
          ))}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
          <Field label="Data Migration Source">
            <select value={data.migration_source || ''} onChange={e => onChange({ migration_source: e.target.value })} className="input">
              <option value="">Not required</option>
              {['Tally','SAP','Excel / CSV','QuickBooks','Zoho','SAGE','Oracle','Custom Legacy','Other'].map(s => <option key={s}>{s}</option>)}
            </select>
          </Field>
          <Field label="Migration Complexity">
            <select value={data.migration_complexity || ''} onChange={e => onChange({ migration_complexity: e.target.value })} className="input">
              <option value="">—</option>
              {['Low (< 10k records)','Medium (10k–100k)','High (100k+)'].map(c => <option key={c}>{c}</option>)}
            </select>
          </Field>
        </div>
        <div className="mt-4">
          <Field label="Scope Notes">
            <textarea value={data.scope_notes || ''} onChange={e => onChange({ scope_notes: e.target.value })}
              placeholder="Key deliverables, exclusions, assumptions…" rows={3}
              className="input resize-none text-sm leading-relaxed" />
          </Field>
        </div>
      </div>

      {/* Training */}
      <div className="card p-5 rounded-2xl">
        <div className="flex items-center justify-between mb-4">
          <p className="label mb-0">Training</p>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={!!data.include_training}
              onChange={e => onChange({ include_training: e.target.checked })}
              className="w-4 h-4 rounded accent-[#1591AB]" />
            <span className="text-sm text-gray-600 dark:text-gray-400">Include training</span>
          </label>
        </div>
        {data.include_training && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Field label="Users to Train">
              <input type="number" value={data.training_users || ''} onChange={e => onChange({ training_users: e.target.value })} className="input" />
            </Field>
            <Field label="Training Days">
              <input type="number" value={data.training_days || ''} onChange={e => onChange({ training_days: e.target.value })} className="input" />
            </Field>
            <Field label="Mode">
              <select value={data.training_mode || ''} onChange={e => onChange({ training_mode: e.target.value })} className="input">
                <option value="">Select</option>
                {['On-site','Remote / Online','Hybrid','Train the Trainer'].map(m => <option key={m}>{m}</option>)}
              </select>
            </Field>
          </div>
        )}
      </div>
    </div>
  )
}
