import SettingsPage from './pages/SettingsPage.jsx'
import CreatePage   from './pages/CreatePage.jsx'
import './index.css'

function Router() {
  const path = window.location.pathname
  if (path.includes('/proposal/settings') || path === '/settings') return <SettingsPage />
  if (path.includes('/proposal/create')   || path === '/create')   return <CreatePage />

  // Landing — dev mode
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
      <div className="text-center space-y-6 p-8">
        <div className="w-16 h-16 rounded-2xl brand-gradient flex items-center justify-center text-white text-2xl font-bold shadow-xl mx-auto">
          Q
        </div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Quotation Intelligence</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm max-w-xs">
          AI-powered proposal generation for Frappe ERPNext
        </p>
        <div className="flex gap-4 justify-center">
          <a href="/proposal/settings" className="btn-primary px-6 py-3">Settings</a>
          <a href="/proposal/create"   className="btn-ghost  px-6 py-3">New Proposal</a>
        </div>
        <p className="text-xs text-gray-400 dark:text-gray-600">Standalone / dev mode</p>
      </div>
    </div>
  )
}
export default function App() {
  return (
      <Router />
  )
}