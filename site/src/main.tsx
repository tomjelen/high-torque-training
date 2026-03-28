import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '../node_modules/@picocss/pico/css/pico.min.css'
import './theme.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
