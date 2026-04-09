import { useState, useCallback, useRef } from 'react'
import { Search, User, Target, Building2, Phone, Mail, Globe, MapPin, X } from 'lucide-react'
import { useIndustries, CrmAPI } from '../../utils/frappeApi'
import { Spinner, toast, Field } from '../shared/ui'

export default function StepClient({ data, onChange }) {
  const [query, setQuery]         = useState('')
  const [searchType, setSearchType] = useState('lead')
  const [results, setResults]     = useState([])
  const [searching, setSearching] = useState(false)
  const [selected, setSelected]   = useState(data.crm_source || null)
  const debounce                  = useRef()
  const { industries }            = useIndustries()

  const search = useCallback(async (q) => {
    if (q.length < 2) { setResults([]); return }
    setSearching(true)
    try {
      const fn = searchType === 'lead' ? CrmAPI.search_leads : CrmAPI.search_opportunities
      setResults(await fn(q) || [])
    } catch { setResults([]) }
    setSearching(false)
  }, [searchType])

  function onQueryChange(v) {
    setQuery(v)
    clearTimeout(debounce.current)
    debounce.current = setTimeout(() => search(v), 350)
  }

  async function selectRecord(rec) {
    setResults([]); setQuery('')
    try {
      const detail = searchType === 'lead'
        ? await CrmAPI.get_lead(rec.name)
        : await CrmAPI.get_opportunity(rec.name)
      const full = { ...rec, ...detail, source_type: searchType }
      setSelected(full)
      onChange({
        crm_source:       full,
        client_name:      detail.company_name || detail.customer_name || '',
        contact_name:     detail.lead_name || '',
        contact_email:    detail.email_id  || detail.contact_email  || '',
        contact_phone:    detail.mobile_no || detail.contact_mobile || '',
        industry:         detail.industry  || '',
        country:          detail.country   || '',
        city:             detail.city      || '',
        website:          detail.website   || '',
        no_of_employees:  detail.no_of_employees || '',
        annual_revenue:   detail.annual_revenue  || '',
        currency:         detail.currency        || data.currency || 'USD',
        opportunity_amount: detail.opportunity_amount || detail.expected_revenue || '',
        crm_notes:        detail.notes || detail.order_lost_reason || '',
      })
    } catch (e) { toast(e.message, 'error') }
  }

  function clear() {
    setSelected(null)
    onChange({ crm_source: null, client_name: '', contact_name: '', contact_email: '', industry: '' })
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">Client & Opportunity</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">Search CRM or fill in details manually.</p>
      </div>

      {/* CRM search */}
      <div className="card p-5 rounded-2xl">
        <p className="label mb-3">Search CRM</p>
        <div className="flex gap-2 mb-4">
          {[{ id: 'lead', label: 'Lead', Icon: User }, { id: 'opportunity', label: 'Opportunity', Icon: Target }]
            .map(({ id, label, Icon }) => (
              <button key={id}
                onClick={() => { setSearchType(id); setResults([]); setQuery('') }}
                className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                  searchType === id
                    ? 'bg-[#1591AB] text-white'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}>
                <Icon size={14} />{label}
              </button>
            ))}
        </div>

        {selected ? (
          <div className="flex items-start gap-4 p-4 bg-[#1591AB]/5 dark:bg-[#1591AB]/10 rounded-xl border border-[#1591AB]/20">
            <div className="w-10 h-10 rounded-full brand-gradient flex items-center justify-center text-white font-bold shrink-0 text-sm">
              {(selected.company_name || selected.lead_name || '?')[0].toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-gray-900 dark:text-white truncate">
                {selected.company_name || selected.customer_name || selected.lead_name}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {selected.lead_name}{selected.email_id ? ` · ${selected.email_id}` : ''}
              </div>
              <div className="flex flex-wrap gap-1.5 mt-2">
                {selected.industry && <span className="badge bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400">{selected.industry}</span>}
                {selected.opportunity_amount && <span className="badge bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400">{selected.currency} {Number(selected.opportunity_amount).toLocaleString()}</span>}
                {selected.status && <span className="badge bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400">{selected.status}</span>}
              </div>
            </div>
            <button onClick={clear} className="text-gray-400 hover:text-red-500 transition-colors shrink-0"><X size={16} /></button>
          </div>
        ) : (
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              {searching ? <Spinner size="sm" /> : <Search size={16} />}
            </div>
            <input value={query} onChange={e => onQueryChange(e.target.value)}
              placeholder={`Search ${searchType}s by company name…`} className="input pl-9" />
            {results.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 card rounded-xl shadow-xl z-20 overflow-hidden border border-gray-200 dark:border-gray-700 max-h-72 overflow-y-auto">
                {results.map(r => (
                  <button key={r.name} onClick={() => selectRecord(r)}
                    className="flex items-center gap-3 w-full px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 text-left border-b border-gray-100 dark:border-gray-800 last:border-0">
                    <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-sm font-semibold text-gray-600 dark:text-gray-400 shrink-0">
                      {(r.company_name || r.lead_name || '?')[0].toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-900 dark:text-white truncate">{r.company_name || r.lead_name}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">{r.lead_name || r.party_name} · {r.status}</div>
                    </div>
                    {(r.opportunity_amount || r.expected_revenue) && (
                      <span className="text-xs font-mono text-green-600 dark:text-green-400 shrink-0">
                        {r.currency} {Number(r.opportunity_amount || r.expected_revenue).toLocaleString()}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Client details */}
      <div className="card p-5 rounded-2xl space-y-4">
        <p className="label">Client Details</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Company Name" required>
            <div className="relative">
              <Building2 size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input value={data.client_name || ''} onChange={e => onChange({ client_name: e.target.value })}
                placeholder="Acme Manufacturing Ltd" className="input pl-9" />
            </div>
          </Field>
          <Field label="Contact Name">
            <div className="relative">
              <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input value={data.contact_name || ''} onChange={e => onChange({ contact_name: e.target.value })}
                placeholder="John Smith" className="input pl-9" />
            </div>
          </Field>
          <Field label="Email">
            <div className="relative">
              <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input type="email" value={data.contact_email || ''} onChange={e => onChange({ contact_email: e.target.value })}
                placeholder="john@acme.com" className="input pl-9" />
            </div>
          </Field>
          <Field label="Phone">
            <div className="relative">
              <Phone size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input value={data.contact_phone || ''} onChange={e => onChange({ contact_phone: e.target.value })}
                placeholder="+91 98765 43210" className="input pl-9" />
            </div>
          </Field>
          <Field label="Website">
            <div className="relative">
              <Globe size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input value={data.website || ''} onChange={e => onChange({ website: e.target.value })}
                placeholder="www.acme.com" className="input pl-9" />
            </div>
          </Field>
          <Field label="City">
            <div className="relative">
              <MapPin size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input value={data.city || ''} onChange={e => onChange({ city: e.target.value })}
                placeholder="Mumbai" className="input pl-9" />
            </div>
          </Field>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Field label="Industry" required>
            <select value={data.industry || ''} onChange={e => onChange({ industry: e.target.value })} className="input">
              <option value="">Select industry</option>
              {industries.map(i => <option key={i.name} value={i.name}>{i.name}</option>)}
            </select>
          </Field>
          <Field label="Country">
            <input value={data.country || ''} onChange={e => onChange({ country: e.target.value })}
              placeholder="India" className="input" />
          </Field>
          <Field label="Currency">
            <select value={data.currency || 'USD'} onChange={e => onChange({ currency: e.target.value })} className="input">
              {['USD','EUR','GBP','INR','AED','SAR','OMR','QAR','KWD','BHD','SGD','MYR'].map(c => <option key={c}>{c}</option>)}
            </select>
          </Field>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="No. of Employees">
            <select value={data.no_of_employees || ''} onChange={e => onChange({ no_of_employees: e.target.value })} className="input">
              <option value="">Select range</option>
              {['1-10','11-50','51-200','201-500','501-1000','1000+'].map(r => <option key={r}>{r}</option>)}
            </select>
          </Field>
          <Field label="Annual Revenue">
            <input type="number" value={data.annual_revenue || ''} onChange={e => onChange({ annual_revenue: e.target.value })}
              placeholder="5000000" className="input" />
          </Field>
        </div>
        {data.crm_notes && (
          <Field label="CRM Notes (fetched)">
            <textarea value={data.crm_notes} onChange={e => onChange({ crm_notes: e.target.value })}
              rows={2} className="input text-xs leading-relaxed resize-none" />
          </Field>
        )}
      </div>

      {/* Proposal meta */}
      <div className="card p-5 rounded-2xl space-y-4">
        <p className="label">Proposal Meta</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Proposal Title" required>
            <input value={data.proposal_title || ''} onChange={e => onChange({ proposal_title: e.target.value })}
              placeholder="ERPNext Implementation for Acme Ltd" className="input" />
          </Field>
          <Field label="Prepared By">
            <input value={data.prepared_by || ''} onChange={e => onChange({ prepared_by: e.target.value })}
              placeholder="Sales Team / Your Name" className="input" />
          </Field>
          <Field label="Valid Until">
            <input type="date" value={data.valid_until || ''} onChange={e => onChange({ valid_until: e.target.value })} className="input" />
          </Field>
          <Field label="Internal Notes">
            <input value={data.internal_notes || ''} onChange={e => onChange({ internal_notes: e.target.value })}
              placeholder="Private — not shown to client" className="input" />
          </Field>
        </div>
      </div>
    </div>
  )
}
