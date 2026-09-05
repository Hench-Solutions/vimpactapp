import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Apply saved theme before first paint so Classic/Modern tokens match toggle.
const visual = localStorage.getItem('vimpactapp:visual')
if (visual === 'green') document.documentElement.setAttribute('data-visual', 'green')
else document.documentElement.removeAttribute('data-visual')

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
