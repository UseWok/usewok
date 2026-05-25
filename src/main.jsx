import React from 'react'
import ReactDOM from 'react-dom/client'
import App from '@/App.jsx'
import '@/index.css'
import { initTheme } from '@/lib/theme'

// Always-dark: force the class so CSS vars are always the dark palette
document.documentElement.classList.add('dark')
initTheme()

ReactDOM.createRoot(document.getElementById('root')).render(
  <App />
)