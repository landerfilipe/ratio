import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Ativa a folha de fontes carregada de forma não-bloqueante no index.html
// (substitui o antigo onload inline, que violaria a Content-Security-Policy)
document
  .querySelectorAll<HTMLLinkElement>('link[rel="stylesheet"][media="print"]')
  .forEach((link) => {
    link.media = 'all'
  })

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
