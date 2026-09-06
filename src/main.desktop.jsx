import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import AuthGate from './AuthGate.jsx'
import Dashboard from './Dashboard.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthGate>
      {(session) => <Dashboard session={session} />}
    </AuthGate>
  </StrictMode>,
)
