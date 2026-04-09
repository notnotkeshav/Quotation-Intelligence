// ─── AI Provider registry ─────────────────────────────────────────────────────
// This is the client-side registry used for UI display (labels, model lists).
// The actual API credentials (key, base_url, etc.) are stored in Frappe's
// QI AI Provider doctype and fetched via AIProviderAPI.get_active().

export const AI_PROVIDERS = {
  openrouter: {
    id: 'openrouter',
    label: 'OpenRouter',
    default_base_url: 'https://openrouter.ai/api/v1/chat/completions',
    default_auth_header: 'Authorization',   // value sent as "Bearer <key>"
    default_model_endpoint: '/chat/completions',
    models: [
      { id: 'anthropic/claude-sonnet-4',          label: 'Claude Sonnet 4' },
      { id: 'anthropic/claude-3.5-haiku',         label: 'Claude 3.5 Haiku' },
      { id: 'openai/gpt-4o',                      label: 'GPT-4o' },
      { id: 'google/gemini-2.0-flash-001',        label: 'Gemini 2.0 Flash' },
      { id: 'meta-llama/llama-3.3-70b-instruct',  label: 'Llama 3.3 70B' },
      { id: 'deepseek/deepseek-chat-v3-0324',     label: 'DeepSeek V3' },
    ],
    default_model_id: 'anthropic/claude-sonnet-4',
    docs_url: 'https://openrouter.ai/keys',
    extra_headers: {
      'HTTP-Referer': typeof window !== 'undefined' ? window.location.origin : 'https://extensionerp.com',
      'X-Title': 'Quotation Intelligence',
    },
  },
  groq: {
    id: 'groq',
    label: 'Groq',
    default_base_url: 'https://api.groq.com/openai/v1/chat/completions',
    default_auth_header: 'Authorization',
    default_model_endpoint: '/chat/completions',
    models: [
      { id: 'llama-3.3-70b-versatile',   label: 'Llama 3.3 70B' },
      { id: 'llama-3.1-8b-instant',      label: 'Llama 3.1 8B (fast)' },
      { id: 'mixtral-8x7b-32768',        label: 'Mixtral 8x7B' },
      { id: 'gemma2-9b-it',              label: 'Gemma2 9B' },
    ],
    default_model_id: 'llama-3.3-70b-versatile',
    docs_url: 'https://console.groq.com/keys',
    extra_headers: {},
  },
  anthropic: {
    id: 'anthropic',
    label: 'Anthropic (Direct)',
    default_base_url: 'https://api.anthropic.com/v1/messages',
    default_auth_header: 'x-api-key',    // Anthropic uses x-api-key, not Bearer
    default_model_endpoint: '/messages',
    models: [
      { id: 'claude-sonnet-4-20250514',     label: 'Claude Sonnet 4' },
      { id: 'claude-haiku-4-5-20251001',    label: 'Claude Haiku 4.5' },
    ],
    default_model_id: 'claude-sonnet-4-20250514',
    docs_url: 'https://console.anthropic.com/keys',
    extra_headers: { 'anthropic-version': '2023-06-01' },
    is_native: true,  // uses Anthropic message format, not OpenAI-compatible
  },
  openai: {
    id: 'openai',
    label: 'OpenAI',
    default_base_url: 'https://api.openai.com/v1/chat/completions',
    default_auth_header: 'Authorization',
    default_model_endpoint: '/chat/completions',
    models: [
      { id: 'gpt-4o',      label: 'GPT-4o' },
      { id: 'gpt-4o-mini', label: 'GPT-4o Mini' },
      { id: 'o3-mini',     label: 'o3-mini' },
    ],
    default_model_id: 'gpt-4o',
    docs_url: 'https://platform.openai.com/api-keys',
    extra_headers: {},
  },
}

export const PROVIDER_IDS = ['openrouter', 'groq', 'anthropic', 'openai']

// ─── Call AI using provider config from Frappe ────────────────────────────────
// provider_config = record returned by AIProviderAPI.get_active():
//   { provider_id, api_key, model_id, base_url, model_endpoint, auth_header }
export async function callAI({ provider_config, system_prompt, user_prompt, max_tokens = 4000 }) {
  if (!provider_config?.api_key) throw new Error('No active AI provider configured.')

  const def = AI_PROVIDERS[provider_config.provider_id] || {}
  const url        = provider_config.base_url       || def.default_base_url
  const authHeader = provider_config.auth_header    || def.default_auth_header || 'Authorization'
  const modelId    = provider_config.model_id       || def.default_model_id
  const isNative   = def.is_native

  if (!url) throw new Error(`No base_url configured for provider "${provider_config.provider_id}"`)

  // Build auth header value
  const authValue = authHeader.toLowerCase() === 'authorization'
    ? `Bearer ${provider_config.api_key}`
    : provider_config.api_key

  const headers = {
    'Content-Type': 'application/json',
    [authHeader]: authValue,
    ...(def.extra_headers || {}),
  }

  let body
  if (isNative) {
    // Anthropic native format
    body = { model: modelId, max_tokens, system: system_prompt, messages: [{ role: 'user', content: user_prompt }] }
  } else {
    // OpenAI-compatible (OpenRouter, Groq, OpenAI)
    body = { model: modelId, max_tokens, messages: [{ role: 'system', content: system_prompt }, { role: 'user', content: user_prompt }] }
  }

  const res = await fetch(url, { method: 'POST', headers, body: JSON.stringify(body) })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err?.error?.message || `AI API error ${res.status}`)
  }

  const data = await res.json()
  return isNative
    ? (data.content?.[0]?.text || '')
    : (data.choices?.[0]?.message?.content || '')
}
