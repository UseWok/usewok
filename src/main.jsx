import React from 'react'
import ReactDOM from 'react-dom/client'
import App from '@/App.jsx'
import '@/index.css'
import { initTheme } from '@/lib/theme'

// Light theme — remove dark class if previously set
document.documentElement.classList.remove('dark')
initTheme()

ReactDOM.createRoot(document.getElementById('root')).render(
  <App />
)