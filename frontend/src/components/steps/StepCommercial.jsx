import { Plus, Trash2, X } from 'lucide-react'
import { Field } from '../shared/ui'

function emptyItem() {
  return { description: '', category: 'Implementation', qty: 1, unit_price: 0, discount: 0 }
}

export default function StepCommercial({ data, onChange }) {
  const items = data.pricing_items || []

  function addItem()        { onChange({ pricing_items: [...items, emptyItem()] }) }
  function removeItem(i)    { onChange({ pricing_items: items.filter((_,idx) => idx !== i) }) }
  function updateItem(i, p) { const a = [...items]; a[i] = { ...a[i], ...p }; onChange({ pricing_items: a }) }

  const subtotal = items.reduce((s, it) => s + (it.qty||0) * (it.unit_price||0) * (1 - (it.discount||0)/100), 0)
  const taxAmt   = data.tax_applicable ? subtotal * ((data.tax_rate||18)/100) : 0

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">Commercial Proposal</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">Define pricing items, timeline, and payment terms.</p>
      </div>

      {/* Pricing table */}
      <div className="card p-5 rounded-2xl">
        <div className="flex items-center justify-between mb-4">
          <p className="label mb-0">Pricing Items</p>
          <button onClick={addItem} className="btn-primary text-xs py-1.5 px-3">
            <Plus size={14} /> Add Item
          </button>
        </div>

        {items.length === 0 ? (
          <p className="text-sm text-center text-gray-400 py-6">No items yet — click Add Item</p>
        ) : (
          <div className="space-y-2">
            {items.map((item, i) => (
              <div key={i} className="grid grid-cols-12 gap-2 items-center p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                <div className="col-span-12 sm:col-span-4">
                  <input value={item.description} onChange={e => updateItem(i, { description: e.target.value })}
                    placeholder="Item description" className="input text-sm" />
                </div>
                <div className="col-span-6 sm:col-span-2">
                  <select value={item.category} onChange={e => updateItem(i, { category: e.target.value })} className="input text-sm">
                    {['Implementation','License','Training','Support','Infrastructure','Other'].map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div className="col-span-3 sm:col-span-1">
                  <input type="number" min="1" value={item.qty} onChange={e => updateItem(i, { qty: +e.target.value })}
                    placeholder="1" className="input text-sm text-center" />
                </div>
                <div className="col-span-3 sm:col-span-2">
                  <input type="number" min="0" value={item.unit_price} onChange={e => updateItem(i, { unit_price: +e.target.value })}
                    placeholder="Price" className="input text-sm" />
                </div>
                <div className="col-span-3 sm:col-span-1">
                  <input type="number" min="0" max="100" value={item.discount} onChange={e => updateItem(i, { discount: +e.target.value })}
                    placeholder="0%" className="input text-sm" />
                </div>
                <div className="col-span-3 sm:col-span-1 text-right">
                  <span className="text-sm font-mono font-semibold text-gray-700 dark:text-gray-300">
                    {Math.round((item.qty||0)*(item.unit_price||0)*(1-(item.discount||0)/100)).toLocaleString()}
                  </span>
                </div>
                <div className="col-span-12 sm:col-span-1 flex justify-end">
                  <button onClick={() => removeItem(i)}
                    className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-400 hover:text-red-500 transition-colors">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}

            <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-2">
              <div className="flex justify-between items-end">
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-600 dark:text-gray-400">
                    <input type="checkbox" checked={!!data.tax_applicable} onChange={e => onChange({ tax_applicable: e.target.checked })}
                      className="w-4 h-4 rounded accent-[#1591AB]" />
                    Apply Tax
                  </label>
                  {data.tax_applicable && (
                    <div className="flex items-center gap-1">
                      <input type="number" value={data.tax_rate||18} onChange={e => onChange({ tax_rate: +e.target.value })}
                        className="input w-16 text-sm text-center" />
                      <span className="text-sm text-gray-400">%</span>
                    </div>
                  )}
                </div>
                <div className="text-right">
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    Subtotal: {data.currency} {Math.round(subtotal).toLocaleString()}
                  </div>
                  {data.tax_applicable && (
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      Tax: {data.currency} {Math.round(taxAmt).toLocaleString()}
                    </div>
                  )}
                  <div className="text-xl font-bold text-[#1591AB] mt-0.5">
                    {data.currency} {Math.round(subtotal + taxAmt).toLocaleString()}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Timeline */}
      <div className="card p-5 rounded-2xl">
        <p className="label mb-4">Project Timeline</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
          <Field label="Total Duration (weeks)">
            <input type="number" value={data.total_weeks||''} onChange={e => onChange({ total_weeks: +e.target.value })} className="input" />
          </Field>
          <Field label="Go-Live Date">
            <input type="date" value={data.go_live_date||''} onChange={e => onChange({ go_live_date: e.target.value })} className="input" />
          </Field>
          <Field label="Methodology">
            <select value={data.methodology||''} onChange={e => onChange({ methodology: e.target.value })} className="input">
              <option value="">Select</option>
              {['Agile / Scrum','Waterfall','Hybrid','Fixed Scope','Time & Material'].map(m => <option key={m}>{m}</option>)}
            </select>
          </Field>
        </div>
        <Field label="Phases">
          <div className="space-y-2 mt-1">
            {(data.phases||[]).map((ph, i) => (
              <div key={i} className="flex gap-2 items-center">
                <input value={ph.name} onChange={e => { const a=[...data.phases]; a[i]={...a[i],name:e.target.value}; onChange({phases:a}) }}
                  placeholder="Phase name (e.g. Discovery)" className="input flex-1 text-sm" />
                <input type="number" value={ph.weeks} onChange={e => { const a=[...data.phases]; a[i]={...a[i],weeks:+e.target.value}; onChange({phases:a}) }}
                  placeholder="Wks" className="input w-20 text-sm" />
                <button onClick={() => onChange({ phases: data.phases.filter((_,idx)=>idx!==i) })}
                  className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-400 hover:text-red-500 transition-colors">
                  <X size={14} />
                </button>
              </div>
            ))}
            <button onClick={() => onChange({ phases: [...(data.phases||[]), { name: '', weeks: 2 }] })}
              className="flex items-center gap-1.5 text-xs text-[#1591AB] hover:text-[#0c6478] font-medium">
              <Plus size={13} /> Add Phase
            </button>
          </div>
        </Field>
      </div>

      {/* Payment terms */}
      <div className="card p-5 rounded-2xl">
        <p className="label mb-4">Payment Terms</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Payment Structure">
            <select value={data.payment_structure||''} onChange={e => onChange({ payment_structure: e.target.value })} className="input">
              <option value="">Custom</option>
              {['30-40-30 (Sign–Milestone–Go Live)','50-50 (Sign–Delivery)','100% Upfront','Monthly Retainer','Milestone Based'].map(p => <option key={p}>{p}</option>)}
            </select>
          </Field>
          <Field label="Quote Validity (days)">
            <input type="number" value={data.validity_days||30} onChange={e => onChange({ validity_days: +e.target.value })} className="input" />
          </Field>
        </div>
        <div className="mt-4">
          <Field label="Payment Notes">
            <textarea value={data.payment_notes||''} onChange={e => onChange({ payment_notes: e.target.value })}
              placeholder="30% on signing, 40% on UAT sign-off, 30% on go-live…" rows={2}
              className="input resize-none text-sm" />
          </Field>
        </div>
      </div>
    </div>
  )
}
