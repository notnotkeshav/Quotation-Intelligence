import { useState, useEffect } from 'react'
import { Check, ChevronLeft, ChevronRight } from 'lucide-react'
import { ThemeToggle, ToastContainer, useToast, toast } from '../components/shared/ui'
import StepClient     from '../components/steps/StepClient'
import StepScope      from '../components/steps/StepScope'
import StepCommercial from '../components/steps/StepCommercial'
import StepAIConfig   from '../components/steps/StepAIConfig'
import StepGenerate   from '../components/steps/StepGenerate'

const STEPS = [
  { id: 'client',     label: 'Client',     desc: 'CRM + contact details' },
  { id: 'scope',      label: 'Scope',      desc: 'Products & modules'    },
  { id: 'commercial', label: 'Commercial', desc: 'Pricing & timeline'    },
  { id: 'ai_config',  label: 'AI Config',  desc: 'Tone & instructions'   },
  { id: 'generate',   label: 'Generate',   desc: 'Build proposal'        },
]

function StepNav({ activeStep, visitedSteps, onStepClick }) {
  return (
    <div className="hidden lg:flex flex-col gap-1 w-52 shrink-0">
      {STEPS.map((step, i) => {
        const isActive = activeStep === i
        const isDone   = visitedSteps.has(i) && !isActive
        return (
          <button key={step.id}
            onClick={() => visitedSteps.has(i) && onStepClick(i)}
            disabled={!visitedSteps.has(i) && !isActive}
            className={`flex items-center gap-3 p-3 rounded-xl text-left transition-all ${
              isActive
                ? 'bg-[#1591AB]/10 dark:bg-[#1591AB]/15 border border-[#1591AB]/30'
                : isDone
                ? 'hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer'
                : 'opacity-40 cursor-not-allowed'
            }`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold shrink-0 transition-all text-sm ${
              isActive
                ? 'bg-[#1591AB] text-white shadow-lg shadow-[#1591AB]/30'
                : isDone
                ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-400'
            }`}>
              {isDone ? <Check size={14} /> : <span>{i + 1}</span>}
            </div>
            <div>
              <div className={`text-sm font-medium ${isActive ? 'text-[#1591AB]' : 'text-gray-700 dark:text-gray-300'}`}>
                {step.label}
              </div>
              <div className="text-xs text-gray-400 dark:text-gray-500">{step.desc}</div>
            </div>
          </button>
        )
      })}
    </div>
  )
}

const INITIAL = {
  currency: 'USD',
  pricing_items: [],
  erpnext_modules: [],
  phases: [],
  product: 'Frappe ERPNext',
}

export default function CreatePage() {
  const [activeStep,    setActiveStep]    = useState(0)
  const [visitedSteps,  setVisitedSteps]  = useState(new Set([0]))
  const [formData,      setFormData]      = useState(INITIAL)
  const { toasts, remove } = useToast()

  // Listen for toast events from child components
  useEffect(() => {
    const fn = (e) => toast(e.detail.message, e.detail.type)
    window.addEventListener('qi-toast', fn)
    return () => window.removeEventListener('qi-toast', fn)
  }, [])

  function update(patch)  { setFormData(d => ({ ...d, ...patch })) }

  function goNext() {
    const next = activeStep + 1
    setActiveStep(next)
    setVisitedSteps(v => new Set([...v, next]))
  }
  function goPrev() { setActiveStep(s => Math.max(0, s - 1)) }

  function canProceed() {
    if (activeStep === 0) return !!(formData.client_name && formData.industry)
    if (activeStep === 1) return !!formData.product
    return true
  }

  const STEP_COMPONENTS = [
    <StepClient     key="client"     data={formData} onChange={update} />,
    <StepScope      key="scope"      data={formData} onChange={update} />,
    <StepCommercial key="commercial" data={formData} onChange={update} />,
    <StepAIConfig   key="ai"         data={formData} onChange={update} />,
    <StepGenerate   key="generate"   data={formData} onChange={update} />,
  ]

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <ToastContainer toasts={toasts} remove={remove} />

      {/* Topbar */}
      <div className="sticky top-0 z-30 bg-white/80 dark:bg-gray-950/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <a href="/proposal/settings"
              className="w-8 h-8 rounded-lg brand-gradient flex items-center justify-center text-white font-bold shadow-lg text-sm hover:opacity-90 transition-opacity">
              Q
            </a>
            <div>
              <span className="font-bold text-gray-900 dark:text-white text-sm">Quotation Intelligence</span>
              <span className="text-gray-400 dark:text-gray-500 text-xs ml-2">/ New Proposal</span>
            </div>
          </div>
          {/* Mobile step indicator */}
          <div className="flex items-center gap-3 lg:hidden">
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {activeStep + 1} / {STEPS.length}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <a href="/proposal/settings" className="btn-ghost text-xs py-1.5 px-3 hidden sm:flex">Settings</a>
            <ThemeToggle />
          </div>
        </div>
        {/* Progress bar */}
        <div className="h-0.5 bg-gray-200 dark:bg-gray-800">
          <div className="h-full bg-[#1591AB] transition-all duration-500"
            style={{ width: `${((activeStep + 1) / STEPS.length) * 100}%` }} />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex gap-8">
          <StepNav activeStep={activeStep} visitedSteps={visitedSteps} onStepClick={setActiveStep} />

          <div className="flex-1 min-w-0">
            {STEP_COMPONENTS[activeStep]}

            {/* Action bar */}
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200 dark:border-gray-800">
              <button onClick={goPrev} disabled={activeStep === 0}
                className="btn-ghost disabled:opacity-0 disabled:pointer-events-none">
                <ChevronLeft size={16} /> Back
              </button>

              {/* Dot indicators */}
              <div className="flex items-center gap-1.5">
                {STEPS.map((_, i) => (
                  <div key={i} className={`rounded-full transition-all duration-300 ${
                    i === activeStep
                      ? 'w-6 h-2 bg-[#1591AB]'
                      : visitedSteps.has(i)
                      ? 'w-2 h-2 bg-[#1591AB]/40'
                      : 'w-2 h-2 bg-gray-300 dark:bg-gray-700'
                  }`} />
                ))}
              </div>

              {activeStep < STEPS.length - 1 ? (
                <button onClick={goNext} disabled={!canProceed()} className="btn-primary">
                  {!canProceed() && activeStep === 0
                    ? 'Fill required fields'
                    : 'Continue'
                  }
                  <ChevronRight size={16} />
                </button>
              ) : (
                <div className="w-24" /> /* spacer to keep dots centered */
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
