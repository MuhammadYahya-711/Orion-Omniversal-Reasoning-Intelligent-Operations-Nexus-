import './storageFallback'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './styles/main.css'
import AppErrorBoundary from './components/AppErrorBoundary'

createRoot(document.getElementById('root')!).render(<AppErrorBoundary><App /></AppErrorBoundary>)
