import { useState, useEffect } from 'react'
import { Settings, Bot, ChevronRight, ChevronLeft, RefreshCw } from 'lucide-react'
import { ThemeToggle, ToastContainer, useToast, toast, useConfirm } from '../components/shared/ui'
import { useIndustries, useAIProviders, AIProviderAPI, PromptConfigAPI } from '../utils/frappeApi'
import { getDefaultPromptConfig } from '../config/industries'
import IndustryGrid from '../components/industry/IndustryGrid'
import ConfigList from '../components/prompt/ConfigList'
import ConfigModal from '../components/prompt/ConfigModal'
import ProviderCard from '../components/ai/ProviderCard'
import ProviderModal from '../components/ai/ProviderModal'

const MAIN_TABS = [
  { id: 'industries', label: 'Industry Prompts', Icon: Settings },
  { id: 'ai',         label: 'AI Providers',     Icon: Bot      },
]

export default function SettingsPage() {
  const { industries, isLoading: loadingIndustries } = useIndustries()
  const { providers,  isLoading: loadingProviders, mutate: mutateProviders } = useAIProviders()
  const { toasts, remove } = useToast()
  const { confirm, Dialog: ConfirmDialog } = useConfirm()

  const [mainTab,          setMainTab]          = useState('industries')
  const [selectedIndustry, setSelectedIndustry] = useState(null)   // { name }
  const [configs,          setConfigs]          = useState([])
  const [loadingConfigs,   setLoadingConfigs]   = useState(false)
  const [editingConfig,    setEditingConfig]    = useState(null)

  const [providerModal,    setProviderModal]    = useState(false)
  const [selectedProvider, setSelectedProvider] = useState(null)

  // Load configs when industry changes
  useEffect(() => {
    if (!selectedIndustry) return
    loadConfigs(selectedIndustry.name)
  }, [selectedIndustry])

  async function loadConfigs(industryId) {
    setLoadingConfigs(true)
    try {
      const list = await PromptConfigAPI.list(industryId)
      setConfigs(list || [])
    } catch (e) {
      toast(e.message, 'error')
    }
    setLoadingConfigs(false)
  }

  function handleSelectIndustry(industry) {
    setSelectedIndustry(industry)
  }

  function handleNewConfig() {
    setEditingConfig({
      ...getDefaultPromptConfig(selectedIndustry.name),
      industry_id: selectedIndustry.name,
      name: null,
    })
  }

  async function handleSaveConfig(doc) {
    try {
      await PromptConfigAPI.save(doc)
      toast('Prompt config saved', 'success')
      setEditingConfig(null)
      loadConfigs(selectedIndustry.name)
    } catch (e) {
      toast(e.message, 'error')
    }
  }

  async function handleDeleteConfig(c) {
    const ok = await confirm(`Delete "${c.version_label}"? This cannot be undone.`)
    if (!ok) return
    try {
      await PromptConfigAPI.delete(c.name)
      toast('Deleted', 'success')
      loadConfigs(selectedIndustry.name)
    } catch (e) {
      toast(e.message, 'error')
    }
  }

  async function handleSetDefault(c) {
    try {
      await PromptConfigAPI.set_default(c.name)
      toast(`"${c.version_label}" set as default`, 'success')
      loadConfigs(selectedIndustry.name)
    } catch (e) {
      toast(e.message, 'error')
    }
  }

  async function handleSaveProvider(doc) {
    try {
      await AIProviderAPI.save(doc)
      toast(doc.name ? 'Provider updated' : 'Provider added', 'success')
      setProviderModal(false)
      setSelectedProvider(null)
      mutateProviders()
    } catch (e) {
      toast(e.message, 'error')
    }
  }

  async function handleDeleteProvider(p) {
    const ok = await confirm(`Remove ${p.provider_id} provider?`)
    if (!ok) return
    try {
      await AIProviderAPI.delete(p.name)
      toast('Provider removed', 'success')
      mutateProviders()
    } catch (e) {
      toast(e.message, 'error')
    }
  }

  async function handleSetActiveProvider(p) {
    try {
      await AIProviderAPI.save({ ...p, is_active: 1 })
      toast(`${p.provider_id} set as active`, 'success')
      mutateProviders()
    } catch (e) {
      toast(e.message, 'error')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <ToastContainer toasts={toasts} remove={remove} />
      {ConfirmDialog}

      {/* Topbar */}
      <div className="sticky top-0 z-30 bg-white/80 dark:bg-gray-950/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg brand-gradient flex items-center justify-center text-white font-bold shadow-lg text-sm">Q</div>
            <div>
              <span className="font-bold text-gray-900 dark:text-white text-sm">Quotation Intelligence</span>
              <span className="text-gray-400 dark:text-gray-500 text-xs ml-2">/ Settings</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <a href="/proposal/create" className="btn-primary text-xs py-1.5 px-3">New Proposal</a>
            <ThemeToggle />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Page header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Proposal Settings</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">
            Configure industry prompt templates and manage AI provider credentials.
          </p>
        </div>

        {/* Main tab bar */}
        <div className="flex gap-1 p-1 bg-gray-100 dark:bg-gray-800/50 rounded-xl w-fit mb-8">
          {MAIN_TABS.map(({ id, label, Icon }) => (
            <button key={id} onClick={() => setMainTab(id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                mainTab === id
                  ? 'bg-white dark:bg-gray-900 text-[#1591AB] shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}>
              <Icon size={15} />{label}
            </button>
          ))}
        </div>

        {/* ── Industry Prompts tab ──────────────────────────────────────────── */}
        {mainTab === 'industries' && (
          <div className="space-y-8">
            <div>
              <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
                Select an industry to manage its prompt templates
              </p>
              {loadingIndustries ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                  {Array.from({ length: 12 }).map((_, i) => (
                    <div key={i} className="h-24 card rounded-xl animate-pulse" />
                  ))}
                </div>
              ) : (
                <IndustryGrid
                  industries={industries}
                  onSelect={handleSelectIndustry}
                  activeIndustry={selectedIndustry?.name}
                />
              )}
            </div>

            {selectedIndustry && (
              <div className="card p-6 rounded-2xl">
                <div className="flex items-center gap-3 mb-6">
                  <button onClick={() => setSelectedIndustry(null)}
                    className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors">
                    <ChevronLeft size={18} />
                  </button>
                  <div>
                    <h2 className="font-bold text-gray-900 dark:text-white">{selectedIndustry.name}</h2>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Prompt configuration versions</p>
                  </div>
                  {loadingConfigs && (
                    <RefreshCw size={15} className="animate-spin text-gray-400 ml-auto" />
                  )}
                </div>

                <ConfigList
                  configs={configs}
                  onEdit={setEditingConfig}
                  onNew={handleNewConfig}
                  onDelete={handleDeleteConfig}
                  onSetDefault={handleSetDefault}
                />
              </div>
            )}
          </div>
        )}

        {/* ── AI Providers tab ──────────────────────────────────────────────── */}
        {mainTab === 'ai' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="font-bold text-gray-900 dark:text-white">AI Provider Configuration</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                  Configure API keys. The active provider is used for all proposal generation.
                </p>
              </div>
              <button onClick={() => { setSelectedProvider(null); setProviderModal(true) }}
                className="btn-primary">
                <Bot size={15} /> Add Provider
              </button>
            </div>

            {loadingProviders ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-28 card rounded-xl animate-pulse" />
                ))}
              </div>
            ) : providers.length === 0 ? (
              <div className="card p-12 rounded-2xl text-center border-dashed">
                <Bot size={32} className="mx-auto text-gray-400 mb-3" />
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">No providers configured</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Add an AI provider to enable proposal generation</p>
                <button onClick={() => { setSelectedProvider(null); setProviderModal(true) }} className="btn-primary">
                  <Bot size={15} /> Add First Provider
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {providers.map(p => (
                  <ProviderCard
                    key={p.name}
                    provider={p}
                    onEdit={p => { setSelectedProvider(p); setProviderModal(true) }}
                    onDelete={handleDeleteProvider}
                    onSetActive={handleSetActiveProvider}
                  />
                ))}
              </div>
            )}

            {/* Active provider summary */}
            {providers.some(p => p.is_active) && (
              <div className="mt-6 p-4 card rounded-xl border-l-4 border-[#1591AB]">
                {(() => {
                  const active = providers.find(p => p.is_active)
                  return (
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      <span className="font-semibold text-[#1591AB]">Active:</span>{' '}
                      {active.provider_id} — {active.model_id || 'default model'}
                    </p>
                  )
                })()}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modals */}
      <ConfigModal
        config={editingConfig}
        onClose={() => setEditingConfig(null)}
        onSave={handleSaveConfig}
      />

      <ProviderModal
        open={providerModal}
        provider={selectedProvider}
        onClose={() => { setProviderModal(false); setSelectedProvider(null) }}
        onSave={handleSaveProvider}
      />
    </div>
  )
}
