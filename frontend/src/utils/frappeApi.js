import { useFrappeGetDocList, useFrappeGetDoc } from 'frappe-react-sdk'

// ─── CSRF Token — 5-source priority chain ─────────────────────────────────────
//
// Priority order (highest → lowest):
//  1. window.frappe.csrf_token        set by www/proposal/*.html via Jinja
//  2. window.csrf_token               fallback set by older templates
//  3. window.frappe.boot.csrf_token   set via boot data
//  4. Cookie 'csrf_token'             set by Frappe on every authenticated request
//  5. Header X-Frappe-CSRF-Token=fetch  tells Frappe to read from cookie itself
//
// The 'fetch' sentinel (#5) is important: when Frappe sees "fetch" as the header
// value it looks up the CSRF token from the session cookie automatically.
// This is safe and is the documented fallback for SPA usage.
//
function getCsrfToken() {
  try {
    // 1. Injected directly by www page via Jinja (most reliable)
    if (window.frappe?.csrf_token && window.frappe.csrf_token !== 'None') {
      return window.frappe.csrf_token
    }

    // 2. window.csrf_token (some Frappe page templates set this)
    if (window.csrf_token && window.csrf_token !== 'None') {
      return window.csrf_token
    }

    // 3. Boot data
    if (window.frappe?.boot?.csrf_token) {
      return window.frappe.boot.csrf_token
    }

    // 4. Cookie (Frappe sets 'csrf_token' cookie on login — NOT httponly)
    const cookieMatch = document.cookie.match(/(?:^|;\s*)csrf_token=([^;]+)/)
    if (cookieMatch && cookieMatch[1] && cookieMatch[1] !== 'None') {
      return decodeURIComponent(cookieMatch[1])
    }
  } catch (_) {}

  // 5. 'fetch' — Frappe reads the token from the session cookie server-side
  //    This always works for authenticated browser sessions.
  return 'fetch'
}

// ─── Generic POST wrapper ─────────────────────────────────────────────────────
async function frappecall(method, args = {}) {
  const token = getCsrfToken()

  const res = await fetch('/api/method/' + method, {
    method: 'POST',
    credentials: 'include',   // CRITICAL: sends session cookies cross-origin
    headers: {
      'Content-Type': 'application/json',
      'X-Frappe-CSRF-Token': token,
    },
    body: JSON.stringify(args),
  })

  // Parse response regardless of status (Frappe errors are in JSON body)
  const data = await res.json().catch(() => ({}))

  if (res.status === 403) {
    // CSRF or auth failure — log useful debug info
    console.error('[QI] Auth/CSRF error. CSRF token used:', token)
    console.error('[QI] window.frappe.csrf_token:', window.frappe?.csrf_token)
    console.error('[QI] Cookies:', document.cookie)
    throw new Error('Not authorised. Please log in to Frappe and refresh this page.')
  }

  if (!res.ok) {
    const msg = data?._server_messages
      ? (() => { try { return JSON.parse(data._server_messages)[0]?.message } catch { return null } })()
      : null
    throw new Error(msg || `API error ${res.status}`)
  }

  if (data.exc) {
    const msg = data.exc_type
      || (() => { try { return JSON.parse(data._server_messages)?.[0]?.message } catch { return null } })()
      || 'Server error'
    throw new Error(msg)
  }

  return data.message
}

// ─── Prompt Config API ────────────────────────────────────────────────────────
export const PromptConfigAPI = {
  list:       (industry_id) => frappecall('quotation_intelligence.api.prompt_config.get_list', { industry_id }),
  get:        (name)        => frappecall('quotation_intelligence.api.prompt_config.get', { name }),
  save:       (doc)         => frappecall('quotation_intelligence.api.prompt_config.save', { doc: JSON.stringify(doc) }),
  delete:     (name)        => frappecall('quotation_intelligence.api.prompt_config.delete_doc', { name }),
  set_default:(name)        => frappecall('quotation_intelligence.api.prompt_config.set_default', { name }),
}

// ─── AI Provider API ──────────────────────────────────────────────────────────
export const AIProviderAPI = {
  list:       ()    => frappecall('quotation_intelligence.api.ai_provider.get_list'),
  save:       (doc) => frappecall('quotation_intelligence.api.ai_provider.save', { doc: JSON.stringify(doc) }),
  delete:     (name)=> frappecall('quotation_intelligence.api.ai_provider.delete_doc', { name }),
  get_active: ()    => frappecall('quotation_intelligence.api.ai_provider.get_active'),
}

// ─── CRM API ──────────────────────────────────────────────────────────────────
export const CrmAPI = {
  search_leads:        (query) => frappecall('quotation_intelligence.api.crm.search_leads', { query }),
  search_opportunities:(query) => frappecall('quotation_intelligence.api.crm.search_opportunities', { query }),
  get_lead:            (name)  => frappecall('quotation_intelligence.api.crm.get_lead', { name }),
  get_opportunity:     (name)  => frappecall('quotation_intelligence.api.crm.get_opportunity', { name }),
  get_customer:        (name)  => frappecall('quotation_intelligence.api.crm.get_customer', { name }),
}

// ─── Proposal API ─────────────────────────────────────────────────────────────
export const ProposalAPI = {
  save:         (doc)               => frappecall('quotation_intelligence.api.proposal.save', { doc: JSON.stringify(doc) }),
  get:          (name)              => frappecall('quotation_intelligence.api.proposal.get', { name }),
  list:         (filters = {})      => frappecall('quotation_intelligence.api.proposal.get_list', { filters: JSON.stringify(filters) }),
  log_event:    (proposal_name, ev) => frappecall('quotation_intelligence.api.proposal.log_event', { proposal_name, event: JSON.stringify(ev) }),
  update_status:(name, status)      => frappecall('quotation_intelligence.api.proposal.update_status', { name, status }),
}

// ─── React hooks (frappe-react-sdk) ──────────────────────────────────────────
// These use the FrappeProvider context set up in main.jsx.
// They handle auth and CSRF via the SDK's own mechanism.

export function useIndustries() {
  const { data, error, isLoading } = useFrappeGetDocList('Industry Type', {
    fields: ['name'],
    limit: 0,
    orderBy: { field: 'name', order: 'asc' },
  })
  return { industries: data || [], isLoading, error }
}

export function useAIProviders() {
  const { data, isLoading, error, mutate } = useFrappeGetDocList('QI AI Provider', {
    fields: ['name', 'provider_id', 'model_id', 'is_active', 'base_url', 'model_endpoint', 'auth_header', 'notes'],
    limit: 0,
  })
  return { providers: data || [], isLoading, error, mutate }
}

export function usePromptConfigs(industryId) {
  const { data, isLoading, error, mutate } = useFrappeGetDocList('QI Prompt Config', {
    filters: industryId ? [['industry_id', '=', industryId]] : [],
    fields: ['name', 'industry_id', 'version_label', 'is_default', 'tone', 'primary_color', 'accent_color'],
    limit: 50,
    enabled: !!industryId,
  })
  return { configs: data || [], isLoading, error, mutate }
}

export function usePromptConfig(name) {
  const { data, isLoading, error, mutate } = useFrappeGetDoc('QI Prompt Config', name, { enabled: !!name })
  return { config: data, isLoading, error, mutate }
}