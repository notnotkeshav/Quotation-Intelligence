import { useState, useEffect } from 'react'
import { Sun, Moon, X, Check, AlertCircle, Info, CheckCircle, Loader2 } from 'lucide-react'

// ─── Theme Toggle ─────────────────────────────────────────────────────────────
export function ThemeToggle() {
  const [isDark, setIsDark] = useState(
    () => document.documentElement.classList.contains('dark')
  )

  function toggle() {
    const next = !isDark
    setIsDark(next)
    if (next) {
      document.documentElement.classList.add('dark')
      localStorage.setItem('qi-theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('qi-theme', 'light')
    }
  }

  return (
    <button
      onClick={toggle}
      className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-600 dark:text-gray-400"
      aria-label="Toggle theme"
    >
      {isDark ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  )
}

// ─── Spinner ──────────────────────────────────────────────────────────────────
export function Spinner({ size = 'md', className = '' }) {
  const px = { sm: 16, md: 20, lg: 28 }[size]
  return <Loader2 size={px} className={`animate-spin text-[#1591AB] ${className}`} />
}

// ─── Toast system ─────────────────────────────────────────────────────────────
let _addToast = null

export function useToast() {
  const [toasts, setToasts] = useState([])

  useEffect(() => {
    _addToast = (message, type = 'info') => {
      const id = Date.now() + Math.random()
      setToasts(prev => [...prev, { id, message, type }])
      setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4500)
    }
    return () => { _addToast = null }
  }, [])

  const remove = (id) => setToasts(prev => prev.filter(t => t.id !== id))
  return { toasts, remove }
}

export function toast(message, type = 'info') {
  if (_addToast) { _addToast(message, type); return }
  // Fallback via custom event
  window.dispatchEvent(new CustomEvent('qi-toast', { detail: { message, type } }))
}

export function ToastContainer({ toasts, remove }) {
  const icons = {
    success: <CheckCircle size={16} className="text-green-500 shrink-0" />,
    error:   <AlertCircle size={16} className="text-red-500 shrink-0" />,
    warning: <AlertCircle size={16} className="text-amber-500 shrink-0" />,
    info:    <Info        size={16} className="text-[#1591AB] shrink-0" />,
  }
  const borders = {
    success: 'border-l-green-500',
    error:   'border-l-red-500',
    warning: 'border-l-amber-500',
    info:    'border-l-[#1591AB]',
  }

  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none max-w-sm w-full">
      {toasts.map(t => (
        <div key={t.id}
          className={`card border-l-4 ${borders[t.type] || borders.info} px-4 py-3 shadow-lg
                      flex items-center gap-3 pointer-events-auto`}
        >
          {icons[t.type] || icons.info}
          <span className="text-sm text-gray-800 dark:text-gray-200 flex-1">{t.message}</span>
          <button onClick={() => remove(t.id)}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 shrink-0">
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  )
}

// ─── Modal ────────────────────────────────────────────────────────────────────
export function Modal({ isOpen, onClose, title, children, width = 'max-w-2xl' }) {
  useEffect(() => {
    const fn = (e) => e.key === 'Escape' && onClose()
    if (isOpen) document.addEventListener('keydown', fn)
    return () => document.removeEventListener('keydown', fn)
  }, [isOpen, onClose])

  if (!isOpen) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative w-full ${width} card shadow-2xl max-h-[90vh] flex flex-col`}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-800 shrink-0">
          <h3 className="font-semibold text-gray-900 dark:text-white">{title}</h3>
          <button onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors">
            <X size={18} />
          </button>
        </div>
        <div className="overflow-y-auto flex-1 p-6">{children}</div>
      </div>
    </div>
  )
}

// ─── Confirm dialog ───────────────────────────────────────────────────────────
export function useConfirm() {
  const [state, setState] = useState(null)
  const confirm = (message) => new Promise(resolve =>
    setState({ message, resolve })
  )
  const handleClose = (val) => { state?.resolve(val); setState(null) }
  const Dialog = state ? (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={() => handleClose(false)} />
      <div className="relative card p-6 max-w-sm w-full shadow-2xl">
        <p className="text-gray-800 dark:text-gray-200 mb-6">{state.message}</p>
        <div className="flex gap-3 justify-end">
          <button className="btn-ghost" onClick={() => handleClose(false)}>Cancel</button>
          <button className="btn-danger"  onClick={() => handleClose(true)}>Delete</button>
        </div>
      </div>
    </div>
  ) : null
  return { confirm, Dialog }
}

// ─── Empty state ──────────────────────────────────────────────────────────────
export function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      {Icon && (
        <div className="w-14 h-14 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
          <Icon size={26} className="text-gray-400 dark:text-gray-500" />
        </div>
      )}
      <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{title}</h3>
      {description && <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 max-w-xs">{description}</p>}
      {action}
    </div>
  )
}

// ─── Color picker ─────────────────────────────────────────────────────────────
export function ColorPicker({ label, value, onChange }) {
  return (
    <div className="flex items-center gap-3">
      {label && <span className="label w-20 mb-0">{label}</span>}
      <input type="color" value={value} onChange={e => onChange(e.target.value)}
        className="w-9 h-9 rounded-lg border border-gray-300 dark:border-gray-600 cursor-pointer bg-transparent p-0.5" />
      <input type="text" value={value} onChange={e => onChange(e.target.value)}
        className="input w-28 font-mono text-xs" />
    </div>
  )
}

// ─── Section category badge ───────────────────────────────────────────────────
export function SectionBadge({ category }) {
  const map = {
    core:       'bg-blue-100   text-blue-700   dark:bg-blue-900/20   dark:text-blue-400',
    technical:  'bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400',
    planning:   'bg-green-100  text-green-700  dark:bg-green-900/20  dark:text-green-400',
    resources:  'bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400',
    commercial: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400',
    value:      'bg-teal-100   text-teal-700   dark:bg-teal-900/20   dark:text-teal-400',
    proof:      'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-400',
    legal:      'bg-gray-100   text-gray-700   dark:bg-gray-800      dark:text-gray-400',
    closing:    'bg-pink-100   text-pink-700   dark:bg-pink-900/20   dark:text-pink-400',
  }
  return (
    <span className={`badge text-[10px] ${map[category] || map.core}`}>{category}</span>
  )
}

// ─── Field row helper ─────────────────────────────────────────────────────────
export function Field({ label, children, required }) {
  return (
    <div>
      <label className="label">
        {label} {required && <span className="text-red-400 normal-case font-normal">*</span>}
      </label>
      {children}
    </div>
  )
}
