import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { TemaProvider } from './context/TemaContext'
import { CategoriasProvider } from './context/CategoriasContext'
import { GruposProvider } from './context/GruposContext'
import App from './App'

// Orden de estilos: variables → base → layout → componentes
import './styles/variables.css'
import './styles/base.css'
import './styles/layout.css'
import './styles/components.css'
import './styles/landing.css'
import './styles/app.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <TemaProvider>
      <BrowserRouter>
        <AuthProvider>
          <CategoriasProvider>
            <GruposProvider>
              <App />
            </GruposProvider>
          </CategoriasProvider>
        </AuthProvider>
      </BrowserRouter>
    </TemaProvider>
  </StrictMode>,
)
