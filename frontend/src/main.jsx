import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { FrappeProvider } from 'frappe-react-sdk'
import './index.css'
import App from './App'

  // ── Synchronous theme init (also in index.html — belt-and-suspenders) ─────────
  ; (function () {
    try {
      const saved = localStorage.getItem('qi-theme')
      if (saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }
    } catch (_) { }
  })()

// ── FrappeProvider setup ───────────────────────────────────────────────────────
// url: always the current origin — works in both dev (proxy) and prod (Frappe)
// tokenParams: empty means use cookie/session-based auth (browser session)
//              set to { useToken: true, token: ... } only for API token auth
const FRAPPE_URL = window.location.origin

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <FrappeProvider
      url={FRAPPE_URL}
      tokenParams={{}}
      sitename={import.meta.env.VITE_SITENAME}
      socketPort={window.frappe?.boot?.socketio_port || import.meta.env.VITE_SOCKET_PORT || undefined}
    >
      <App />
    </FrappeProvider>
  </StrictMode>,
)