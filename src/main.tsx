import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './app/App'
import { QueryProvider } from './app/providers/QueryProvider'
import './styles/tokens.css'
import './styles/globals.css'

createRoot(document.querySelector<HTMLDivElement>('#app')!).render(
  <StrictMode>
    <QueryProvider>
      <App />
    </QueryProvider>
  </StrictMode>,
)
